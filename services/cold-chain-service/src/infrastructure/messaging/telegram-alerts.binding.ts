import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';

const COLA = 'alertas.telegram';
const EVENTO = 'temperatura.critica';

/**
 * Declara la cola que usa el flujo de n8n y la enlaza al exchange con la clave
 * temperatura.critica, para que las alertas lleguen a Telegram sin depender
 * de configuraciones manuales en la UI de RabbitMQ.
 */
@Injectable()
export class TelegramAlertsBinding implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramAlertsBinding.name);
  private connection!: amqp.AmqpConnectionManager;
  private channel!: ChannelWrapper;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.getOrThrow<string>('RABBITMQ_URL');
    const exchange = this.config.getOrThrow<string>('RABBITMQ_EXCHANGE');

    this.connection = amqp.connect([url]);
    this.channel = this.connection.createChannel({
      setup: async (ch: any) => {
        await ch.assertExchange(exchange, 'topic', { durable: true });
        await ch.assertQueue(COLA, { durable: true });
        await ch.bindQueue(COLA, exchange, EVENTO);
      },
    });
    await this.channel.waitForConnect();
    this.logger.log('Cola ' + COLA + ' enlazada a ' + EVENTO + ' (alertas por Telegram)');
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
