import { RutaNoEncontradaException } from '../../domain/exceptions/ruta.exceptions';
import type { RutaRepositoryPort } from '../ports/out/ruta.repository.port';
import type { RutaResumen } from './planificar-ruta.use-case';
import { resumirRuta } from './resumir-ruta';

export class ConsultarRutaUseCase {
  constructor(private readonly rutas: RutaRepositoryPort) {}

  async ejecutar(id: string): Promise<RutaResumen> {
    const ruta = await this.rutas.buscarPorId(id);
    if (!ruta) throw new RutaNoEncontradaException();
    return resumirRuta(ruta);
  }
}
