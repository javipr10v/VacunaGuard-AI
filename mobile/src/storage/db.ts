import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

// Apertura perezosa: en web el SQLite no siempre está disponible,
// así que la app corre igual (solo sin modo campo).
let base: SQLiteDatabase | null | undefined;

export function obtenerDb(): SQLiteDatabase | null {
  if (base === undefined) {
    try {
      base = SQLite.openDatabaseSync('vacunaguard.db');
    } catch {
      base = null;
    }
  }
  return base;
}

export function iniciarBase(): void {
  const db = obtenerDb();
  if (!db) return;
  db.execSync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS cola (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      payload TEXT NOT NULL,
      creado_en TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS cache_kv (
      clave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS puntos_cache (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      latitud REAL NOT NULL,
      longitud REAL NOT NULL,
      personas INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ruta_cache (
      id TEXT PRIMARY KEY,
      brigada_id TEXT NOT NULL,
      origen_lat REAL NOT NULL,
      origen_lon REAL NOT NULL,
      paradas TEXT NOT NULL,
      distancia_km REAL NOT NULL,
      personas INTEGER NOT NULL
    );
  `);
}
