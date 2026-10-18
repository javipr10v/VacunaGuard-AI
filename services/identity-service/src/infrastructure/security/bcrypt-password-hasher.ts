import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PasswordHasherPort } from '../../application/ports/out/password-hasher.port';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  private static readonly COSTO = 12;

  hash(plano: string): Promise<string> {
    return bcrypt.hash(plano, BcryptPasswordHasher.COSTO);
  }

  comparar(plano: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plano, hash);
  }
}
