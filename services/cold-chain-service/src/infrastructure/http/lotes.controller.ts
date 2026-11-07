import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { EliminarLoteUseCase } from '../../application/use-cases/eliminar-lote.use-case';
import { ListarLotesUseCase } from '../../application/use-cases/listar-lotes.use-case';
import { RegistrarLoteDto } from '../../application/dto/registrar-lote.dto';
import { RegistrarLoteUseCase } from '../../application/use-cases/registrar-lote.use-case';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@Controller('lotes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LotesController {
  constructor(
    private readonly registrarLote: RegistrarLoteUseCase,
    private readonly listarLotes: ListarLotesUseCase,
    private readonly eliminarLote: EliminarLoteUseCase,
  ) {}

  @Get()
  @Roles('ADMINISTRADOR', 'COORDINADOR', 'BRIGADISTA')
  listar() {
    return this.listarLotes.ejecutar();
  }

  @Post()
  @Roles('ADMINISTRADOR', 'COORDINADOR')
  registrar(@Body() dto: RegistrarLoteDto) {
    return this.registrarLote.ejecutar(dto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'COORDINADOR')
  eliminar(@Param('id') id: string) {
    return this.eliminarLote.ejecutar(id);
  }
}
