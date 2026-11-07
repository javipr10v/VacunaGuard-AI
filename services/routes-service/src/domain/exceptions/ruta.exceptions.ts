import { DomainException } from './domain.exception';

export class PuntoNoEncontradoException extends DomainException {
  constructor() {
    super('Alguno de los puntos de visita no existe');
    this.name = 'PuntoNoEncontradoException';
  }
}

export class RutaNoEncontradaException extends DomainException {
  constructor() {
    super('Ruta no encontrada');
    this.name = 'RutaNoEncontradaException';
  }
}
