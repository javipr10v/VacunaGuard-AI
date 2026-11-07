import type { Ruta } from '../../../domain/entities/ruta.entity';

export const RUTA_REPOSITORY = Symbol('RUTA_REPOSITORY');

export interface RutaRepositoryPort {
  guardar(ruta: Ruta): Promise<void>;
  buscarPorId(id: string): Promise<Ruta | null>;
  listarPorBrigada(brigadaId: string): Promise<Ruta[]>;
  listarTodas(): Promise<Ruta[]>;
}
