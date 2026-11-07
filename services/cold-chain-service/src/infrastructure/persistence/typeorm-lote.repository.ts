import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from '../../domain/entities/lote.entity';
import type { LoteRepositoryPort } from '../../application/ports/out/lote.repository.port';
import { LoteOrmEntity } from './lote.orm-entity';

@Injectable()
export class TypeOrmLoteRepository implements LoteRepositoryPort {
  constructor(
    @InjectRepository(LoteOrmEntity)
    private readonly repo: Repository<LoteOrmEntity>,
  ) {}

  async guardar(l: Lote): Promise<void> {
    await this.repo.save({
      id: l.id,
      vacuna: l.vacuna,
      numeroLote: l.numeroLote,
      cantidad: l.cantidad,
      fechaCaducidad: l.fechaCaducidad.toISOString().slice(0, 10),
      umbralStockBajo: l.umbralStockBajo,
    });
  }

  async buscarPorId(id: string): Promise<Lote | null> {
    const f = await this.repo.findOne({ where: { id } });
    return f ? this.aDominio(f) : null;
  }

  async buscarPorVacunaYLote(vacuna: string, numeroLote: string): Promise<Lote | null> {
    const f = await this.repo.findOne({ where: { vacuna, numeroLote } });
    return f ? this.aDominio(f) : null;
  }

  async listar(): Promise<Lote[]> {
    const filas = await this.repo.find({ order: { vacuna: 'ASC', numeroLote: 'ASC' } });
    return filas.map((f) => this.aDominio(f));
  }

  async eliminar(id: string): Promise<number> {
    const r = await this.repo.delete({ id });
    return Number(r.affected ?? 0);
  }

  private aDominio(f: LoteOrmEntity): Lote {
    return new Lote(
      f.id,
      f.vacuna,
      f.numeroLote,
      f.cantidad,
      new Date(f.fechaCaducidad),
      f.umbralStockBajo,
    );
  }
}
