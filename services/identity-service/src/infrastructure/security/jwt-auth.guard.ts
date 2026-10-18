import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenPayload } from '../../application/ports/out/token-service.port';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const cabecera: string | undefined = req.headers['authorization'];
    const [tipo, token] = cabecera?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) throw new UnauthorizedException();
    try {
      req.usuario = await this.jwt.verifyAsync<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
