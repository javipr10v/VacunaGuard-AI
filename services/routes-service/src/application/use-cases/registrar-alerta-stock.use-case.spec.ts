import { RegistrarAlertaStockUseCase } from './registrar-alerta-stock.use-case';
import { AlertasMemoria } from '../testing/alertas-fake';

const valido = {
  vacuna: 'Influenza',
  lote: 'L-01',
  stockRestante: 20,
  umbral: 20,
  fecha: '2026-10-20T15:00:00.000Z',
};

const crear = () => {
  const repo = new AlertasMemoria();
  return { repo, useCase: new RegistrarAlertaStockUseCase(repo) };
};

describe('RegistrarAlertaStockUseCase', () => {
  it('registra una alerta válida', async () => {
    const { repo, useCase } = crear();
    expect(await useCase.ejecutar(valido)).toBe('REGISTRADA');
    expect(repo.items).toHaveLength(1);
    expect(repo.items[0].stockRestante).toBe(20);
  });
  it('descarta un mensaje sin vacuna', async () => {
    const { repo, useCase } = crear();
    expect(await useCase.ejecutar({ ...valido, vacuna: '  ' })).toBe('DESCARTADA');
    expect(repo.items).toHaveLength(0);
  });
  it('descarta un stock que no es entero', async () => {
    const { useCase } = crear();
    expect(await useCase.ejecutar({ ...valido, stockRestante: 'veinte' })).toBe('DESCARTADA');
  });
  it('descarta un mensaje vacío o nulo', async () => {
    const { useCase } = crear();
    expect(await useCase.ejecutar(null)).toBe('DESCARTADA');
    expect(await useCase.ejecutar(undefined)).toBe('DESCARTADA');
  });
});
