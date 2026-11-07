import { PuntoNoEncontradoException } from '../../domain/exceptions/ruta.exceptions';
import type { PuntoVisitaRepositoryPort } from '../ports/out/punto-visita.repository.port';

export class EliminarPuntoUseCase {
  constructor(private readonly puntos: PuntoVisitaRepositoryPort) {}

  async ejecutar(id: string): Promise<{ eliminado: boolean }> {
    const existentes = await this.puntos.buscarPorIds([id]);
    if (existentes.length === 0) throw new PuntoNoEncontradoException();
    await this.puntos.eliminar(id);
    return { eliminado: true };
  }
}
