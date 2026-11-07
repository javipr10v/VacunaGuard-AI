import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EVENT_PUBLISHER } from './application/ports/out/event-publisher.port';
import type { EventPublisherPort } from './application/ports/out/event-publisher.port';
import { ID_GENERATOR } from './application/ports/out/id-generator.port';
import type { IdGeneratorPort } from './application/ports/out/id-generator.port';
import { LOTE_REPOSITORY } from './application/ports/out/lote.repository.port';
import type { LoteRepositoryPort } from './application/ports/out/lote.repository.port';
import { DescontarStockUseCase } from './application/use-cases/descontar-stock.use-case';
import { EliminarLoteUseCase } from './application/use-cases/eliminar-lote.use-case';
import { ListarLotesUseCase } from './application/use-cases/listar-lotes.use-case';
import { RegistrarLecturaTemperaturaUseCase } from './application/use-cases/registrar-lectura-temperatura.use-case';
import { RegistrarLoteUseCase } from './application/use-cases/registrar-lote.use-case';
import { LecturasController } from './infrastructure/http/lecturas.controller';
import { LotesController } from './infrastructure/http/lotes.controller';
import { RabbitMqEventPublisherAdapter } from './infrastructure/messaging/rabbitmq-event-publisher.adapter';
import { TelegramAlertsBinding } from './infrastructure/messaging/telegram-alerts.binding';
import { VacunaAplicadaConsumer } from './infrastructure/messaging/vacuna-aplicada.consumer';
import { LoteOrmEntity } from './infrastructure/persistence/lote.orm-entity';
import { TypeOrmLoteRepository } from './infrastructure/persistence/typeorm-lote.repository';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';
import { RolesGuard } from './infrastructure/security/roles.guard';
import { UuidGenerator } from './infrastructure/security/uuid-generator';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres' as const,
        host: c.getOrThrow<string>('DB_HOST'),
        port: Number(c.getOrThrow<string>('DB_PORT')),
        username: c.getOrThrow<string>('DB_USER'),
        password: c.getOrThrow<string>('DB_PASSWORD'),
        database: c.getOrThrow<string>('DB_NAME'),
        entities: [LoteOrmEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([LoteOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_SECRET') }),
    }),
  ],
  controllers: [LecturasController, LotesController],
  providers: [
    { provide: EVENT_PUBLISHER, useClass: RabbitMqEventPublisherAdapter },
    { provide: LOTE_REPOSITORY, useClass: TypeOrmLoteRepository },
    { provide: ID_GENERATOR, useClass: UuidGenerator },
    {
      provide: EliminarLoteUseCase,
      useFactory: (l: LoteRepositoryPort) => new EliminarLoteUseCase(l),
      inject: [LOTE_REPOSITORY],
    },
    {
      provide: ListarLotesUseCase,
      useFactory: (l: LoteRepositoryPort) => new ListarLotesUseCase(l),
      inject: [LOTE_REPOSITORY],
    },
    {
      provide: RegistrarLecturaTemperaturaUseCase,
      useFactory: (publisher: EventPublisherPort) =>
        new RegistrarLecturaTemperaturaUseCase(publisher),
      inject: [EVENT_PUBLISHER],
    },
    {
      provide: RegistrarLoteUseCase,
      useFactory: (l: LoteRepositoryPort, i: IdGeneratorPort) => new RegistrarLoteUseCase(l, i),
      inject: [LOTE_REPOSITORY, ID_GENERATOR],
    },
    {
      provide: DescontarStockUseCase,
      useFactory: (l: LoteRepositoryPort, p: EventPublisherPort) =>
        new DescontarStockUseCase(l, p),
      inject: [LOTE_REPOSITORY, EVENT_PUBLISHER],
    },
    VacunaAplicadaConsumer,
    TelegramAlertsBinding,
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
