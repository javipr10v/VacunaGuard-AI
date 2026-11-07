import { Lote } from '../../domain/entities/lote.entity';
import { LotesMemoria } from '../testing/fakes';
import { ListarLotesUseCase } from './listar-lotes.use-case';

describe('ListarLotesUseCase', () => {
  it('resume los lotes con banderas de stock y caducidad', async () => {
    const repo = new LotesMemoria();
    repo.items.set('l1', new Lote('l1', 'SRP', 'L-01', 120, new Date(2999, 0, 1), 20));
    repo.items.set('l2', new Lote('l2', 'Influenza', 'L-02', 10, new Date(2000, 0, 1), 20));
    const useCase = new ListarLotesUseCase(repo);
    const r = await useCase.ejecutar();
    expect(r).toHaveLength(2);
    const sano = r.find((l) => l.id === 'l1')!;
    expect(sano).toMatchObject({ vacuna: 'SRP', cantidad: 120, stockBajo: false, caducado: false });
    const mal = r.find((l) => l.id === 'l2')!;
    expect(mal.stockBajo).toBe(true);
    expect(mal.caducado).toBe(true);
  });
});
