import { DomainException } from '../../domain/exceptions/domain.exception';
import type { EventPublisherPort } from '../ports/out/event-publisher.port';
import type { LoteRepositoryPort } from '../ports/out/lote.repository.port';

export interface DescontarStockDto {
  vacuna: string;
  lote: string;
  cantidad: number;
}

export type ResultadoDescuento =
  | { estado: 'DESCONTADO'; stockRestante: number; stockBajo: boolean }
  | { estado: 'LOTE_DESCONOCIDO' }
  | { estado: 'RECHAZADO'; motivo: string };

export class DescontarStockUseCase {
  constructor(
    private readonly lotes: LoteRepositoryPort,
    private readonly publisher: EventPublisherPort,
  ) {}

  async ejecutar(dto: DescontarStockDto): Promise<ResultadoDescuento> {
    const lote = await this.lotes.buscarPorVacunaYLote(dto.vacuna, dto.lote);
    if (!lote) return { estado: 'LOTE_DESCONOCIDO' };

    const estabaBajo = lote.stockBajo();
    try {
      lote.descontar(dto.cantidad);
    } catch (e) {
      if (e instanceof DomainException) return { estado: 'RECHAZADO', motivo: e.message };
      throw e;
    }
    await this.lotes.guardar(lote);

    if (!estabaBajo && lote.stockBajo()) {
      await this.publisher.publicar('stock.bajo', {
        vacuna: lote.vacuna,
        lote: lote.numeroLote,
        stockRestante: lote.cantidad,
        umbral: lote.umbralStockBajo,
        fecha: new Date().toISOString(),
      });
    }

    return { estado: 'DESCONTADO', stockRestante: lote.cantidad, stockBajo: lote.stockBajo() };
  }
}
