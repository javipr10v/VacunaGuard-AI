import type { UbicacionBrigadista } from '../../../domain/entities/ubicacion.entity';

export const UBICACION_REPOSITORY = Symbol('UBICACION_REPOSITORY');

export interface UbicacionRepositoryPort {
  guardar(ubicacion: UbicacionBrigadista): Promise<void>;
  recientes(minutos: number): Promise<UbicacionBrigadista[]>;
}
