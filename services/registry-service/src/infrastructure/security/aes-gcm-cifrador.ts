import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';
import type { CifradorPort } from '../../application/ports/out/cifrador.port';

@Injectable()
export class AesGcmCifrador implements CifradorPort {
  private readonly clave: Buffer;

  constructor(config: ConfigService) {
    this.clave = Buffer.from(config.getOrThrow<string>('ENCRYPTION_KEY'), 'hex');
    if (this.clave.length !== 32) {
      throw new Error('ENCRYPTION_KEY debe ser de 32 bytes (64 caracteres hexadecimales)');
    }
  }

  cifrar(texto: string): string {
    const iv = randomBytes(12);
    const cifrador = createCipheriv('aes-256-gcm', this.clave, iv);
    const datos = Buffer.concat([cifrador.update(texto, 'utf8'), cifrador.final()]);
    return Buffer.concat([iv, cifrador.getAuthTag(), datos]).toString('base64');
  }

  descifrar(cifrado: string): string {
    const buf = Buffer.from(cifrado, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const datos = buf.subarray(28);
    const descifrador = createDecipheriv('aes-256-gcm', this.clave, iv);
    descifrador.setAuthTag(tag);
    return Buffer.concat([descifrador.update(datos), descifrador.final()]).toString('utf8');
  }

  huella(texto: string): string {
    return createHmac('sha256', this.clave).update(texto).digest('hex');
  }
}
