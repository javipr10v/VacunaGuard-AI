export type Rol = 'ADMINISTRADOR' | 'COORDINADOR' | 'BRIGADISTA';

export interface TokenPayload {
  sub: string;
  nombre: string;
  rol: Rol;
  brigadaId: string | null;
}
