import { Email } from '../../domain/value-objects/email.vo';
import { CredencialesInvalidasException } from '../../domain/exceptions/usuario.exceptions';
import { DomainException } from '../../domain/exceptions/domain.exception';
import type { UsuarioRepositoryPort } from '../ports/out/usuario.repository.port';
import type { PasswordHasherPort } from '../ports/out/password-hasher.port';
import type { TokenServicePort } from '../ports/out/token-service.port';
import type { IniciarSesionDto } from '../dto/iniciar-sesion.dto';
import type { UsuarioResumen } from './registrar-usuario.use-case';

export interface ResultadoSesion {
  accessToken: string;
  usuario: UsuarioResumen;
}

export class IniciarSesionUseCase {
  constructor(
    private readonly usuarios: UsuarioRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly tokens: TokenServicePort,
  ) {}

  async ejecutar(dto: IniciarSesionDto): Promise<ResultadoSesion> {
    let email: Email;
    try {
      email = Email.crear(dto.email);
    } catch (e) {
      if (e instanceof DomainException) throw new CredencialesInvalidasException();
      throw e;
    }

    const usuario = await this.usuarios.buscarPorEmail(email);
    if (!usuario || !usuario.puedeIniciarSesion()) {
      throw new CredencialesInvalidasException();
    }

    const coincide = await this.hasher.comparar(dto.password, usuario.passwordHash);
    if (!coincide) {
      throw new CredencialesInvalidasException();
    }

    const accessToken = await this.tokens.firmar({
      sub: usuario.id,
      rol: usuario.rol,
      brigadaId: usuario.brigadaId,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email.valor,
        rol: usuario.rol,
        brigadaId: usuario.brigadaId,
      },
    };
  }
}
