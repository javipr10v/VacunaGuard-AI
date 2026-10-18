import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/registrar-usuario.use-case';
import { USUARIO_REPOSITORY } from '../../application/ports/out/usuario.repository.port';
import type { UsuarioRepositoryPort } from '../../application/ports/out/usuario.repository.port';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    private readonly config: ConfigService,
    private readonly registrar: RegistrarUsuarioUseCase,
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepositoryPort,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return;
    if (await this.usuarios.buscarPorEmail(Email.crear(email))) return;
    await this.registrar.ejecutar({ nombre: 'Administrador', email, password, rol: Rol.ADMINISTRADOR });
    this.logger.log('Administrador inicial creado');
  }
}
