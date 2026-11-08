import type { Brigada } from '../../../domain/entities/brigada.entity';

export const BRIGADA_REPOSITORY = Symbol('BRIGADA_REPOSITORY');

export interface BrigadaRepositoryPort {
  guardar(brigada: Brigada): Promise<void>;
  listar(): Promise<Brigada[]>;
  buscarPorId(id: string): Promise<Brigada | null>;
  buscarPorClave(clave: string): Promise<Brigada | null>;
  eliminar(id: string): Promise<number>;
}
