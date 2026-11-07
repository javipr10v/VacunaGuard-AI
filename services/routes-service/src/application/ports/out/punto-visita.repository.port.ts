import type { PuntoVisita } from '../../../domain/entities/punto-visita.entity';

export const PUNTO_REPOSITORY = Symbol('PUNTO_REPOSITORY');

export interface PuntoVisitaRepositoryPort {
  guardar(punto: PuntoVisita): Promise<void>;
  buscarPorIds(ids: string[]): Promise<PuntoVisita[]>;
  listar(): Promise<PuntoVisita[]>;
  eliminar(id: string): Promise<number>;
}
