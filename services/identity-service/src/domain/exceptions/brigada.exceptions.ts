import { DomainException } from './domain.exception';

export class BrigadaYaExisteException extends DomainException {
  constructor(clave?: string) {
    super(clave ? 'Ya existe una brigada con la clave ' + clave : 'Ya existe una brigada con esa clave');
    this.name = 'BrigadaYaExisteException';
  }
}

export class BrigadaNoEncontradaException extends DomainException {
  constructor() {
    super('La brigada indicada no existe');
    this.name = 'BrigadaNoEncontradaException';
  }
}
