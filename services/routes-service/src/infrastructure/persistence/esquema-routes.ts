import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EsquemaRoutes implements OnModuleInit {
  private readonly logger = new Logger(EsquemaRoutes.name);

  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async onModuleInit(): Promise<void> {
    const sentencias = [
      'CREATE EXTENSION IF NOT EXISTS postgis',
      `CREATE TABLE IF NOT EXISTS puntos_visita (
        id uuid PRIMARY KEY,
        nombre varchar(120) NOT NULL,
        ubicacion geography(Point, 4326) NOT NULL,
        personas_estimadas integer NOT NULL DEFAULT 0,
        creado_en timestamptz NOT NULL DEFAULT now()
      )`,
      'CREATE INDEX IF NOT EXISTS idx_puntos_ubicacion ON puntos_visita USING GIST (ubicacion)',
      `CREATE TABLE IF NOT EXISTS rutas (
        id uuid PRIMARY KEY,
        brigada_id varchar(64) NOT NULL,
        origen geography(Point, 4326) NOT NULL,
        distancia_km double precision NOT NULL,
        personas_estimadas integer NOT NULL DEFAULT 0,
        creado_en timestamptz NOT NULL DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS ruta_paradas (
        ruta_id uuid NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
        orden integer NOT NULL,
        punto_id uuid NOT NULL REFERENCES puntos_visita(id),
        PRIMARY KEY (ruta_id, orden)
      )`,
      `CREATE TABLE IF NOT EXISTS alertas_stock (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        vacuna varchar(80) NOT NULL,
        lote varchar(60) NOT NULL,
        stock_restante integer NOT NULL,
        umbral integer NOT NULL,
        fecha timestamptz NOT NULL,
        creado_en timestamptz NOT NULL DEFAULT now()
      )`,
    ];
    for (const sentencia of sentencias) {
      await this.ds.query(sentencia);
    }
    this.logger.log('Esquema PostGIS listo');
  }
}
