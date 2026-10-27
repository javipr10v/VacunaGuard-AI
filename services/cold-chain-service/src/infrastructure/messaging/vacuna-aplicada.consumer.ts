import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import { DescontarStockUseCase } from '../../application/use-cases/descontar-stock.use-case';

interface Mensaje {
  content: Buffer;
  fields: { redelivered: boolean };
}

const COLA = 'coldchain.vacuna-aplicada';
const EVENTO = 'vacuna.aplicada';

@Injectable()
export class VacunaAplicadaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VacunaAplicadaConsumer.name);
  private connection!: amqp.AmqpConnectionManager;
  private channel!: ChannelWrapper;

  constructor(
    private readonly config: ConfigService,
    private readonly descontar: DescontarStockUseCase,
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
    let datos: any;
    try {
      datos = JSON.parse(msg.content.toString('utf8'));
    } catch {
      this.logger.warn('Mensaje descartado: no es JSON válido');
      ch.ack(msg);
      return;
    }

    const { vacuna, lote, cantidad } = datos ?? {};
    if (
      typeof vacuna !== 'string' ||
      typeof lote !== 'string' ||
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      this.logger.warn('Mensaje descartado: faltan vacuna, lote o cantidad válidos');
      ch.ack(msg);
      return;
    }

    try {
      const r = await this.descontar.ejecutar({ vacuna, lote, cantidad });
      if (r.estado === 'DESCONTADO') {
        this.logger.log(`Stock de ${vacuna}/${lote}: quedan ${r.stockRestante}`);
      } else if (r.estado === 'LOTE_DESCONOCIDO') {
        this.logger.warn(`Lote desconocido: ${vacuna}/${lote}`);
      } else {
        this.logger.warn(`Descuento rechazado en ${vacuna}/${lote}: ${r.motivo}`);
      }
      ch.ack(msg);
    } catch (e) {
      this.logger.error(`Error al descontar stock: ${(e as Error).message}`);
      ch.nack(msg, false, !msg.fields.redelivered);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
