import { DomainException } from '../exceptions/domain.exception';

export class Brigada {
  constructor(
    public readonly id: string,
    public readonly clave: string,
    public nombre: string,
  ) {
    if (!clave || !clave.trim()) throw new DomainException('La clave de la brigada es obligatoria');
    if (!nombre || !nombre.trim()) throw new DomainException('El nombre de la brigada es obligatorio');
  }

  renombrar(nuevoNombre: string): void {
    if (!nuevoNombre || !nuevoNombre.trim()) {
      throw new DomainException('El nombre de la brigada es obligatorio');
    }
    this.nombre = nuevoNombre.trim();
  }
}
