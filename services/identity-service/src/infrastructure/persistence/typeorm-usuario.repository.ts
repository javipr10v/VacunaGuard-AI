import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';
import type { UsuarioRepositoryPort } from '../../application/ports/out/usuario.repository.port';
import { UsuarioOrmEntity } from './usuario.orm-entity';

@Injectable()
export class TypeOrmUsuarioRepository implements UsuarioRepositoryPort {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repo: Repository<UsuarioOrmEntity>,
  ) {}

  async guardar(usuario: Usuario): Promise<void> {
    await this.repo.save({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email.valor,
      passwordHash: usuario.passwordHash,
      rol: usuario.rol,
      activo: usuario.activo,
      brigadaId: usuario.brigadaId,
    });
  }

  async buscarPorEmail(email: Email): Promise<Usuario | null> {
    const fila = await this.repo.findOne({ where: { email: email.valor } });
    return fila ? this.aDominio(fila) : null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const fila = await this.repo.findOne({ where: { id } });
    return fila ? this.aDominio(fila) : null;
  }

  private aDominio(f: UsuarioOrmEntity): Usuario {
    return new Usuario(
      f.id,
      f.nombre,
      Email.crear(f.email),
      f.passwordHash,
      f.rol as Rol,
      f.activo,
      f.brigadaId,
    );
  }
}
