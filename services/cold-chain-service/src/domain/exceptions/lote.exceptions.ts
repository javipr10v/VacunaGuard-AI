import { DomainException } from './domain.exception';

export class LoteDuplicadoException extends DomainException {
  constructor() {
    super('Ya existe un lote con esa vacuna y ese número de lote');
    this.name = 'LoteDuplicadoException';
  }
}
