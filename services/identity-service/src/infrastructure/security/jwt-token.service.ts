import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  TokenPayload,
  TokenServicePort,
} from '../../application/ports/out/token-service.port';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(private readonly jwt: JwtService) {}

  firmar(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync({ ...payload });
  }
}
