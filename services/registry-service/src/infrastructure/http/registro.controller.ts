import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { RegistrarCiudadanoDto } from '../../application/dto/registrar-ciudadano.dto';
import { RegistrarVacunacionDto } from '../../application/dto/registrar-vacunacion.dto';
import { RegistrarCiudadanoUseCase } from '../../application/use-cases/registrar-ciudadano.use-case';
import { RegistrarVacunacionUseCase } from '../../application/use-cases/registrar-vacunacion.use-case';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import type { TokenPayload } from '../security/token-payload';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR', 'COORDINADOR', 'BRIGADISTA')
export class RegistroController {
  constructor(
    private readonly registrarCiudadano: RegistrarCiudadanoUseCase,
    private readonly registrarVacunacion: RegistrarVacunacionUseCase,
  ) {}

  @Post('ciudadanos')
  ciudadano(@Body() dto: RegistrarCiudadanoDto) {
    return this.registrarCiudadano.ejecutar(dto);
  }

  @Post('vacunaciones')
  vacunacion(@Body() dto: RegistrarVacunacionDto, @Req() req: { usuario: TokenPayload }) {
    return this.registrarVacunacion.ejecutar(dto, req.usuario.sub);
  }
}
