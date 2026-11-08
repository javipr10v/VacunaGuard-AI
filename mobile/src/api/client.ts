import Constants from 'expo-constants';
import { borrarSeguro, guardarSeguro, leerSeguro } from '@/storage/seguro';

const PUERTOS = { identity: 3001, coldChain: 3002, registry: 3003, routes: 3004, advisor: 3005 } as const;
export type Servicio = keyof typeof PUERTOS;

function host(): string {
  const fija = (process.env as { EXPO_PUBLIC_API_HOST?: string }).EXPO_PUBLIC_API_HOST;
  if (fija) return fija;
  const hostUri = Constants.expoConfig?.hostUri;
  const ip = hostUri?.split(':')[0];
  return ip && ip.length > 0 ? ip : '127.0.0.1';
}

export function base(servicio: Servicio): string {
  return 'http://' + host() + ':' + PUERTOS[servicio];
}

export async function obtenerToken(): Promise<string | null> {
  return leerSeguro('vg_token');
}

export async function guardarToken(t: string): Promise<void> {
  await guardarSeguro('vg_token', t);
}

export async function borrarToken(): Promise<void> {
  await borrarSeguro('vg_token');
}

export class ErrorApi extends Error {}

export async function peticion<T>(
  servicio: Servicio,
  ruta: string,
  opciones?: { metodo?: string; cuerpo?: unknown; conToken?: boolean },
): Promise<T> {
  const cabeceras: Record<string, string> = { 'Content-Type': 'application/json' };
  if (opciones?.conToken !== false) {
    const t = await obtenerToken();
    if (t) cabeceras.Authorization = 'Bearer ' + t;
  }
  let respuesta: Response;
  try {
    respuesta = await fetch(base(servicio) + ruta, {
      method: opciones?.metodo ?? 'GET',
      headers: cabeceras,
      body: opciones?.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor (' + base(servicio) + ')');
  }
  if (respuesta.status === 401) throw new ErrorApi('Sesión expirada');
  if (respuesta.status === 429) throw new ErrorApi('Demasiados intentos · espera un minuto e inténtalo de nuevo');
  if (!respuesta.ok) {
    let detalle = '';
    try {
      const j = (await respuesta.json()) as { message?: string };
      detalle = j.message ?? '';
    } catch {
      detalle = '';
    }
    throw new ErrorApi(detalle || 'Error ' + respuesta.status);
  }
  return (await respuesta.json()) as T;
}
