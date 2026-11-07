import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PlanificarRutaDto } from '../../application/dto/planificar-ruta.dto';
import { RegistrarPuntoDto } from '../../application/dto/registrar-punto.dto';
import { RegistrarUbicacionDto } from '../../application/dto/registrar-ubicacion.dto';
import { ConsultarRutaUseCase } from '../../application/use-cases/consultar-ruta.use-case';
import { EliminarPuntoUseCase } from '../../application/use-cases/eliminar-punto.use-case';
import { ListarPuntosUseCase } from '../../application/use-cases/listar-puntos.use-case';
import { ListarRutasUseCase } from '../../application/use-cases/listar-rutas.use-case';
import { ListarUbicacionesUseCase } from '../../application/use-cases/listar-ubicaciones.use-case';
import { PlanificarRutaUseCase } from '../../application/use-cases/planificar-ruta.use-case';
import { RegistrarPuntoUseCase } from '../../application/use-cases/registrar-punto.use-case';
import { RegistrarUbicacionUseCase } from '../../application/use-cases/registrar-ubicacion.use-case';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';
import type { TokenPayload } from '../security/token-payload';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RutasController {
  constructor(
    private readonly registrarPunto: RegistrarPuntoUseCase,
    private readonly planificarRuta: PlanificarRutaUseCase,
    private readonly listarPuntos: ListarPuntosUseCase,
    private readonly listarRutas: ListarRutasUseCase,
    private readonly consultarRuta: ConsultarRutaUseCase,
    private readonly registrarUbicacion: RegistrarUbicacionUseCase,
    private readonly listarUbicaciones: ListarUbicacionesUseCase,
    private readonly eliminarPunto: EliminarPuntoUseCase,
  ) {}

  @Get('puntos')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'BRIGADISTA')
  puntos() {
    return this.listarPuntos.ejecutar();
  }

  @Post('puntos')
  @Roles('ADMINISTRADOR', 'COORDINADOR')
  punto(@Body() dto: RegistrarPuntoDto) {
    return this.registrarPunto.ejecutar(dto);
  }

  @Delete('puntos/:id')
  @Roles('ADMINISTRADOR', 'COORDINADOR')
  eliminar(@Param('id') id: string) {
    return this.eliminarPunto.ejecutar(id);
  }

  @Get('rutas')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'BRIGADISTA')
  rutas(@Query('brigadaId') brigadaId: string | undefined, @Req() req: { usuario: TokenPayload }) {
    if (req.usuario.rol === 'BRIGADISTA') return this.listarRutas.ejecutar(req.usuario.brigadaId);
    return this.listarRutas.ejecutar(brigadaId ?? null);
  }

  @Get('rutas/:id')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'BRIGADISTA')
  ruta(@Param('id') id: string) {
    return this.consultarRuta.ejecutar(id);
  }

  @Post('rutas')
  @Roles('ADMINISTRADOR', 'COORDINADOR')
  rutaNueva(@Body() dto: PlanificarRutaDto) {
    return this.planificarRuta.ejecutar(dto);
  }

  @Post('ubicaciones')
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'BRIGADISTA')
  ubicacion(@Body() dto: RegistrarUbicacionDto, @Req() req: { usuario: TokenPayload }) {
    return this.registrarUbicacion.ejecutar(dto, req.usuario.sub, req.usuario.brigadaId);
  }

  @Get('ubicaciones')
  @Roles('ADMINISTRADOR', 'COORDINADOR')
  ubicaciones(@Query('minutos') minutos?: string) {
    const n = Number(minutos);
    return this.listarUbicaciones.ejecutar(Number.isFinite(n) && n > 0 ? n : 5);
  }
}
