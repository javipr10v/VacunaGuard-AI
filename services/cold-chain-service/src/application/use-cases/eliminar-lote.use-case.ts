import { LoteNoEncontradoException } from '../../domain/exceptions/lote.exceptions';
import type { LoteRepositoryPort } from '../ports/out/lote.repository.port';

export class EliminarLoteUseCase {
  constructor(private readonly lotes: LoteRepositoryPort) {}

  async ejecutar(id: string): Promise<{ eliminado: boolean }> {
    const lote = await this.lotes.buscarPorId(id);
    if (!lote) throw new LoteNoEncontradoException();
    await this.lotes.eliminar(id);
    return { eliminado: true };
  }
}
