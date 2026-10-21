import { DescontarStockUseCase } from './descontar-stock.use-case';
import { Lote } from '../../domain/entities/lote.entity';
import { LotesMemoria, PublisherFalso } from '../testing/fakes';

const crear = (cantidad = 25, caducidad = new Date(2999, 0, 1)) => {
  const repo = new LotesMemoria();
  const publisher = new PublisherFalso();
  repo.items.set('l1', new Lote('l1', 'Influenza', 'L-01', cantidad, caducidad, 20));
  return { repo, publisher, useCase: new DescontarStockUseCase(repo, publisher) };
};

const dto = { vacuna: 'Influenza', lote: 'L-01', cantidad: 1 };

describe('DescontarStockUseCase', () => {
  it('descuenta y guarda el stock restante', async () => {
    const { repo, useCase } = crear(25);
    const r = await useCase.ejecutar(dto);
    expect(r).toEqual({ estado: 'DESCONTADO', stockRestante: 24, stockBajo: false });
    expect(repo.items.get('l1')?.cantidad).toBe(24);
  });
  it('publica stock.bajo al cruzar el umbral', async () => {
    const { publisher, useCase } = crear(21);
    await useCase.ejecutar(dto);
    expect(publisher.eventos).toHaveLength(1);
    expect(publisher.eventos[0].evento).toBe('stock.bajo');
    expect(publisher.eventos[0].payload).toMatchObject({ vacuna: 'Influenza', lote: 'L-01', stockRestante: 20 });
  });
  it('no repite stock.bajo si ya estaba bajo', async () => {
    const { publisher, useCase } = crear(20);
    await useCase.ejecutar(dto);
    await useCase.ejecutar(dto);
    expect(publisher.eventos).toHaveLength(0);
  });
  it('ignora un lote desconocido', async () => {
    const { useCase } = crear();
    const r = await useCase.ejecutar({ ...dto, lote: 'NO-EXISTE' });
    expect(r).toEqual({ estado: 'LOTE_DESCONOCIDO' });
  });
  it('rechaza si el stock es insuficiente y no lo modifica', async () => {
    const { repo, useCase } = crear(2);
    const r = await useCase.ejecutar({ ...dto, cantidad: 5 });
    expect(r.estado).toBe('RECHAZADO');
    expect(repo.items.get('l1')?.cantidad).toBe(2);
  });
  it('rechaza un lote caducado', async () => {
    const { useCase } = crear(25, new Date(2000, 0, 1));
    const r = await useCase.ejecutar(dto);
    expect(r.estado).toBe('RECHAZADO');
  });
});
