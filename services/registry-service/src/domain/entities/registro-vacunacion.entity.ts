import { DomainException } from '../exceptions/domain.exception';

export class RegistroVacunacion {
  constructor(
    public readonly id: string,
    public readonly ciudadanoId: string,
    public readonly vacuna: string,
    public readonly lote: string,
    public readonly numeroDosis: number,
    public readonly fechaAplicacion: Date,
    public readonly brigadistaId: string,
    public readonly reaccionAdversa: string | null = null,
    hoy: Date = new Date(),
  ) {
    if (!vacuna || !vacuna.trim()) throw new DomainException('La vacuna es obligatoria');
    if (!lote || !lote.trim()) throw new DomainException('El lote es obligatorio');
    if (!brigadistaId || !brigadistaId.trim()) {
      throw new DomainException('El brigadista es obligatorio');
    }
    if (!Number.isInteger(numeroDosis) || numeroDosis < 1 || numeroDosis > 5) {
      throw new DomainException('El número de dosis debe ser un entero entre 1 y 5');
    }
    if (
      Number.isNaN(fechaAplicacion.getTime()) ||
      fechaAplicacion.getTime() > hoy.getTime()
    ) {
      throw new DomainException('La fecha de aplicación no es válida');
    }
  }

  hayReaccionAdversa(): boolean {
    return !!this.reaccionAdversa && this.reaccionAdversa.trim().length > 0;
  }
}
