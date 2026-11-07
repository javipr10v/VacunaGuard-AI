import { DomainException } from './domain.exception';

export class EmailDuplicadoException extends DomainException {
  constructor() {
    super('El correo ya está registrado');
    this.name = 'EmailDuplicadoException';
  }
}

export class UsuarioNoEncontradoException extends DomainException {
  constructor() {
    super('Usuario no encontrado');
    this.name = 'UsuarioNoEncontradoException';
  }
}

export class CredencialesInvalidasException extends DomainException {
  constructor() {
    super('Credenciales inválidas');
    this.name = 'CredencialesInvalidasException';
  }
}
