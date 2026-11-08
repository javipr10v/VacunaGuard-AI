import type { Usuario } from '../../domain/entities/usuario.entity';
import type { Email } from '../../domain/value-objects/email.vo';
import type { UsuarioRepositoryPort } from '../ports/out/usuario.repository.port';
import type { PasswordHasherPort } from '../ports/out/password-hasher.port';
import type { TokenServicePort, TokenPayload } from '../ports/out/token-service.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';

export class RepoMemoria implements UsuarioRepositoryPort {
  items = new Map<string, Usuario>();
  async guardar(u: Usuario) {
    this.items.set(u.id, u);
  }
  async buscarPorEmail(e: Email) {
    return [...this.items.values()].find((u) => u.email.equals(e)) ?? null;
  }
  async buscarPorId(id: string) {
    return this.items.get(id) ?? null;
  }
  async listar() {
    return [...this.items.values()];
  }
  async eliminar(id: string) {
    return this.items.delete(id) ? 1 : 0;
  }
}

export class HasherFalso implements PasswordHasherPort {
  async hash(p: string) {
    return 'hash:' + p;
  }
  async comparar(p: string, h: string) {
    return h === 'hash:' + p;
  }
}

export class TokenFalso implements TokenServicePort {
  async firmar(p: TokenPayload) {
    return 'token-' + p.sub;
  }
}

export class IdsFalso implements IdGeneratorPort {
  private n = 0;
  generar() {
    return 'id-' + ++this.n;
  }
}
