import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RegistrarLoteDto } from '../../application/dto/registrar-lote.dto';
import { RegistrarLoteUseCase } from '../../application/use-cases/registrar-lote.use-case';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@Controller('lotes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LotesController {
  constructor(private readonly registrarLote: RegistrarLoteUseCase) {}

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR')
  registrar(@Body() dto: RegistrarLoteDto) {
    return this.registrarLote.ejecutar(dto);
  }
}
