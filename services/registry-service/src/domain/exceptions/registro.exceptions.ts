import { DomainException } from './domain.exception';

export class DosisDuplicadaException extends DomainException {
  constructor() {
    super('Esa dosis de esa vacuna ya fue registrada para el ciudadano');
    this.name = 'DosisDuplicadaException';
  }
}

export class CiudadanoNoEncontradoException extends DomainException {
  constructor() {
    super('Ciudadano no encontrado');
    this.name = 'CiudadanoNoEncontradoException';
  }
}
