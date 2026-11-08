import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { RegistrarCiudadanoDto } from '../../application/dto/registrar-ciudadano.dto';
import { RegistrarVacunacionDto } from '../../application/dto/registrar-vacunacion.dto';
import { ConsultarCiudadanosQueryDto } from '../../application/dto/consultar-ciudadanos.query.dto';
import { BuscarCiudadanoPorCurpUseCase } from '../../application/use-cases/buscar-ciudadano.use-case';
import { EliminarCiudadanoUseCase } from '../../application/use-cases/eliminar-ciudadano.use-case';
import { ConsultarCiudadanoUseCase } from '../../application/use-cases/consultar-ciudadano.use-case';
import { ListarVacunacionesUseCase } from '../../application/use-cases/listar-vacunaciones.use-case';
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
    private readonly consultarCiudadano: ConsultarCiudadanoUseCase,
    private readonly buscarCiudadano: BuscarCiudadanoPorCurpUseCase,
    private readonly listarVacunaciones: ListarVacunacionesUseCase,
    private readonly eliminarCiudadano: EliminarCiudadanoUseCase,
  ) {}

  @Get('ciudadanos')
  async ciudadanos(@Query() q: ConsultarCiudadanosQueryDto) {
    if (!q.curp) throw new DomainException('Indica la CURP para buscar un ciudadano');
    const r = await this.buscarCiudadano.ejecutar(q.curp);
    return r ?? { encontrado: false };
  }

  @Get('ciudadanos/:id')
  ciudadano(@Param('id') id: string) {
    return this.consultarCiudadano.ejecutar(id);
  }

  @Get('ciudadanos/:id/vacunaciones')
  vacunaciones(@Param('id') id: string) {
    return this.listarVacunaciones.ejecutar(id);
  }

  @Post('ciudadanos')
  ciudadanoAlta(@Body() dto: RegistrarCiudadanoDto) {
    return this.registrarCiudadano.ejecutar(dto);
  }

  @Delete('ciudadanos/:id')
  @Roles('BRIGADISTA', 'ADMINISTRADOR')
  ciudadanoBaja(@Param('id') id: string) {
    return this.eliminarCiudadano.ejecutar(id);
  }

  @Post('vacunaciones')
  @Roles('BRIGADISTA')
  vacunacion(@Body() dto: RegistrarVacunacionDto, @Req() req: { usuario: TokenPayload }) {
    return this.registrarVacunacion.ejecutar(dto, req.usuario.sub);
  }
}
