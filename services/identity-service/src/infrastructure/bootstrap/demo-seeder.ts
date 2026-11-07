import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';
import { ID_GENERATOR } from '../../application/ports/out/id-generator.port';
import type { IdGeneratorPort } from '../../application/ports/out/id-generator.port';
import { PASSWORD_HASHER } from '../../application/ports/out/password-hasher.port';
import type { PasswordHasherPort } from '../../application/ports/out/password-hasher.port';
import { USUARIO_REPOSITORY } from '../../application/ports/out/usuario.repository.port';
import type { UsuarioRepositoryPort } from '../../application/ports/out/usuario.repository.port';

const CUENTAS_DEMO = [
  {
    nombre: 'Coordinador de Brigadas',
    email: 'coordinador@salud.gob.mx',
    password: 'Coordina2026',
    rol: Rol.COORDINADOR,
    brigadaId: null as string | null,
  },
  {
    nombre: 'Ana López',
    email: 'ana@salud.gob.mx',
    password: 'Segura2026',
    rol: Rol.BRIGADISTA,
    brigadaId: 'B-12',
  },
];

@Injectable()
export class DemoSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoSeeder.name);

  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepositoryPort,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(ID_GENERATOR) private readonly ids: IdGeneratorPort,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    for (const cuenta of CUENTAS_DEMO) {
      const email = Email.crear(cuenta.email);
      if (await this.usuarios.buscarPorEmail(email)) continue;
      const usuario = new Usuario(
        this.ids.generar(),
        cuenta.nombre,
        email,
        await this.hasher.hash(cuenta.password),
        cuenta.rol,
        true,
        cuenta.brigadaId,
      );
      await this.usuarios.guardar(usuario);
      this.logger.log('Cuenta de demostración creada: ' + cuenta.email + ' (' + cuenta.rol + ')');
    }
  }
}
