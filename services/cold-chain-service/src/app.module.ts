import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LecturasController } from './infrastructure/http/lecturas.controller';
import { RabbitMqEventPublisherAdapter } from './infrastructure/messaging/rabbitmq-event-publisher.adapter';
import { EVENT_PUBLISHER } from './application/ports/out/event-publisher.port';
import type { EventPublisherPort } from './application/ports/out/event-publisher.port';
import { RegistrarLecturaTemperaturaUseCase } from './application/use-cases/registrar-lectura-temperatura.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
  ],
  controllers: [LecturasController],
  providers: [
    { provide: EVENT_PUBLISHER, useClass: RabbitMqEventPublisherAdapter },
    {
      provide: RegistrarLecturaTemperaturaUseCase,
      useFactory: (publisher: EventPublisherPort) =>
        new RegistrarLecturaTemperaturaUseCase(publisher),
      inject: [EVENT_PUBLISHER],
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
