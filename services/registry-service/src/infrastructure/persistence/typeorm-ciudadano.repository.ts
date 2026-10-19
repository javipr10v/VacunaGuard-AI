import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ciudadano } from '../../domain/entities/ciudadano.entity';
import { Curp } from '../../domain/value-objects/curp.vo';
import type { CiudadanoRepositoryPort } from '../../application/ports/out/ciudadano.repository.port';
import { CIFRADOR } from '../../application/ports/out/cifrador.port';
import type { CifradorPort } from '../../application/ports/out/cifrador.port';
import { CiudadanoOrmEntity } from './ciudadano.orm-entity';

@Injectable()
export class TypeOrmCiudadanoRepository implements CiudadanoRepositoryPort {
  constructor(
    @InjectRepository(CiudadanoOrmEntity)
    private readonly repo: Repository<CiudadanoOrmEntity>,
    @Inject(CIFRADOR) private readonly cifrador: CifradorPort,
  ) {}

  async guardar(c: Ciudadano): Promise<void> {
    const f = c.fechaNacimiento;
    const mm = String(f.getMonth() + 1).padStart(2, '0');
    const dd = String(f.getDate()).padStart(2, '0');
    await this.repo.save({
      id: c.id,
      curpCifrada: this.cifrador.cifrar(c.curp.valor),
      curpHuella: this.cifrador.huella(c.curp.valor),
      nombre: c.nombre,
      fechaNacimiento: `${f.getFullYear()}-${mm}-${dd}`,
    });
  }

  async buscarPorCurp(curp: Curp): Promise<Ciudadano | null> {
    const fila = await this.repo.findOne({
      where: { curpHuella: this.cifrador.huella(curp.valor) },
    });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorId(id: string): Promise<Ciudadano | null> {
    const fila = await this.repo.findOne({ where: { id } });
    return fila ? this.aDominio(fila) : null;
  }

  private aDominio(f: CiudadanoOrmEntity): Ciudadano {
    const [anio, mes, dia] = f.fechaNacimiento.split('-').map(Number);
    return new Ciudadano(
      f.id,
      Curp.crear(this.cifrador.descifrar(f.curpCifrada)),
      f.nombre,
      new Date(anio, mes - 1, dia),
    );
  }
}
