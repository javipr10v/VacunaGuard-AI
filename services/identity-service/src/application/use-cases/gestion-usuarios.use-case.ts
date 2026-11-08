import { SinPermisoException, UsuarioNoEncontradoException } from '../../domain/exceptions/usuario.exceptions';
import { BrigadaNoEncontradaException } from '../../domain/exceptions/brigada.exceptions';
import type { Usuario } from '../../domain/entities/usuario.entity';
import type { ActualizarUsuarioDto } from '../dto/actualizar-usuario.dto';
import type { BrigadaRepositoryPort } from '../ports/out/brigada.repository.port';
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

  async ejecutar(rolSolicitante: string): Promise<UsuarioResumen[]> {
    const todos = await this.usuarios.listar();
    // El coordinador solo ve a los brigadistas; el administrador ve a todos
    const visibles = rolSolicitante === 'COORDINADOR'
      ? todos.filter((u) => u.rol === 'BRIGADISTA')
      : todos;
    return visibles.map(resumir);
  }
}

export class ActualizarUsuarioUseCase {
  constructor(
    private readonly usuarios: UsuarioRepositoryPort,
    private readonly brigadas: BrigadaRepositoryPort,
  ) {}

  async ejecutar(id: string, dto: ActualizarUsuarioDto, rolSolicitante: string): Promise<UsuarioResumen> {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new UsuarioNoEncontradoException();

    // Nadie puede modificar una cuenta de administrador
    if (usuario.rol === 'ADMINISTRADOR') {
      throw new SinPermisoException('No se puede modificar una cuenta de administrador');
    }
    // El coordinador solo gestiona brigadistas
    if (rolSolicitante === 'COORDINADOR' && usuario.rol !== 'BRIGADISTA') {
      throw new SinPermisoException('El coordinador solo puede gestionar brigadistas');
    }

    if (dto.activo !== undefined) {
      if (dto.activo) usuario.activar();
      else usuario.desactivar();
    }
    if (dto.brigadaId !== undefined && dto.brigadaId !== usuario.brigadaId) {
      if (dto.brigadaId) {
        const brigada = await this.brigadas.buscarPorClave(dto.brigadaId.trim().toUpperCase());
        if (!brigada) throw new BrigadaNoEncontradaException();
        usuario.asignarBrigada(brigada.clave);
      } else {
        usuario.quitarBrigada();
      }
    }
    await this.usuarios.guardar(usuario);
    return resumir(usuario);
  }
}
