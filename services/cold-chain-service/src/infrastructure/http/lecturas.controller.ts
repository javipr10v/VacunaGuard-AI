import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RegistrarLecturaDto } from '../../application/dto/registrar-lectura.dto';
import { RegistrarLecturaTemperaturaUseCase } from '../../application/use-cases/registrar-lectura-temperatura.use-case';

@Controller('lecturas')
export class LecturasController {
  constructor(private readonly registrarLectura: RegistrarLecturaTemperaturaUseCase) {}

  @Post()
  @HttpCode(201)
  registrar(@Body() dto: RegistrarLecturaDto) {
    return this.registrarLectura.ejecutar(dto);
  }
}
