import { DomainException } from '../exceptions/domain.exception';
import { Email } from '../value-objects/email.vo';
import { Rol } from '../value-objects/rol.vo';

export class Usuario {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly email: Email,
    private _passwordHash: string,
    private _rol: Rol,
    private _activo: boolean = true,
    private _brigadaId: string | null = null,
  ) {
    if (!nombre || !nombre.trim()) {
      throw new DomainException('El nombre es obligatorio');
    }
    if (!_passwordHash) {
      throw new DomainException('El hash de contraseña es obligatorio');
    }
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get rol(): Rol {
    return this._rol;
  }

  get activo(): boolean {
    return this._activo;
  }

  get brigadaId(): string | null {
    return this._brigadaId;
  }

  puedeIniciarSesion(): boolean {
    return this._activo;
  }

  desactivar(): void {
    this._activo = false;
  }

  activar(): void {
    this._activo = true;
  }

  cambiarRol(nuevo: Rol): void {
    if (nuevo === Rol.ADMINISTRADOR) {
      this._brigadaId = null;
    }
    this._rol = nuevo;
  }

  asignarBrigada(brigadaId: string): void {
    if (this._rol === Rol.ADMINISTRADOR) {
      throw new DomainException('Un administrador no se asigna a una brigada');
    }
    if (!brigadaId || !brigadaId.trim()) {
      throw new DomainException('La brigada es obligatoria');
    }
    this._brigadaId = brigadaId;
  }

  tienePermiso(rolesPermitidos: Rol[]): boolean {
    return rolesPermitidos.includes(this._rol);
  }
}
