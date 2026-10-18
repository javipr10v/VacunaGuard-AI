import { DomainException } from './domain.exception';

export class EmailDuplicadoException extends DomainException {
  constructor() {
    super('El correo ya está registrado');
    this.name = 'EmailDuplicadoException';
  }
}

export class CredencialesInvalidasException extends DomainException {
  constructor() {
    super('Credenciales inválidas');
    this.name = 'CredencialesInvalidasException';
  }
}
