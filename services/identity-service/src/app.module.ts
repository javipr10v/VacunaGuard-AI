import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ID_GENERATOR } from './application/ports/out/id-generator.port';
import type { IdGeneratorPort } from './application/ports/out/id-generator.port';
import { PASSWORD_HASHER } from './application/ports/out/password-hasher.port';
import type { PasswordHasherPort } from './application/ports/out/password-hasher.port';
import { TOKEN_SERVICE } from './application/ports/out/token-service.port';
import type { TokenServicePort } from './application/ports/out/token-service.port';
import { USUARIO_REPOSITORY } from './application/ports/out/usuario.repository.port';
import type { UsuarioRepositoryPort } from './application/ports/out/usuario.repository.port';
import { IniciarSesionUseCase } from './application/use-cases/iniciar-sesion.use-case';
import { ActualizarUsuarioUseCase, ListarUsuariosUseCase } from './application/use-cases/gestion-usuarios.use-case';
import { RegistrarUsuarioUseCase } from './application/use-cases/registrar-usuario.use-case';
import { AuthController } from './infrastructure/http/auth.controller';
import { AdminSeeder } from './infrastructure/bootstrap/admin-seeder';
import { DemoSeeder } from './infrastructure/bootstrap/demo-seeder';
import { UsuarioOrmEntity } from './infrastructure/persistence/usuario.orm-entity';
import { TypeOrmUsuarioRepository } from './infrastructure/persistence/typeorm-usuario.repository';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';
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
        entities: [UsuarioOrmEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([UsuarioOrmEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        secret: c.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: Number(c.get('JWT_EXPIRES_SECONDS') ?? 3600) },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USUARIO_REPOSITORY, useClass: TypeOrmUsuarioRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: ID_GENERATOR, useClass: UuidGenerator },
    {
      provide: RegistrarUsuarioUseCase,
      useFactory: (r: UsuarioRepositoryPort, h: PasswordHasherPort, i: IdGeneratorPort) =>
        new RegistrarUsuarioUseCase(r, h, i),
      inject: [USUARIO_REPOSITORY, PASSWORD_HASHER, ID_GENERATOR],
    },
    {
      provide: ListarUsuariosUseCase,
      useFactory: (r: UsuarioRepositoryPort) => new ListarUsuariosUseCase(r),
      inject: [USUARIO_REPOSITORY],
    },
    {
      provide: ActualizarUsuarioUseCase,
      useFactory: (r: UsuarioRepositoryPort) => new ActualizarUsuarioUseCase(r),
      inject: [USUARIO_REPOSITORY],
    },
    {
      provide: IniciarSesionUseCase,
      useFactory: (r: UsuarioRepositoryPort, h: PasswordHasherPort, t: TokenServicePort) =>
        new IniciarSesionUseCase(r, h, t),
      inject: [USUARIO_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE],
    },
    JwtAuthGuard,
    RolesGuard,
    AdminSeeder,
    DemoSeeder,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
