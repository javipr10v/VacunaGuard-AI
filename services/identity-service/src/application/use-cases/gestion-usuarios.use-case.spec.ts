import { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';
import { RepoMemoria } from '../testing/fakes';
import type { BrigadaRepositoryPort } from '../ports/out/brigada.repository.port';
import { Brigada } from '../../domain/entities/brigada.entity';
import { ActualizarUsuarioUseCase, ListarUsuariosUseCase } from './gestion-usuarios.use-case';
import { SinPermisoException, UsuarioNoEncontradoException } from '../../domain/exceptions/usuario.exceptions';

class BrigadasMemoria implements BrigadaRepositoryPort {
  items = new Map<string, Brigada>();
  async guardar(b: Brigada) { this.items.set(b.id, b); }
  async listar() { return [...this.items.values()]; }
  async buscarPorId(id: string) { return this.items.get(id) ?? null; }
  async buscarPorClave(clave: string) { return [...this.items.values()].find((b) => b.clave === clave) ?? null; }
  async eliminar(id: string) { return this.items.delete(id) ? 1 : 0; }
}

const brigadas = new BrigadasMemoria();
brigadas.items.set('b12', new Brigada('b12', 'B-12', 'Centro'));
brigadas.items.set('b07', new Brigada('b07', 'B-07', 'Sur'));

describe('Gestión de usuarios', () => {
  it('el coordinador solo ve brigadistas; el admin ve a todos', async () => {
    const repo = new RepoMemoria();
    repo.items.set('a1', new Usuario('a1', 'Admin', Email.crear('admin@salud.gob.mx'), 'h', Rol.ADMINISTRADOR));
    repo.items.set('c1', new Usuario('c1', 'Coord', Email.crear('coord@salud.gob.mx'), 'h', Rol.COORDINADOR));
    repo.items.set('b1', new Usuario('b1', 'Ana', Email.crear('ana@salud.gob.mx'), 'h', Rol.BRIGADISTA));
    const coordinador = await new ListarUsuariosUseCase(repo).ejecutar('COORDINADOR');
    expect(coordinador.map((u) => u.rol)).toEqual(['BRIGADISTA']);
    const admin = await new ListarUsuariosUseCase(repo).ejecutar('ADMINISTRADOR');
    expect(admin).toHaveLength(3);
  });

  it('nadie puede modificar a un administrador', async () => {
    const repo = new RepoMemoria();
    repo.items.set('a1', new Usuario('a1', 'Admin', Email.crear('admin@salud.gob.mx'), 'h', Rol.ADMINISTRADOR));
    const useCase = new ActualizarUsuarioUseCase(repo, brigadas);
    await expect(useCase.ejecutar('a1', { activo: false }, 'ADMINISTRADOR')).rejects.toBeInstanceOf(SinPermisoException);
    await expect(useCase.ejecutar('a1', { activo: false }, 'COORDINADOR')).rejects.toBeInstanceOf(SinPermisoException);
  });

  it('el coordinador no puede tocar a otro coordinador', async () => {
    const repo = new RepoMemoria();
    repo.items.set('c1', new Usuario('c1', 'Coord', Email.crear('coord@salud.gob.mx'), 'h', Rol.COORDINADOR));
    const useCase = new ActualizarUsuarioUseCase(repo, brigadas);
    await expect(useCase.ejecutar('c1', { activo: false }, 'COORDINADOR')).rejects.toBeInstanceOf(SinPermisoException);
  });

  it('el coordinador sí gestiona brigadistas', async () => {
    const repo = new RepoMemoria();
    repo.items.set('b1', new Usuario('b1', 'Ana', Email.crear('ana@salud.gob.mx'), 'h', Rol.BRIGADISTA));
    const r = await new ActualizarUsuarioUseCase(repo, brigadas).ejecutar('b1', { activo: false }, 'COORDINADOR');
    expect(r.activo).toBe(false);
  });

  it('desactiva y reactiva un brigadista (admin)', async () => {
    const repo = new RepoMemoria();
    repo.items.set('b1', new Usuario('b1', 'Ana', Email.crear('ana@salud.gob.mx'), 'h', Rol.BRIGADISTA));
    const useCase = new ActualizarUsuarioUseCase(repo, brigadas);
    const apagado = await useCase.ejecutar('b1', { activo: false }, 'ADMINISTRADOR');
    expect(apagado.activo).toBe(false);
    const encendido = await useCase.ejecutar('b1', { activo: true }, 'ADMINISTRADOR');
    expect(encendido.activo).toBe(true);
  });

  it('lanza 404 si el usuario no existe', async () => {
    const repo = new RepoMemoria();
    await expect(new ActualizarUsuarioUseCase(repo, brigadas).ejecutar('no', { activo: false }, 'ADMINISTRADOR')).rejects.toBeInstanceOf(UsuarioNoEncontradoException);
  });
});