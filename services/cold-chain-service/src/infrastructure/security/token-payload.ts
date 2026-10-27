export type Rol = 'ADMINISTRADOR' | 'COORDINADOR' | 'BRIGADISTA';

export interface TokenPayload {
  sub: string;
  rol: Rol;
  brigadaId: string | null;
}
