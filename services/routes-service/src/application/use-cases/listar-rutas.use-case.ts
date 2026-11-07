import type { RutaRepositoryPort } from '../ports/out/ruta.repository.port';
import type { RutaResumen } from './planificar-ruta.use-case';
import { resumirRuta } from './resumir-ruta';

export class ListarRutasUseCase {
  constructor(private readonly rutas: RutaRepositoryPort) {}

  async ejecutar(brigadaId: string | null): Promise<RutaResumen[]> {
    const rutas = brigadaId
      ? await this.rutas.listarPorBrigada(brigadaId)
      : await this.rutas.listarTodas();
    return rutas.map(resumirRuta);
  }
}
