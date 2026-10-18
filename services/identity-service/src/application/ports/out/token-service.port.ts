import type { Rol } from '../../../domain/value-objects/rol.vo';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  sub: string;
  rol: Rol;
  brigadaId: string | null;
}

export interface TokenServicePort {
  firmar(payload: TokenPayload): Promise<string>;
}
