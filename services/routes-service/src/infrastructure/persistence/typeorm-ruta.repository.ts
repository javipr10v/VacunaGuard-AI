import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import { Ruta } from '../../domain/entities/ruta.entity';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import type { RutaRepositoryPort } from '../../application/ports/out/ruta.repository.port';

@Injectable()
export class TypeOrmRutaRepository implements RutaRepositoryPort {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async guardar(r: Ruta): Promise<void> {
    await this.ds.transaction(async (m) => {
      await m.query(
        `INSERT INTO rutas (id, brigada_id, origen, distancia_km, personas_estimadas)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3::float8, $4::float8), 4326)::geography, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          r.id,
          r.brigadaId,
          r.origen.longitud,
          r.origen.latitud,
          Math.round(r.distanciaTotalKm() * 100) / 100,
          r.personasEstimadas(),
        ],
      );
      for (let i = 0; i < r.paradas.length; i++) {
        await m.query(
          `INSERT INTO ruta_paradas (ruta_id, orden, punto_id)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [r.id, i + 1, r.paradas[i].id],
        );
      }
    });
  }

  async buscarPorId(id: string): Promise<Ruta | null> {
    const rutas: { id: string; brigada_id: string; latitud: number; longitud: number }[] =
      await this.ds.query(
        `SELECT id, brigada_id,
           ST_Y(origen::geometry) AS latitud,
           ST_X(origen::geometry) AS longitud
         FROM rutas WHERE id = $1`,
        [id],
      );
    if (rutas.length === 0) return null;

    const filas: {
      id: string;
      nombre: string;
      latitud: number;
      longitud: number;
      personas_estimadas: number;
    }[] = await this.ds.query(
      `SELECT p.id, p.nombre,
         ST_Y(p.ubicacion::geometry) AS latitud,
         ST_X(p.ubicacion::geometry) AS longitud,
         p.personas_estimadas
       FROM ruta_paradas rp
       JOIN puntos_visita p ON p.id = rp.punto_id
       WHERE rp.ruta_id = $1
       ORDER BY rp.orden ASC`,
      [id],
    );
    const puntos = filas.map(
      (f) =>
        new PuntoVisita(
          f.id,
          f.nombre,
          Coordenada.crear(Number(f.latitud), Number(f.longitud)),
          Number(f.personas_estimadas),
        ),
    );
    const o = rutas[0];
    return Ruta.planificar(
      o.id,
      o.brigada_id,
      Coordenada.crear(Number(o.latitud), Number(o.longitud)),
      puntos,
    );
  }

  async listarPorBrigada(brigadaId: string): Promise<Ruta[]> {
    const filas: { id: string }[] = await this.ds.query(
      'SELECT id FROM rutas WHERE brigada_id = $1 ORDER BY creado_en DESC',
      [brigadaId],
    );
    const rutas: Ruta[] = [];
    for (const f of filas) {
      const ruta = await this.buscarPorId(f.id);
      if (ruta) rutas.push(ruta);
    }
    return rutas;
  }

  async listarTodas(): Promise<Ruta[]> {
    const filas: { id: string }[] = await this.ds.query(
      'SELECT id FROM rutas ORDER BY creado_en DESC',
    );
    const rutas: Ruta[] = [];
    for (const f of filas) {
      const ruta = await this.buscarPorId(f.id);
      if (ruta) rutas.push(ruta);
    }
    return rutas;
  }
}
