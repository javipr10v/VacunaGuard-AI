import { RegistrarPuntoUseCase } from './registrar-punto.use-case';
import { PuntosMemoria, IdsFalso } from '../testing/fakes';

const dto = { nombre: ' Escuela Benito Juárez ', latitud: 16.75, longitud: -93.11, personasEstimadas: 40 };

const crear = () => {
  const repo = new PuntosMemoria();
  return { repo, useCase: new RegistrarPuntoUseCase(repo, new IdsFalso()) };
};

describe('RegistrarPuntoUseCase', () => {
  it('registra el punto y limpia el nombre', async () => {
    const { repo, useCase } = crear();
    const r = await useCase.ejecutar(dto);
    expect(r.nombre).toBe('Escuela Benito Juárez');
    expect(r.personasEstimadas).toBe(40);
    expect(repo.items.size).toBe(1);
  });
  it('rechaza una latitud fuera de rango', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, latitud: 120 })).rejects.toThrow('latitud');
  });
  it('rechaza un nombre vacío', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, nombre: '   ' })).rejects.toThrow();
  });
});
