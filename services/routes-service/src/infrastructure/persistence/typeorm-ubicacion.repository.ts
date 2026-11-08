import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UbicacionBrigadista } from '../../domain/entities/ubicacion.entity';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import type { UbicacionRepositoryPort } from '../../application/ports/out/ubicacion.repository.port';

interface FilaUbicacion {
  id: string;
  brigadista_id: string;
  nombre: string | null;
  brigada_id: string | null;
  latitud: number;
  longitud: number;
  creado_en: string;
}

@Injectable()
export class TypeOrmUbicacionRepository implements UbicacionRepositoryPort {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async guardar(u: UbicacionBrigadista): Promise<void> {
    await this.ds.query(
      'INSERT INTO ubicaciones_brigadista (id, brigadista_id, nombre, brigada_id, ubicacion) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5::float8, $6::float8), 4326)::geography)',
      [u.id, u.brigadistaId, u.nombre, u.brigadaId, u.coordenada.longitud, u.coordenada.latitud],
    );
  }

  async recientes(minutos: number): Promise<UbicacionBrigadista[]> {
    const filas: FilaUbicacion[] = await this.ds.query(
      'SELECT id, brigadista_id, nombre, brigada_id, ST_Y(ubicacion::geometry) AS latitud, ST_X(ubicacion::geometry) AS longitud, creado_en FROM ubicaciones_brigadista WHERE creado_en >= now() - make_interval(mins => $1) ORDER BY creado_en DESC',
      [minutos],
    );
    return filas.map(
      (f) =>
        new UbicacionBrigadista(
          f.id,
          f.brigadista_id,
          f.nombre ?? 'Brigadista',
          f.brigada_id,
          Coordenada.crear(Number(f.latitud), Number(f.longitud)),
          new Date(f.creado_en),
        ),
    );
  }
}
