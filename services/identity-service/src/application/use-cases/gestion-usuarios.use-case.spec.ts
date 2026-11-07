import { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';
import { RepoMemoria } from '../testing/fakes';
import { ActualizarUsuarioUseCase, ListarUsuariosUseCase } from './gestion-usuarios.use-case';
import { UsuarioNoEncontradoException } from '../../domain/exceptions/usuario.exceptions';

describe('Gestión de usuarios', () => {
  it('lista los usuarios con su rol y estado', async () => {
    const repo = new RepoMemoria();
    repo.items.set('u1', new Usuario('u1', 'Ana', Email.crear('ana@salud.gob.mx'), 'hash', Rol.BRIGADISTA, true, 'B-12'));
    const r = await new ListarUsuariosUseCase(repo).ejecutar();
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ id: 'u1', rol: 'BRIGADISTA', activo: true, brigadaId: 'B-12' });
  });

  it('desactiva y reactiva un usuario', async () => {
    const repo = new RepoMemoria();
    repo.items.set('u1', new Usuario('u1', 'Ana', Email.crear('ana@salud.gob.mx'), 'hash', Rol.BRIGADISTA));
    const useCase = new ActualizarUsuarioUseCase(repo);
    const apagado = await useCase.ejecutar('u1', { activo: false });
    expect(apagado.activo).toBe(false);
    const encendido = await useCase.ejecutar('u1', { activo: true });
    expect(encendido.activo).toBe(true);
  });

  it('asigna y quita la brigada', async () => {
    const repo = new RepoMemoria();
    repo.items.set('u1', new Usuario('u1', 'Ana', Email.crear('ana@salud.gob.mx'), 'hash', Rol.BRIGADISTA));
    const useCase = new ActualizarUsuarioUseCase(repo);
    const asignado = await useCase.ejecutar('u1', { brigadaId: 'B-07' });
    expect(asignado.brigadaId).toBe('B-07');
    const quitado = await useCase.ejecutar('u1', { brigadaId: null });
    expect(quitado.brigadaId).toBeNull();
  });

  it('lanza 404 si el usuario no existe', async () => {
    const repo = new RepoMemoria();
    await expect(new ActualizarUsuarioUseCase(repo).ejecutar('no', { activo: false })).rejects.toBeInstanceOf(UsuarioNoEncontradoException);
  });
});
