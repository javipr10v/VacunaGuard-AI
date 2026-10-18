import { DomainException } from '../exceptions/domain.exception';

export class PasswordPlano {
  static validar(password: string): void {
    if (typeof password !== 'string' || password.length < 8) {
      throw new DomainException('La contraseña debe tener al menos 8 caracteres');
    }
    if (password.length > 72) {
      throw new DomainException('La contraseña no puede superar 72 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      throw new DomainException('La contraseña debe incluir una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      throw new DomainException('La contraseña debe incluir una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      throw new DomainException('La contraseña debe incluir un número');
    }
  }
}
