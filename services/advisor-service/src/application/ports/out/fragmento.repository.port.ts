import type { Fragmento } from '../../../domain/entities/fragmento.entity';

export const FRAGMENTO_REPOSITORY = Symbol('FRAGMENTO_REPOSITORY');

export interface FragmentoResultado {
  fragmento: Fragmento;
  similitud: number;
}

export interface FragmentoRepositoryPort {
  guardar(fragmento: Fragmento, embedding: number[]): Promise<void>;
  borrarPorDocumento(documento: string): Promise<number>;
  buscarSimilares(embedding: number[], limite: number): Promise<FragmentoResultado[]>;
  contar(): Promise<number>;
}
