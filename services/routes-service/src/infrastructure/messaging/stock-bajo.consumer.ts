import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import { RegistrarAlertaStockUseCase } from '../../application/use-cases/registrar-alerta-stock.use-case';

interface Mensaje {
  content: Buffer;
  fields: { redelivered: boolean };
}

const COLA = 'routes.stock-bajo';
const EVENTO = 'stock.bajo';

@Injectable()
export class StockBajoConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StockBajoConsumer.name);
  private connection!: amqp.AmqpConnectionManager;
  private channel!: ChannelWrapper;

  constructor(
    private readonly config: ConfigService,
    private readonly registrar: RegistrarAlertaStockUseCase,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.getOrThrow<string>('RABBITMQ_URL');
    const exchange = this.config.getOrThrow<string>('RABBITMQ_EXCHANGE');

    this.connection = amqp.connect([url]);
    this.channel = this.connection.createChannel({
      setup: async (ch: any) => {
        await ch.assertExchange(exchange, 'topic', { durable: true });
        await ch.assertQueue(COLA, { durable: true });
        await ch.bindQueue(COLA, exchange, EVENTO);
        await ch.prefetch(1);
        await ch.consume(COLA, (msg: Mensaje | null) => {
          if (msg) void this.procesar(ch, msg);
        });
      },
    });
    await this.channel.waitForConnect();
    this.logger.log(`Escuchando ${EVENTO} en la cola ${COLA}`);
  }

  private async procesar(ch: any, msg: Mensaje): Promise<void> {
    let datos: unknown;
    try {
      datos = JSON.parse(msg.content.toString('utf8'));
    } catch {
      this.logger.warn('Mensaje descartado: no es JSON válido');
      ch.ack(msg);
      return;
    }
    try {
      const r = await this.registrar.ejecutar(datos);
      if (r === 'REGISTRADA') this.logger.log('Alerta de stock bajo registrada');
      else this.logger.warn('Mensaje descartado: faltan datos válidos');
      ch.ack(msg);
    } catch (e) {
      this.logger.error(`Error al registrar la alerta: ${(e as Error).message}`);
      ch.nack(msg, false, !msg.fields.redelivered);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
