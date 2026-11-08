import { IsNotEmpty, IsString } from 'class-validator';

export class CrearBrigadaDto {
  @IsString()
  @IsNotEmpty()
  clave!: string;

  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
