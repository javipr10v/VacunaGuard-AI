import { Curp } from '../../domain/value-objects/curp.vo';
import type { CiudadanoRepositoryPort } from '../ports/out/ciudadano.repository.port';
import type { ConsultaCiudadanoResumen } from './consultar-ciudadano.use-case';
import { ConsultarCiudadanoUseCase } from './consultar-ciudadano.use-case';

export class BuscarCiudadanoPorCurpUseCase {
  constructor(
    private readonly ciudadanos: CiudadanoRepositoryPort,
    private readonly consultar: ConsultarCiudadanoUseCase,
  ) {}

  async ejecutar(curp: string): Promise<ConsultaCiudadanoResumen | null> {
    const ciudadano = await this.ciudadanos.buscarPorCurp(Curp.crear(curp));
    if (!ciudadano) return null;
    return this.consultar.ejecutar(ciudadano.id);
  }
}
