import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IniciarSesionDto } from '../../application/dto/iniciar-sesion.dto';
import { RegistrarUsuarioDto } from '../../application/dto/registrar-usuario.dto';
import { IniciarSesionUseCase } from '../../application/use-cases/iniciar-sesion.use-case';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/registrar-usuario.use-case';
import { Rol } from '../../domain/value-objects/rol.vo';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly iniciarSesion: IniciarSesionUseCase,
    private readonly registrarUsuario: RegistrarUsuarioUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  login(@Body() dto: IniciarSesionDto) {
    return this.iniciarSesion.ejecutar(dto);
  }

  @Post('registro')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  registro(@Body() dto: RegistrarUsuarioDto) {
    return this.registrarUsuario.ejecutar(dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  perfil(@Req() req: { usuario: unknown }) {
    return req.usuario;
  }
}
