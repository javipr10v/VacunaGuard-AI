import { UsuarioNoEncontradoException } from '../../domain/exceptions/usuario.exceptions';
import type { Usuario } from '../../domain/entities/usuario.entity';
import type { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import type { UsuarioRepositoryPort } from '../ports/out/usuario.repository.port';

export interface UsuarioResumen {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  brigadaId: string | null;
}

function resumir(u: Usuario): UsuarioResumen {
  return {
    id: u.id,
    nombre: u.nombre,
    email: u.email.valor,
    rol: u.rol,
    activo: u.activo,
    brigadaId: u.brigadaId,
  };
}

export class ListarUsuariosUseCase {
  constructor(private readonly usuarios: UsuarioRepositoryPort) {}

  async ejecutar(): Promise<UsuarioResumen[]> {
    const todos = await this.usuarios.listar();
    return todos.map(resumir);
  }
}

export class ActualizarUsuarioUseCase {
  constructor(private readonly usuarios: UsuarioRepositoryPort) {}

  async ejecutar(id: string, dto: ActualizarUsuarioDto): Promise<UsuarioResumen> {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new UsuarioNoEncontradoException();
    if (dto.activo !== undefined) {
      if (dto.activo) usuario.activar();
      else usuario.desactivar();
    }
    if (dto.brigadaId !== undefined && dto.brigadaId !== usuario.brigadaId) {
      if (dto.brigadaId) usuario.asignarBrigada(dto.brigadaId);
      else usuario.quitarBrigada();
    }
    await this.usuarios.guardar(usuario);
    return resumir(usuario);
  }
}
