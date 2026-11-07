import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { Fragmento } from '../../domain/entities/fragmento.entity';
import type { FragmentoRepositoryPort, FragmentoResultado } from '../../application/ports/out/fragmento.repository.port';

interface FilaFragmento {
  documento: string;
  anio: number;
  pagina: number;
  orden: number;
  texto: string;
  similitud: number;
}

@Injectable()
export class PgVectorFragmentoRepository implements FragmentoRepositoryPort {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async guardar(fragmento: Fragmento, embedding: number[]): Promise<void> {
    await this.ds.query(
      'INSERT INTO fragmentos (id, documento, anio, pagina, orden, texto, embedding) VALUES ($1, $2, $3, $4, $5, $6, $7::vector)',
      [
        randomUUID(),
        fragmento.documento,
        fragmento.anio,
        fragmento.pagina,
        fragmento.orden,
        fragmento.texto,
        JSON.stringify(embedding),
      ],
    );
  }

  async borrarPorDocumento(documento: string): Promise<number> {
    const r: { rowCount?: number } = await this.ds.query(
      'DELETE FROM fragmentos WHERE documento = $1',
      [documento],
    );
    return Number(r?.rowCount ?? 0);
  }

  async buscarSimilares(embedding: number[], limite: number): Promise<FragmentoResultado[]> {
    const filas: FilaFragmento[] = await this.ds.query(
      "SELECT documento, anio, pagina, orden, texto, 1 - (embedding <=> $1::vector) AS similitud FROM fragmentos WHERE embedding IS NOT NULL ORDER BY (embedding <=> $1::vector) - CASE WHEN anio >= 2024 THEN 0.08 ELSE 0 END ASC LIMIT $2",
      [JSON.stringify(embedding), limite],
    );
    return filas.map((fila) => ({
      fragmento: new Fragmento(
        fila.documento,
        Number(fila.anio),
        Number(fila.pagina),
        Number(fila.orden),
        fila.texto,
      ),
      similitud: Number(fila.similitud),
    }));
  }

  async contar(): Promise<number> {
    const filas: { count: string }[] = await this.ds.query('SELECT COUNT(*) AS count FROM fragmentos');
    return Number(filas[0]?.count ?? 0);
  }
}
