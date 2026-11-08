import { DomainException } from '../exceptions/domain.exception';

export class Lote {
  constructor(
    public readonly id: string,
    public readonly vacuna: string,
    public readonly numeroLote: string,
    private _cantidad: number,
    public readonly fechaCaducidad: Date,
    public readonly umbralStockBajo: number = 20,
    public readonly hieleraId: string | null = null,
  ) {
    if (!vacuna.trim()) throw new DomainException('La vacuna es obligatoria');
    if (!numeroLote.trim()) throw new DomainException('El número de lote es obligatorio');
    if (_cantidad < 0) throw new DomainException('La cantidad no puede ser negativa');
  }

  get cantidad(): number {
    return this._cantidad;
  }

  estaCaducado(hoy: Date = new Date()): boolean {
    return this.fechaCaducidad.getTime() < hoy.getTime();
  }

  stockBajo(): boolean {
    return this._cantidad <= this.umbralStockBajo;
  }

  descontar(dosis: number, hoy: Date = new Date()): void {
    if (dosis <= 0) throw new DomainException('Las dosis a descontar deben ser mayores a 0');
    if (this.estaCaducado(hoy)) throw new DomainException('No se puede usar un lote caducado');
    if (dosis > this._cantidad) throw new DomainException('Stock insuficiente en el lote');
    this._cantidad -= dosis;
  }
}
