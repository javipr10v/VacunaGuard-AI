import type { AlertaStockRepositoryPort } from '../ports/out/alerta-stock.repository.port';

export class RegistrarAlertaStockUseCase {
  constructor(private readonly alertas: AlertaStockRepositoryPort) {}

  async ejecutar(datos: unknown): Promise<'REGISTRADA' | 'DESCARTADA'> {
    const d = (datos ?? {}) as Record<string, unknown>;
    const vacuna = d.vacuna;
    const lote = d.lote;
    const stock = d.stockRestante;
    const umbral = d.umbral;

    if (
      typeof vacuna !== 'string' ||
      !vacuna.trim() ||
      typeof lote !== 'string' ||
      !lote.trim() ||
      typeof stock !== 'number' ||
      !Number.isInteger(stock) ||
      typeof umbral !== 'number' ||
      !Number.isInteger(umbral)
    ) {
      return 'DESCARTADA';
    }

    const fecha = typeof d.fecha === 'string' ? new Date(d.fecha) : new Date();
    await this.alertas.guardar({
      vacuna: vacuna.trim(),
      lote: lote.trim(),
      stockRestante: stock,
      umbral,
      fecha: Number.isNaN(fecha.getTime()) ? new Date() : fecha,
    });
    return 'REGISTRADA';
  }
}
