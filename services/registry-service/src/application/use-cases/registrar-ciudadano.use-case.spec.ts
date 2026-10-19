import { RegistrarCiudadanoUseCase } from './registrar-ciudadano.use-case';
import { CiudadanosMemoria, IdsFalso } from '../testing/fakes';

const dto = {
  curp: 'GUMJ900515HCSZRV08',
  nombre: 'Luis Gómez',
  fechaNacimiento: '2020-06-15',
};

const crear = () => {
  const repo = new CiudadanosMemoria();
  return { repo, useCase: new RegistrarCiudadanoUseCase(repo, new IdsFalso()) };
};

describe('RegistrarCiudadanoUseCase', () => {
  it('registra al ciudadano y devuelve la CURP enmascarada', async () => {
    const { repo, useCase } = crear();
    const r = await useCase.ejecutar(dto);
    expect(r.curp).toBe('GUMJ************08');
    expect(r.fechaNacimiento).toBe('2020-06-15');
    expect(r.yaExistia).toBe(false);
    expect(repo.items.size).toBe(1);
  });
  it('si la CURP ya existe, no duplica y lo indica', async () => {
    const { repo, useCase } = crear();
    const primero = await useCase.ejecutar(dto);
    const segundo = await useCase.ejecutar({ ...dto, curp: 'gumj900515hcszrv08' });
    expect(segundo.id).toBe(primero.id);
    expect(segundo.yaExistia).toBe(true);
    expect(repo.items.size).toBe(1);
  });
  it('rechaza una CURP inválida', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, curp: 'INVALIDA000000000X' })).rejects.toThrow('CURP');
  });
  it('rechaza una fecha de nacimiento futura', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, fechaNacimiento: '2999-01-01' })).rejects.toThrow();
  });
});
