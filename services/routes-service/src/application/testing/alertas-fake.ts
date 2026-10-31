import type {
  AlertaStock,
  AlertaStockRepositoryPort,
} from '../ports/out/alerta-stock.repository.port';

export class AlertasMemoria implements AlertaStockRepositoryPort {
  items: AlertaStock[] = [];
  async guardar(a: AlertaStock) {
    this.items.push(a);
  }
}
