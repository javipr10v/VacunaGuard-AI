import { DomainException } from '../exceptions/domain.exception';

export class Fragmento {
  constructor(
    public readonly documento: string,
    public readonly anio: number,
    public readonly pagina: number,
    public readonly orden: number,
    public readonly texto: string,
  ) {
    if (!documento || !documento.trim()) {
      throw new DomainException('El documento es obligatorio');
    }
    if (!Number.isInteger(anio) || anio < 0 || anio > 2100) {
      throw new DomainException('El año del documento no es válido');
    }
    if (!Number.isInteger(pagina) || pagina < 1) {
      throw new DomainException('La página debe ser un entero mayor o igual a 1');
    }
    if (!Number.isInteger(orden) || orden < 0) {
      throw new DomainException('El orden debe ser un entero mayor o igual a 0');
    }
    if (!texto || !texto.trim()) {
      throw new DomainException('El texto del fragmento es obligatorio');
    }
  }

  get cita(): string {
    const anio = this.anio === 0 ? 's.f.' : String(this.anio);
    return this.documento + ' (' + anio + '), p. ' + this.pagina;
  }
}
