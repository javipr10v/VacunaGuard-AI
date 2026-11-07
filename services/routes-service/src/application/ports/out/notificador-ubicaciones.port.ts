export const NOTIFICADOR_UBICACIONES = Symbol('NOTIFICADOR_UBICACIONES');

export interface UbicacionResumen {
  id: string;
  brigadistaId: string;
  brigadaId: string | null;
  latitud: number;
  longitud: number;
  fecha: string;
}

export interface NotificadorUbicacionesPort {
  ubicacionActualizada(resumen: UbicacionResumen): void;
}
