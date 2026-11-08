import { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';
import { RepoMemoria } from '../testing/fakes';
import { ActualizarUsuarioUseCase, ListarUsuariosUseCase } from './gestion-usuarios.use-case';
import { SinPermisoException, UsuarioNoEncontradoException } from '../../domain/exceptions/usuario.exceptions';

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
    const useCase = new ActualizarUsuarioUseCase(repo);
    await expect(useCase.ejecutar('a1', { activo: false }, 'ADMINISTRADOR')).rejects.toBeInstanceOf(SinPermisoException);
    await expect(useCase.ejecutar('a1', { activo: false }, 'COORDINADOR')).rejects.toBeInstanceOf(SinPermisoException);
  });

  it('el coordinador no puede tocar a otro coordinador', async () => {
    const repo = new RepoMemoria();
    repo.items.set('c1', new Usuario('c1', 'Coord', Email.crear('coord@salud.gob.mx'), 'h', Rol.COORDINADOR));
    const useCase = new ActualizarUsuarioUseCase(repo);
    await expect(useCase.ejecutar('c1', { activo: false }, 'COORDINADOR')).rejects.toBeInstanceOf(SinPermisoException);
  });

  it('el coordinador sí gestiona brigadistas', async () => {
    const repo = new RepoMemoria();
    repo.items.set('b1', new Usuario('b1', 'Ana', Email.crear('ana@salud.gob.mx'), 'h', Rol.BRIGADISTA));
    const r = await new ActualizarUsuarioUseCase(repo).ejecutar('b1', { activo: false }, 'COORDINADOR');
    expect(r.activo).toBe(false);
  });

  it('desactiva y reactiva un brigadista (admin)', async () => {
    const repo = new RepoMemoria();
    repo.items.set('b1', new Usuario('b1', 'Ana', Email.crear('ana@salud.gob.mx'), 'h', Rol.BRIGADISTA));
    const useCase = new ActualizarUsuarioUseCase(repo);
    const apagado = await useCase.ejecutar('b1', { activo: false }, 'ADMINISTRADOR');
    expect(apagado.activo).toBe(false);
    const encendido = await useCase.ejecutar('b1', { activo: true }, 'ADMINISTRADOR');
    expect(encendido.activo).toBe(true);
  });

  it('lanza 404 si el usuario no existe', async () => {
    const repo = new RepoMemoria();
    await expect(new ActualizarUsuarioUseCase(repo).ejecutar('no', { activo: false }, 'ADMINISTRADOR')).rejects.toBeInstanceOf(UsuarioNoEncontradoException);
  });
});
