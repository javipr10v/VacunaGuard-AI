import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brigada } from '../../domain/entities/brigada.entity';
import type { BrigadaRepositoryPort } from '../../application/ports/out/brigada.repository.port';
import { BrigadaOrmEntity } from './brigada.orm-entity';

@Injectable()
export class TypeOrmBrigadaRepository implements BrigadaRepositoryPort {
  constructor(
    @InjectRepository(BrigadaOrmEntity)
    private readonly repo: Repository<BrigadaOrmEntity>,
  ) {}

  async guardar(brigada: Brigada): Promise<void> {
    await this.repo.save({ id: brigada.id, clave: brigada.clave, nombre: brigada.nombre });
  }

  async listar(): Promise<Brigada[]> {
    const filas = await this.repo.find({ order: { clave: 'ASC' } });
    return filas.map((f) => new Brigada(f.id, f.clave, f.nombre));
  }

  async buscarPorId(id: string): Promise<Brigada | null> {
    const fila = await this.repo.findOne({ where: { id } });
    return fila ? new Brigada(fila.id, fila.clave, fila.nombre) : null;
  }

  async buscarPorClave(clave: string): Promise<Brigada | null> {
    const fila = await this.repo.findOne({ where: { clave } });
    return fila ? new Brigada(fila.id, fila.clave, fila.nombre) : null;
  }

  async eliminar(id: string): Promise<number> {
    const r = await this.repo.delete({ id });
    return Number(r.affected ?? 0);
  }
}
