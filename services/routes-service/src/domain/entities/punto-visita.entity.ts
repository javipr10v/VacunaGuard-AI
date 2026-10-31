import { DomainException } from '../exceptions/domain.exception';
import { Coordenada } from '../value-objects/coordenada.vo';

export class PuntoVisita {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly coordenada: Coordenada,
    public readonly personasEstimadas: number = 0,
  ) {
    if (!id || !id.trim()) throw new DomainException('El punto de visita necesita un id');
    if (!nombre || !nombre.trim()) throw new DomainException('El nombre del punto es obligatorio');
    if (!Number.isInteger(personasEstimadas) || personasEstimadas < 0) {
      throw new DomainException('Las personas estimadas deben ser un entero mayor o igual a 0');
    }
  }
}
