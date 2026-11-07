import type { PuntoVisitaRepositoryPort } from '../ports/out/punto-visita.repository.port';

export interface PuntoResumen {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  personasEstimadas: number;
}

export class ListarPuntosUseCase {
  constructor(private readonly puntos: PuntoVisitaRepositoryPort) {}

  async ejecutar(): Promise<PuntoResumen[]> {
    const puntos = await this.puntos.listar();
    return puntos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      latitud: p.coordenada.latitud,
      longitud: p.coordenada.longitud,
      personasEstimadas: p.personasEstimadas,
    }));
  }
}
