import type { Usuario } from '../../../domain/entities/usuario.entity';
import type { Email } from '../../../domain/value-objects/email.vo';

export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface UsuarioRepositoryPort {
  guardar(usuario: Usuario): Promise<void>;
  buscarPorEmail(email: Email): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
  eliminar(id: string): Promise<number>;
}
