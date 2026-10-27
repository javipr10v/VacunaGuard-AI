import { RegistrarLoteUseCase } from './registrar-lote.use-case';
import { LotesMemoria } from '../testing/fakes';
import { IdsFalso } from '../testing/ids-falso';

const dto = {
  vacuna: 'Influenza',
  numeroLote: 'L-2026-01',
  cantidad: 100,
  fechaCaducidad: '2999-01-01',
};

const crear = () => {
  const repo = new LotesMemoria();
  return { repo, useCase: new RegistrarLoteUseCase(repo, new IdsFalso()) };
};

describe('RegistrarLoteUseCase', () => {
  it('registra el lote con el umbral por defecto', async () => {
    const { repo, useCase } = crear();
    const r = await useCase.ejecutar(dto);
    expect(r.cantidad).toBe(100);
    expect(r.umbralStockBajo).toBe(20);
    expect(r.fechaCaducidad).toBe('2999-01-01');
    expect(repo.items.size).toBe(1);
  });
  it('respeta un umbral personalizado', async () => {
    const { useCase } = crear();
    const r = await useCase.ejecutar({ ...dto, umbralStockBajo: 5 });
    expect(r.umbralStockBajo).toBe(5);
  });
  it('rechaza un lote repetido de la misma vacuna', async () => {
    const { useCase } = crear();
    await useCase.ejecutar(dto);
    await expect(useCase.ejecutar(dto)).rejects.toThrow('Ya existe un lote');
  });
  it('rechaza un lote ya caducado', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, fechaCaducidad: '2000-01-01' })).rejects.toThrow(
      'caducado',
    );
  });
});
