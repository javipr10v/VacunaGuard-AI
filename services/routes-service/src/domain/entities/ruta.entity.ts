import { DomainException } from '../exceptions/domain.exception';
import { OptimizadorRuta } from '../services/optimizador-ruta.service';
import { Coordenada } from '../value-objects/coordenada.vo';
import { PuntoVisita } from './punto-visita.entity';

export class Ruta {
  static readonly MAX_PARADAS = 50;

  private constructor(
    public readonly id: string,
    public readonly brigadaId: string,
    public readonly origen: Coordenada,
    public readonly paradas: PuntoVisita[],
  ) {}

  static planificar(
    id: string,
    brigadaId: string,
    origen: Coordenada,
    puntos: PuntoVisita[],
  ): Ruta {
    if (!id || !id.trim()) throw new DomainException('La ruta necesita un id');
    if (!brigadaId || !brigadaId.trim()) throw new DomainException('La brigada es obligatoria');
    if (puntos.length > Ruta.MAX_PARADAS) {
      throw new DomainException(`Una ruta admite como máximo ${Ruta.MAX_PARADAS} paradas`);
    }
    if (new Set(puntos.map((p) => p.id)).size !== puntos.length) {
      throw new DomainException('Hay puntos de visita repetidos');
    }
    return new Ruta(id, brigadaId, origen, OptimizadorRuta.ordenar(origen, puntos));
  }

  distanciaTotalKm(): number {
    return OptimizadorRuta.distanciaTotalKm(this.origen, this.paradas);
  }

  personasEstimadas(): number {
    return this.paradas.reduce((suma, p) => suma + p.personasEstimadas, 0);
  }
}
