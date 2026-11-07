import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConsultarProtocoloDto } from '../../application/dto/consultar-protocolo.dto';
import { ConsultarProtocoloUseCase } from '../../application/use-cases/consultar-protocolo.use-case';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@Controller('consultas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR', 'COORDINADOR', 'BRIGADISTA')
export class ConsultasController {
  constructor(private readonly consultar: ConsultarProtocoloUseCase) {}

  @Post()
  preguntar(@Body() dto: ConsultarProtocoloDto) {
    return this.consultar.ejecutar(dto);
  }
}
