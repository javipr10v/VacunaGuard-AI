import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroVacunacion } from '../../domain/entities/registro-vacunacion.entity';
import type { RegistroRepositoryPort } from '../../application/ports/out/registro.repository.port';
import { RegistroOrmEntity } from './registro.orm-entity';

@Injectable()
export class TypeOrmRegistroRepository implements RegistroRepositoryPort {
  constructor(
    @InjectRepository(RegistroOrmEntity)
    private readonly repo: Repository<RegistroOrmEntity>,
  ) {}

  async guardar(r: RegistroVacunacion): Promise<void> {
    await this.repo.save({
      id: r.id,
      ciudadanoId: r.ciudadanoId,
      vacuna: r.vacuna,
      lote: r.lote,
      numeroDosis: r.numeroDosis,
      fechaAplicacion: r.fechaAplicacion,
      brigadistaId: r.brigadistaId,
      reaccionAdversa: r.reaccionAdversa,
    });
  }

  async existeDosis(ciudadanoId: string, vacuna: string, numeroDosis: number): Promise<boolean> {
    return (await this.repo.count({ where: { ciudadanoId, vacuna, numeroDosis } })) > 0;
  }

  async eliminarPorCiudadano(ciudadanoId: string): Promise<number> {
    const r = await this.repo.delete({ ciudadanoId });
    return Number(r.affected ?? 0);
  }

  async listarPorCiudadano(ciudadanoId: string): Promise<RegistroVacunacion[]> {
    const filas = await this.repo.find({
      where: { ciudadanoId },
      order: { fechaAplicacion: 'ASC' },
    });
    return filas.map(
      (f) =>
        new RegistroVacunacion(
          f.id,
          f.ciudadanoId,
          f.vacuna,
          f.lote,
          f.numeroDosis,
          f.fechaAplicacion,
          f.brigadistaId,
          f.reaccionAdversa,
        ),
    );
  }
}
