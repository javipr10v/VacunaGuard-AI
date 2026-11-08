import { EmailDuplicadoException, SinPermisoException, UsuarioNoEncontradoException } from '../../domain/exceptions/usuario.exceptions';
import { BrigadaNoEncontradaException } from '../../domain/exceptions/brigada.exceptions';
import { DomainException } from '../../domain/exceptions/domain.exception';
import type { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';
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
    if (dto.nombre !== undefined && dto.nombre.trim() !== usuario.nombre) {
      usuario.cambiarNombre(dto.nombre);
    }
    if (dto.email !== undefined && dto.email.trim().toLowerCase() !== usuario.email.valor) {
      let nuevoEmail: Email;
      try {
        nuevoEmail = Email.crear(dto.email);
      } catch (e) {
        if (e instanceof DomainException) throw new DomainException('El correo no es válido');
        throw e;
      }
      if (await this.usuarios.buscarPorEmail(nuevoEmail)) {
        throw new EmailDuplicadoException();
      }
      usuario.cambiarEmail(nuevoEmail);
    }
    if (dto.rol !== undefined && dto.rol !== usuario.rol) {
      if (rolSolicitante !== 'ADMINISTRADOR') {
        throw new SinPermisoException('Solo el administrador puede cambiar el rol');
      }
      usuario.cambiarRol(dto.rol as Rol);
    }
    await this.usuarios.guardar(usuario);
    return resumir(usuario);
  }
}

export class EliminarUsuarioUseCase {
  constructor(private readonly usuarios: UsuarioRepositoryPort) {}

  async ejecutar(id: string, rolSolicitante: string): Promise<{ eliminado: boolean }> {
    const usuario = await this.usuarios.buscarPorId(id);
    if (!usuario) throw new UsuarioNoEncontradoException();
    if (usuario.rol === 'ADMINISTRADOR') {
      throw new SinPermisoException('No se puede eliminar una cuenta de administrador');
    }
    if (rolSolicitante === 'COORDINADOR' && usuario.rol !== 'BRIGADISTA') {
      throw new SinPermisoException('El coordinador solo puede eliminar brigadistas');
    }
    await this.usuarios.eliminar(id);
    return { eliminado: true };
  }
}
