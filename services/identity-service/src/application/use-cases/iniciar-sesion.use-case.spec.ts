import { IniciarSesionUseCase } from './iniciar-sesion.use-case';
import { RegistrarUsuarioUseCase } from './registrar-usuario.use-case';
import { RepoMemoria, HasherFalso, TokenFalso, IdsFalso } from '../testing/fakes';
import { Rol } from '../../domain/value-objects/rol.vo';

const preparar = async () => {
  const repo = new RepoMemoria();
  const hasher = new HasherFalso();
  const registrar = new RegistrarUsuarioUseCase(repo, hasher, new IdsFalso());
  const creado = await registrar.ejecutar({
    nombre: 'Ana Pérez',
    email: 'ana@correo.com',
    password: 'Segura2026',
    rol: Rol.BRIGADISTA,
  });
  return { repo, creado, login: new IniciarSesionUseCase(repo, hasher, new TokenFalso()) };
};

describe('IniciarSesionUseCase', () => {
  it('devuelve un token con credenciales correctas', async () => {
    const { login, creado } = await preparar();
    const r = await login.ejecutar({ email: 'ana@correo.com', password: 'Segura2026' });
    expect(r.accessToken).toBe('token-' + creado.id);
    expect(r.usuario.rol).toBe(Rol.BRIGADISTA);
  });
  it('rechaza una contraseña incorrecta', async () => {
    const { login } = await preparar();
    await expect(login.ejecutar({ email: 'ana@correo.com', password: 'Otra2026x' })).rejects.toThrow('Credenciales inválidas');
  });
  it('rechaza un correo que no existe con el mismo mensaje', async () => {
    const { login } = await preparar();
    await expect(login.ejecutar({ email: 'nadie@correo.com', password: 'Segura2026' })).rejects.toThrow('Credenciales inválidas');
  });
  it('rechaza a un usuario desactivado', async () => {
    const { login, repo, creado } = await preparar();
    repo.items.get(creado.id)?.desactivar();
    await expect(login.ejecutar({ email: 'ana@correo.com', password: 'Segura2026' })).rejects.toThrow('Credenciales inválidas');
  });
});
