import { Ruta } from '../../domain/entities/ruta.entity';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { PuntoNoEncontradoException } from '../../domain/exceptions/ruta.exceptions';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import type { PuntoVisitaRepositoryPort } from '../ports/out/punto-visita.repository.port';
import type { RutaRepositoryPort } from '../ports/out/ruta.repository.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { PlanificarRutaDto } from '../dto/planificar-ruta.dto';

export interface ParadaResumen {
  orden: number;
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  personasEstimadas: number;
}

export interface RutaResumen {
  id: string;
  brigadaId: string;
  paradas: ParadaResumen[];
  distanciaTotalKm: number;
  personasEstimadas: number;
}

export class PlanificarRutaUseCase {
  constructor(
    private readonly puntos: PuntoVisitaRepositoryPort,
    private readonly rutas: RutaRepositoryPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async ejecutar(dto: PlanificarRutaDto): Promise<RutaResumen> {
    if (new Set(dto.puntoIds).size !== dto.puntoIds.length) {
      throw new DomainException('Hay puntos de visita repetidos');
    }
    const origen = Coordenada.crear(dto.origenLatitud, dto.origenLongitud);

    const encontrados = await this.puntos.buscarPorIds(dto.puntoIds);
    if (encontrados.length !== dto.puntoIds.length) {
      throw new PuntoNoEncontradoException();
    }

    const ruta = Ruta.planificar(this.ids.generar(), dto.brigadaId, origen, encontrados);
    await this.rutas.guardar(ruta);

    return {
      id: ruta.id,
      brigadaId: ruta.brigadaId,
      paradas: ruta.paradas.map((p, i) => ({
        orden: i + 1,
        id: p.id,
        nombre: p.nombre,
        latitud: p.coordenada.latitud,
        longitud: p.coordenada.longitud,
        personasEstimadas: p.personasEstimadas,
      })),
      distanciaTotalKm: Math.round(ruta.distanciaTotalKm() * 100) / 100,
      personasEstimadas: ruta.personasEstimadas(),
    };
  }
}
