import { Lote } from '../../domain/entities/lote.entity';
import { LotesMemoria } from '../testing/fakes';
import { EliminarLoteUseCase } from './eliminar-lote.use-case';
import { LoteNoEncontradoException } from '../../domain/exceptions/lote.exceptions';

describe('EliminarLoteUseCase', () => {
  it('elimina un lote existente', async () => {
    const repo = new LotesMemoria();
    repo.items.set('l1', new Lote('l1', 'SRP', 'L-01', 10, new Date(2999, 0, 1)));
    const r = await new EliminarLoteUseCase(repo).ejecutar('l1');
    expect(r.eliminado).toBe(true);
    expect(repo.items.has('l1')).toBe(false);
  });

  it('lanza 404 si el lote no existe', async () => {
    const repo = new LotesMemoria();
    await expect(new EliminarLoteUseCase(repo).ejecutar('no')).rejects.toBeInstanceOf(LoteNoEncontradoException);
  });
});
