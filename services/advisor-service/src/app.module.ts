import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'path';
import { EMBEDDING_SERVICE } from './application/ports/out/embedding.port';
import type { EmbeddingPort } from './application/ports/out/embedding.port';
import { FRAGMENTO_REPOSITORY } from './application/ports/out/fragmento.repository.port';
import type { FragmentoRepositoryPort } from './application/ports/out/fragmento.repository.port';
import { LLM_SERVICE } from './application/ports/out/llm.port';
import type { LlmPort } from './application/ports/out/llm.port';
import { ConsultarProtocoloUseCase } from './application/use-cases/consultar-protocolo.use-case';
import { IngestaDocumentosUseCase } from './application/use-cases/ingesta-documentos.use-case';
import { ConsultasController } from './infrastructure/http/consultas.controller';
import { OllamaEmbeddingAdapter } from './infrastructure/llm/ollama-embedding.adapter';
import { OllamaLlmAdapter } from './infrastructure/llm/ollama-llm.adapter';
import { OpenRouterLlmAdapter } from './infrastructure/llm/openrouter-llm.adapter';
import { EsquemaAdvisor } from './infrastructure/persistence/esquema-advisor';
import { PgVectorFragmentoRepository } from './infrastructure/persistence/pgvector-fragmento.repository';
import { JwtAuthGuard } from './infrastructure/security/jwt-auth.guard';
import { RolesGuard } from './infrastructure/security/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
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
  controllers: [ConsultasController],
  providers: [
    EsquemaAdvisor,
    { provide: FRAGMENTO_REPOSITORY, useClass: PgVectorFragmentoRepository },
    { provide: EMBEDDING_SERVICE, useClass: OllamaEmbeddingAdapter },
    {
      provide: LLM_SERVICE,
      useFactory: (c: ConfigService) => {
        const proveedor = c.get<string>('LLM_PROVIDER') ?? 'ollama';
        if (proveedor === 'openrouter') return new OpenRouterLlmAdapter(c);
        return new OllamaLlmAdapter(c);
      },
      inject: [ConfigService],
    },
    {
      provide: ConsultarProtocoloUseCase,
      useFactory: (
        f: FragmentoRepositoryPort,
        e: EmbeddingPort,
        l: LlmPort,
        c: ConfigService,
      ) =>
        new ConsultarProtocoloUseCase(
          f,
          e,
          l,
          c.get<string>('LLM_MODEL') ?? 'llama3.2:3b',
          Number(c.get('EMBED_TOP_K') ?? 3),
        ),
      inject: [FRAGMENTO_REPOSITORY, EMBEDDING_SERVICE, LLM_SERVICE, ConfigService],
    },
    {
      provide: IngestaDocumentosUseCase,
      useFactory: (f: FragmentoRepositoryPort, e: EmbeddingPort) =>
        new IngestaDocumentosUseCase(f, e, resolve(process.cwd(), '../../documentos')),
      inject: [FRAGMENTO_REPOSITORY, EMBEDDING_SERVICE],
    },
    JwtAuthGuard,
    RolesGuard,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
