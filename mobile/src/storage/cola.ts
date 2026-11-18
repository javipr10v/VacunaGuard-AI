import { obtenerDb } from './db';

export type TipoRegistro = 'ciudadano' | 'vacunacion' | 'ubicacion' | 'lote';

export interface ItemCola {
  id: number;
  tipo: TipoRegistro;
  payload: Record<string, unknown>;
  creadoEn: string;
}

export function encolar(tipo: TipoRegistro, payload: Record<string, unknown>): void {
  const db = obtenerDb();
  if (!db) return;
  db.runSync('INSERT INTO cola (tipo, payload, creado_en) VALUES (?, ?, ?)', [
    tipo,
    JSON.stringify(payload),
    new Date().toISOString(),
  ]);
}

export function pendientes(): ItemCola[] {
  const db = obtenerDb();
  if (!db) return [];
  const filas = db.getAllSync<{ id: number; tipo: string; payload: string; creado_en: string }>(
    'SELECT id, tipo, payload, creado_en FROM cola ORDER BY id ASC',
  );
  return filas.map((f) => ({
    id: f.id,
    tipo: f.tipo as TipoRegistro,
    payload: JSON.parse(f.payload) as Record<string, unknown>,
    creadoEn: f.creado_en,
  }));
}

export function eliminarDeCola(id: number): void {
  const db = obtenerDb();
  if (!db) return;
  db.runSync('DELETE FROM cola WHERE id = ?', [id]);
}

export function vaciarCola(): void {
  const db = obtenerDb();
  if (!db) return;
  db.runSync('DELETE FROM cola');
}

export function guardarCache(clave: string, valor: string): void {
  const db = obtenerDb();
  if (!db) return;
  db.runSync(
    'INSERT INTO cache_kv (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor',
    [clave, valor],
  );
}

export function leerCache(clave: string): string | null {
  const db = obtenerDb();
  if (!db) return null;
  const filas = db.getAllSync<{ valor: string }>('SELECT valor FROM cache_kv WHERE clave = ?', [clave]);
  return filas.length > 0 ? filas[0].valor : null;
}

export interface PuntoLocal {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  personas: number;
}

export function guardarPuntos(puntos: PuntoLocal[]): void {
  const db = obtenerDb();
  if (!db) return;
  db.runSync('DELETE FROM puntos_cache');
  for (const p of puntos) {
    db.runSync('INSERT INTO puntos_cache (id, nombre, latitud, longitud, personas) VALUES (?, ?, ?, ?, ?)', [
      p.id, p.nombre, p.latitud, p.longitud, p.personas,
    ]);
  }
}

export function leerPuntos(): PuntoLocal[] {
  const db = obtenerDb();
  if (!db) return [];
  const filas = db.getAllSync<{ id: string; nombre: string; latitud: number; longitud: number; personas: number }>(
    'SELECT id, nombre, latitud, longitud, personas FROM puntos_cache',
  );
  return filas.map((f) => ({ id: f.id, nombre: f.nombre, latitud: f.latitud, longitud: f.longitud, personas: f.personas }));
}

export interface RutaLocal {
  id: string;
  brigadaId: string;
  origenLat: number;
  origenLon: number;
  paradas: { nombre: string; latitud: number; longitud: number }[];
  distanciaKm: number;
  personas: number;
}

export function guardarRuta(r: RutaLocal): void {
  const db = obtenerDb();
  if (!db) return;
  db.runSync('DELETE FROM ruta_cache');
  db.runSync(
    'INSERT INTO ruta_cache (id, brigada_id, origen_lat, origen_lon, paradas, distancia_km, personas) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [r.id, r.brigadaId, r.origenLat, r.origenLon, JSON.stringify(r.paradas), r.distanciaKm, r.personas],
  );
}

export function leerRuta(): RutaLocal | null {
  const db = obtenerDb();
  if (!db) return null;
  const filas = db.getAllSync<{ id: string; brigada_id: string; origen_lat: number; origen_lon: number; paradas: string; distancia_km: number; personas: number }>(
    'SELECT id, brigada_id, origen_lat, origen_lon, paradas, distancia_km, personas FROM ruta_cache LIMIT 1',
  );
  if (filas.length === 0) return null;
  const f = filas[0];
  return {
    id: f.id,
    brigadaId: f.brigada_id,
    origenLat: f.origen_lat,
    origenLon: f.origen_lon,
    paradas: JSON.parse(f.paradas) as { nombre: string; latitud: number; longitud: number }[],
    distanciaKm: f.distancia_km,
    personas: f.personas,
  };
}
