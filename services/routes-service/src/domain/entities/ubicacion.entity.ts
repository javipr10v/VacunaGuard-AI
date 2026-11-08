import { DomainException } from '../exceptions/domain.exception';
import { Coordenada } from '../value-objects/coordenada.vo';

export class UbicacionBrigadista {
  constructor(
    public readonly id: string,
    public readonly brigadistaId: string,
    public readonly nombre: string,
    public readonly brigadaId: string | null,
    public readonly coordenada: Coordenada,
    public readonly fecha: Date,
  ) {
    if (!id || !id.trim()) throw new DomainException('La ubicación necesita un id');
    if (!brigadistaId || !brigadistaId.trim()) {
      throw new DomainException('El brigadista es obligatorio');
    }
    if (!nombre || !nombre.trim()) throw new DomainException('El nombre del brigadista es obligatorio');
    if (Number.isNaN(fecha.getTime())) throw new DomainException('La fecha no es válida');
  }
}
