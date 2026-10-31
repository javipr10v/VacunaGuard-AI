import { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import type { PuntoVisitaRepositoryPort } from '../ports/out/punto-visita.repository.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { RegistrarPuntoDto } from '../dto/registrar-punto.dto';

export interface PuntoResumen {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  personasEstimadas: number;
}

export class RegistrarPuntoUseCase {
  constructor(
    private readonly puntos: PuntoVisitaRepositoryPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async ejecutar(dto: RegistrarPuntoDto): Promise<PuntoResumen> {
    const punto = new PuntoVisita(
      this.ids.generar(),
      dto.nombre.trim(),
      Coordenada.crear(dto.latitud, dto.longitud),
      dto.personasEstimadas ?? 0,
    );
    await this.puntos.guardar(punto);
    return {
      id: punto.id,
      nombre: punto.nombre,
      latitud: punto.coordenada.latitud,
      longitud: punto.coordenada.longitud,
      personasEstimadas: punto.personasEstimadas,
    };
  }
}
