import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ALERTA_REPOSITORY } from './application/ports/out/alerta-stock.repository.port';
import type { AlertaStockRepositoryPort } from './application/ports/out/alerta-stock.repository.port';
import { ID_GENERATOR } from './application/ports/out/id-generator.port';
import type { IdGeneratorPort } from './application/ports/out/id-generator.port';
import { PUNTO_REPOSITORY } from './application/ports/out/punto-visita.repository.port';
import type { PuntoVisitaRepositoryPort } from './application/ports/out/punto-visita.repository.port';
import { RUTA_REPOSITORY } from './application/ports/out/ruta.repository.port';
import type { RutaRepositoryPort } from './application/ports/out/ruta.repository.port';
import { PlanificarRutaUseCase } from './application/use-cases/planificar-ruta.use-case';
import { RegistrarAlertaStockUseCase } from './application/use-cases/registrar-alerta-stock.use-case';
import { RegistrarPuntoUseCase } from './application/use-cases/registrar-punto.use-case';
import { RutasController } from './infrastructure/http/rutas.controller';
import { StockBajoConsumer } from './infrastructure/messaging/stock-bajo.consumer';
import { EsquemaRoutes } from './infrastructure/persistence/esquema-routes';
import { TypeOrmAlertaRepository } from './infrastructure/persistence/typeorm-alerta.repository';
import { TypeOrmPuntoRepository } from './infrastructure/persistence/typeorm-punto.repository';
import { TypeOrmRutaRepository } from './infrastructure/persistence/typeorm-ruta.repository';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';
import { RolesGuard } from './infrastructure/security/roles.guard';
import { UuidGenerator } from './infrastructure/security/uuid-generator';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres' as const,
        host: c.getOrThrow<string>('DB_HOST'),
        port: Number(c.getOrThrow<string>('DB_PORT')),
        username: c.getOrThrow<string>('DB_USER'),
        password: c.getOrThrow<string>('DB_PASSWORD'),
        database: c.getOrThrow<string>('DB_NAME'),
        entities: [],
        synchronize: false,
      }),
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_SECRET') }),
    }),
  ],
  controllers: [RutasController],
  providers: [
    EsquemaRoutes,
    { provide: ID_GENERATOR, useClass: UuidGenerator },
    { provide: PUNTO_REPOSITORY, useClass: TypeOrmPuntoRepository },
    { provide: RUTA_REPOSITORY, useClass: TypeOrmRutaRepository },
    { provide: ALERTA_REPOSITORY, useClass: TypeOrmAlertaRepository },
    {
      provide: RegistrarPuntoUseCase,
      useFactory: (p: PuntoVisitaRepositoryPort, i: IdGeneratorPort) =>
        new RegistrarPuntoUseCase(p, i),
      inject: [PUNTO_REPOSITORY, ID_GENERATOR],
    },
    {
      provide: PlanificarRutaUseCase,
      useFactory: (p: PuntoVisitaRepositoryPort, r: RutaRepositoryPort, i: IdGeneratorPort) =>
        new PlanificarRutaUseCase(p, r, i),
      inject: [PUNTO_REPOSITORY, RUTA_REPOSITORY, ID_GENERATOR],
    },
    {
      provide: RegistrarAlertaStockUseCase,
      useFactory: (a: AlertaStockRepositoryPort) => new RegistrarAlertaStockUseCase(a),
      inject: [ALERTA_REPOSITORY],
    },
    StockBajoConsumer,
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
