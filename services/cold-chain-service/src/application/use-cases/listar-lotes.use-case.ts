import type { LoteRepositoryPort } from '../ports/out/lote.repository.port';

export interface LoteResumen {
  id: string;
  vacuna: string;
  numeroLote: string;
  cantidad: number;
  fechaCaducidad: string;
  umbralStockBajo: number;
  stockBajo: boolean;
  caducado: boolean;
}

export class ListarLotesUseCase {
  constructor(private readonly lotes: LoteRepositoryPort) {}

  async ejecutar(): Promise<LoteResumen[]> {
    const hoy = new Date();
    const lotes = await this.lotes.listar();
    return lotes.map((l) => ({
      id: l.id,
      vacuna: l.vacuna,
      numeroLote: l.numeroLote,
      cantidad: l.cantidad,
      fechaCaducidad: l.fechaCaducidad.toISOString().slice(0, 10),
      umbralStockBajo: l.umbralStockBajo,
      hieleraId: l.hieleraId,
      stockBajo: l.stockBajo(),
      caducado: l.estaCaducado(hoy),
    }));
  }
}
