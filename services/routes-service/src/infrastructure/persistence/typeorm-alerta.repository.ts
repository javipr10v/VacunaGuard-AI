import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type {
  AlertaStock,
  AlertaStockRepositoryPort,
} from '../../application/ports/out/alerta-stock.repository.port';

@Injectable()
export class TypeOrmAlertaRepository implements AlertaStockRepositoryPort {
  constructor(@InjectDataSource() private readonly ds: DataSource) {}

  async guardar(a: AlertaStock): Promise<void> {
    await this.ds.query(
      `INSERT INTO alertas_stock (vacuna, lote, stock_restante, umbral, fecha)
       VALUES ($1, $2, $3, $4, $5)`,
      [a.vacuna, a.lote, a.stockRestante, a.umbral, a.fecha],
    );
  }
}
