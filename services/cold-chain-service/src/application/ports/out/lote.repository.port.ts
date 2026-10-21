import { Lote } from '../../../domain/entities/lote.entity';

export const LOTE_REPOSITORY = Symbol('LOTE_REPOSITORY');

export interface LoteRepositoryPort {
  guardar(lote: Lote): Promise<void>;
  buscarPorId(id: string): Promise<Lote | null>;
  buscarPorVacunaYLote(vacuna: string, numeroLote: string): Promise<Lote | null>;
  listar(): Promise<Lote[]>;
}
