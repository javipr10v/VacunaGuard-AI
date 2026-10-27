import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { EventPublisherPort } from '../../application/ports/out/event-publisher.port';

@Injectable()
export class RabbitMqEventPublisherAdapter
  implements EventPublisherPort, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitMqEventPublisherAdapter.name);
  private connection!: amqp.AmqpConnectionManager;
  private channel!: ChannelWrapper;
  private exchange = '';

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.getOrThrow<string>('RABBITMQ_URL');
    this.exchange = this.config.getOrThrow<string>('RABBITMQ_EXCHANGE');

    this.connection = amqp.connect([url]);
    this.connection.on('connect', () => this.logger.log('Conectado a RabbitMQ'));
    this.connection.on('disconnect', () => this.logger.warn('Desconectado de RabbitMQ'));

    this.channel = this.connection.createChannel({
      json: true,
      setup: async (ch: any) => {
        await ch.assertExchange(this.exchange, 'topic', { durable: true });
        await ch.assertQueue('alertas.telegram', { durable: true });
        await ch.bindQueue('alertas.telegram', this.exchange, 'temperatura.critica');
      },
    });
    await this.channel.waitForConnect();
  }

  async publicar(evento: string, payload: Record<string, unknown>): Promise<void> {
    await this.channel.publish(this.exchange, evento, payload, { persistent: true });
    this.logger.log(`Evento publicado: ${evento}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
