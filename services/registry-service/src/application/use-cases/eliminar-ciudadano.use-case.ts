import { CiudadanoNoEncontradoException } from '../../domain/exceptions/registro.exceptions';
import type { CiudadanoRepositoryPort } from '../ports/out/ciudadano.repository.port';
import type { RegistroRepositoryPort } from '../ports/out/registro.repository.port';

export class EliminarCiudadanoUseCase {
  constructor(
    private readonly ciudadanos: CiudadanoRepositoryPort,
    private readonly registros: RegistroRepositoryPort,
  ) {}

  async ejecutar(id: string): Promise<{ eliminado: boolean }> {
    const ciudadano = await this.ciudadanos.buscarPorId(id);
    if (!ciudadano) throw new CiudadanoNoEncontradoException();
    // Se eliminan primero sus registros de vacunación para no dejar huérfanos
    await this.registros.eliminarPorCiudadano(id);
    await this.ciudadanos.eliminar(id);
    return { eliminado: true };
  }
}
