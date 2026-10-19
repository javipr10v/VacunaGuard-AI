import { DomainException } from '../exceptions/domain.exception';

export class Curp {
  private static readonly PATRON =
    /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

  private constructor(private readonly _valor: string) {}

  static crear(valor: string): Curp {
    if (typeof valor !== 'string') {
      throw new DomainException('La CURP no es válida');
    }
    const limpio = valor.trim().toUpperCase();
    if (!Curp.PATRON.test(limpio)) {
      throw new DomainException('La CURP no es válida');
    }
    return new Curp(limpio);
  }

  get valor(): string {
    return this._valor;
  }

  enmascarada(): string {
    return this._valor.slice(0, 4) + '*'.repeat(12) + this._valor.slice(16);
  }

  equals(otra: Curp): boolean {
    return this._valor === otra._valor;
  }
}
