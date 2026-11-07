import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EsquemaAdvisor implements OnModuleInit {
  private readonly logger = new Logger(EsquemaAdvisor.name);

  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async onModuleInit(): Promise<void> {
    const sentencias = [
      'CREATE EXTENSION IF NOT EXISTS vector',
      'CREATE TABLE IF NOT EXISTS fragmentos (id uuid PRIMARY KEY, documento varchar(160) NOT NULL, anio integer NOT NULL, pagina integer NOT NULL, orden integer NOT NULL, texto text NOT NULL, embedding vector(768), creado_en timestamptz NOT NULL DEFAULT now())',
      'CREATE INDEX IF NOT EXISTS idx_fragmentos_documento ON fragmentos (documento, pagina)',
    ];
    for (const sentencia of sentencias) {
      await this.ds.query(sentencia);
    }
    try {
      await this.ds.query(
        'CREATE INDEX IF NOT EXISTS idx_fragmentos_embedding ON fragmentos USING hnsw (embedding vector_cosine_ops)',
      );
    } catch (e) {
      this.logger.warn('No se pudo crear el índice hnsw (se seguirá buscando sin índice): ' + (e as Error).message);
    }
    this.logger.log('Esquema pgvector listo');
  }
}
