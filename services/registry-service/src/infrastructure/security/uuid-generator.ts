import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IdGeneratorPort } from '../../application/ports/out/id-generator.port';

@Injectable()
export class UuidGenerator implements IdGeneratorPort {
  generar(): string {
    return randomUUID();
  }
}
