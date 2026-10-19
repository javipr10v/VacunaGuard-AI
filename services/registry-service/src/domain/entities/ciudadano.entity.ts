import { DomainException } from '../exceptions/domain.exception';
import { Curp } from '../value-objects/curp.vo';

export class Ciudadano {
  constructor(
    public readonly id: string,
    public readonly curp: Curp,
    public readonly nombre: string,
    public readonly fechaNacimiento: Date,
    hoy: Date = new Date(),
  ) {
    if (!nombre || !nombre.trim()) {
      throw new DomainException('El nombre es obligatorio');
    }
    if (Number.isNaN(fechaNacimiento.getTime()) || fechaNacimiento.getTime() > hoy.getTime()) {
      throw new DomainException('La fecha de nacimiento no es válida');
    }
  }

  edadEnMeses(en: Date = new Date()): number {
    let meses =
      (en.getFullYear() - this.fechaNacimiento.getFullYear()) * 12 +
      (en.getMonth() - this.fechaNacimiento.getMonth());
    if (en.getDate() < this.fechaNacimiento.getDate()) meses--;
    return meses;
  }

  edadEnAnios(en: Date = new Date()): number {
    return Math.floor(this.edadEnMeses(en) / 12);
  }
}
