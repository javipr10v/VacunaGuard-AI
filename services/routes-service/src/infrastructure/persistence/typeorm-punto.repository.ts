import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import type { PuntoVisitaRepositoryPort } from '../../application/ports/out/punto-visita.repository.port';

interface FilaPunto {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  personas_estimadas: number;
}

const SELECT_PUNTO = `SELECT id, nombre,
  ST_Y(ubicacion::geometry) AS latitud,
  ST_X(ubicacion::geometry) AS longitud,
  personas_estimadas
  FROM puntos_visita`;

@Injectable()
export class TypeOrmPuntoRepository implements PuntoVisitaRepositoryPort {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async guardar(p: PuntoVisita): Promise<void> {
    await this.ds.query(
      `INSERT INTO puntos_visita (id, nombre, ubicacion, personas_estimadas)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3::float8, $4::float8), 4326)::geography, $5)
       ON CONFLICT (id) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         ubicacion = EXCLUDED.ubicacion,
         personas_estimadas = EXCLUDED.personas_estimadas`,
      [p.id, p.nombre, p.coordenada.longitud, p.coordenada.latitud, p.personasEstimadas],
    );
  }

  async buscarPorIds(ids: string[]): Promise<PuntoVisita[]> {
    if (ids.length === 0) return [];
    const filas: FilaPunto[] = await this.ds.query(
      `${SELECT_PUNTO} WHERE id = ANY($1::uuid[])`,
      [ids],
    );
    return filas.map((f) => this.aDominio(f));
  }

  async listar(): Promise<PuntoVisita[]> {
    const filas: FilaPunto[] = await this.ds.query(`${SELECT_PUNTO} ORDER BY nombre ASC`);
    return filas.map((f) => this.aDominio(f));
  }

  async eliminar(id: string): Promise<number> {
    const r: { rowCount?: number } = await this.ds.query('DELETE FROM puntos_visita WHERE id = $1', [id]);
    return Number(r?.rowCount ?? 0);
  }

  private aDominio(f: FilaPunto): PuntoVisita {
    return new PuntoVisita(
      f.id,
      f.nombre,
      Coordenada.crear(Number(f.latitud), Number(f.longitud)),
      Number(f.personas_estimadas),
    );
  }
}
