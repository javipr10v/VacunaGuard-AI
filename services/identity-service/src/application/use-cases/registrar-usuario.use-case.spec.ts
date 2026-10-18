import { RegistrarUsuarioUseCase } from './registrar-usuario.use-case';
import { RepoMemoria, HasherFalso, IdsFalso } from '../testing/fakes';
import { Rol } from '../../domain/value-objects/rol.vo';

const dto = {
  nombre: 'Ana Pérez',
  email: 'ana@correo.com',
  password: 'Segura2026',
  rol: Rol.BRIGADISTA,
};

const crear = () => {
  const repo = new RepoMemoria();
  return { repo, useCase: new RegistrarUsuarioUseCase(repo, new HasherFalso(), new IdsFalso()) };
};

describe('RegistrarUsuarioUseCase', () => {
  it('registra un usuario y guarda el hash, no la contraseña', async () => {
    const { repo, useCase } = crear();
    const r = await useCase.ejecutar(dto);
    expect(r.email).toBe('ana@correo.com');
    expect(repo.items.get(r.id)?.passwordHash).toBe('hash:Segura2026');
  });
  it('rechaza un correo duplicado', async () => {
    const { useCase } = crear();
    await useCase.ejecutar(dto);
    await expect(useCase.ejecutar({ ...dto, email: 'ANA@correo.com' })).rejects.toThrow('ya está registrado');
  });
  it('rechaza una contraseña débil', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, password: 'abc' })).rejects.toThrow();
  });
  it('rechaza un correo inválido', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, email: 'no-es-correo' })).rejects.toThrow();
  });
});
