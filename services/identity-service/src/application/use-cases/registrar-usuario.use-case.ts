import { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { PasswordPlano } from '../../domain/value-objects/password-plano.vo';
import { EmailDuplicadoException } from '../../domain/exceptions/usuario.exceptions';
import type { Rol } from '../../domain/value-objects/rol.vo';
import type { UsuarioRepositoryPort } from '../ports/out/usuario.repository.port';
import type { PasswordHasherPort } from '../ports/out/password-hasher.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { RegistrarUsuarioDto } from '../dto/registrar-usuario.dto';

export interface UsuarioResumen {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
  brigadaId: string | null;
}

export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarios: UsuarioRepositoryPort,
    private readonly hasher: PasswordHasherPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async ejecutar(dto: RegistrarUsuarioDto): Promise<UsuarioResumen> {
    const email = Email.crear(dto.email);
    PasswordPlano.validar(dto.password);

    if (await this.usuarios.buscarPorEmail(email)) {
      throw new EmailDuplicadoException();
    }

    const hash = await this.hasher.hash(dto.password);
    const usuario = new Usuario(this.ids.generar(), dto.nombre, email, hash, dto.rol);
    await this.usuarios.guardar(usuario);

    return {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email.valor,
      rol: usuario.rol,
      brigadaId: usuario.brigadaId,
    };
  }
}
