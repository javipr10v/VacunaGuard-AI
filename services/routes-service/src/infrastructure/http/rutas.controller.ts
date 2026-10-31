import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PlanificarRutaDto } from '../../application/dto/planificar-ruta.dto';
import { RegistrarPuntoDto } from '../../application/dto/registrar-punto.dto';
import { PlanificarRutaUseCase } from '../../application/use-cases/planificar-ruta.use-case';
import { RegistrarPuntoUseCase } from '../../application/use-cases/registrar-punto.use-case';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR', 'COORDINADOR')
export class RutasController {
  constructor(
    private readonly registrarPunto: RegistrarPuntoUseCase,
    private readonly planificarRuta: PlanificarRutaUseCase,
  ) {}

  @Post('puntos')
  punto(@Body() dto: RegistrarPuntoDto) {
    return this.registrarPunto.ejecutar(dto);
  }

  @Post('rutas')
  ruta(@Body() dto: PlanificarRutaDto) {
    return this.planificarRuta.ejecutar(dto);
  }
}
