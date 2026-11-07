import { DomainException } from './domain.exception';

export class LoteNoEncontradoException extends DomainException {
  constructor() {
    super('Lote no encontrado');
    this.name = 'LoteNoEncontradoException';
  }
}

export class LoteDuplicadoException extends DomainException {
  constructor() {
    super('Ya existe un lote con esa vacuna y ese número de lote');
    this.name = 'LoteDuplicadoException';
  }
}
