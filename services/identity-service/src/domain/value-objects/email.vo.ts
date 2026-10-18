import { DomainException } from '../exceptions/domain.exception';

export class Email {
  private static readonly PATRON = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly _valor: string) {}

  static crear(valor: string): Email {
    if (typeof valor !== 'string') {
      throw new DomainException('El correo electrónico no es válido');
    }
    const limpio = valor.trim().toLowerCase();
    if (limpio.length > 254 || !Email.PATRON.test(limpio)) {
      throw new DomainException('El correo electrónico no es válido');
    }
    return new Email(limpio);
  }

  get valor(): string {
    return this._valor;
  }

  equals(otro: Email): boolean {
    return this._valor === otro._valor;
  }
}
