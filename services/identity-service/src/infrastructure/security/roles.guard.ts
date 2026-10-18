import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { TokenPayload } from '../../application/ports/out/token-service.port';
import type { Rol } from '../../domain/value-objects/rol.vo';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles?.length) return true;
    const usuario = ctx.switchToHttp().getRequest().usuario as TokenPayload | undefined;
    if (!usuario || !roles.includes(usuario.rol)) throw new ForbiddenException();
    return true;
  }
}
