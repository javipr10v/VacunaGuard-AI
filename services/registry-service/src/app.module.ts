import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CIFRADOR } from './application/ports/out/cifrador.port';
import { CIUDADANO_REPOSITORY } from './application/ports/out/ciudadano.repository.port';
import type { CiudadanoRepositoryPort } from './application/ports/out/ciudadano.repository.port';
import { EVENT_PUBLISHER } from './application/ports/out/event-publisher.port';
import type { EventPublisherPort } from './application/ports/out/event-publisher.port';
import { ID_GENERATOR } from './application/ports/out/id-generator.port';
import type { IdGeneratorPort } from './application/ports/out/id-generator.port';
import { REGISTRO_REPOSITORY } from './application/ports/out/registro.repository.port';
import type { RegistroRepositoryPort } from './application/ports/out/registro.repository.port';
import { BuscarCiudadanoPorCurpUseCase } from './application/use-cases/buscar-ciudadano.use-case';
import { ConsultarCiudadanoUseCase } from './application/use-cases/consultar-ciudadano.use-case';
import { EliminarCiudadanoUseCase } from './application/use-cases/eliminar-ciudadano.use-case';
import { ActualizarCiudadanoUseCase } from './application/use-cases/actualizar-ciudadano.use-case';
import { ListarVacunacionesUseCase } from './application/use-cases/listar-vacunaciones.use-case';
import { RegistrarCiudadanoUseCase } from './application/use-cases/registrar-ciudadano.use-case';
import { RegistrarVacunacionUseCase } from './application/use-cases/registrar-vacunacion.use-case';
import { RegistroController } from './infrastructure/http/registro.controller';
import { RabbitMqEventPublisherAdapter } from './infrastructure/messaging/rabbitmq-event-publisher.adapter';
import { CiudadanoOrmEntity } from './infrastructure/persistence/ciudadano.orm-entity';
import { RegistroOrmEntity } from './infrastructure/persistence/registro.orm-entity';
import { TypeOrmCiudadanoRepository } from './infrastructure/persistence/typeorm-ciudadano.repository';
import { TypeOrmRegistroRepository } from './infrastructure/persistence/typeorm-registro.repository';
import { AesGcmCifrador } from './infrastructure/security/aes-gcm-cifrador';
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
        entities: [CiudadanoOrmEntity, RegistroOrmEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([CiudadanoOrmEntity, RegistroOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({ secret: c.getOrThrow<string>('JWT_SECRET') }),
    }),
  ],
  controllers: [RegistroController],
  providers: [
    { provide: CIFRADOR, useClass: AesGcmCifrador },
    { provide: ID_GENERATOR, useClass: UuidGenerator },
    { provide: EVENT_PUBLISHER, useClass: RabbitMqEventPublisherAdapter },
    { provide: CIUDADANO_REPOSITORY, useClass: TypeOrmCiudadanoRepository },
    { provide: REGISTRO_REPOSITORY, useClass: TypeOrmRegistroRepository },
    {
      provide: EliminarCiudadanoUseCase,
      useFactory: (c: CiudadanoRepositoryPort, r: RegistroRepositoryPort) =>
        new EliminarCiudadanoUseCase(c, r),
      inject: [CIUDADANO_REPOSITORY, REGISTRO_REPOSITORY],
    },
    { provide: ActualizarCiudadanoUseCase, useFactory: (c: CiudadanoRepositoryPort) => new ActualizarCiudadanoUseCase(c), inject: [CIUDADANO_REPOSITORY] },
    {
      provide: ConsultarCiudadanoUseCase,
      useFactory: (c: CiudadanoRepositoryPort) => new ConsultarCiudadanoUseCase(c),
      inject: [CIUDADANO_REPOSITORY],
    },
    {
      provide: BuscarCiudadanoPorCurpUseCase,
      useFactory: (c: CiudadanoRepositoryPort, consultar: ConsultarCiudadanoUseCase) =>
        new BuscarCiudadanoPorCurpUseCase(c, consultar),
      inject: [CIUDADANO_REPOSITORY, ConsultarCiudadanoUseCase],
    },
    {
      provide: ListarVacunacionesUseCase,
      useFactory: (r: RegistroRepositoryPort) => new ListarVacunacionesUseCase(r),
      inject: [REGISTRO_REPOSITORY],
    },
    {
      provide: RegistrarCiudadanoUseCase,
      useFactory: (c: CiudadanoRepositoryPort, i: IdGeneratorPort) =>
        new RegistrarCiudadanoUseCase(c, i),
      inject: [CIUDADANO_REPOSITORY, ID_GENERATOR],
    },
    {
      provide: RegistrarVacunacionUseCase,
      useFactory: (
        c: CiudadanoRepositoryPort,
        r: RegistroRepositoryPort,
        p: EventPublisherPort,
        i: IdGeneratorPort,
      ) => new RegistrarVacunacionUseCase(c, r, p, i),
      inject: [CIUDADANO_REPOSITORY, REGISTRO_REPOSITORY, EVENT_PUBLISHER, ID_GENERATOR],
    },
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
