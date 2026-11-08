import { IsOptional, IsString } from 'class-validator';

export class ActualizarBrigadaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  clave?: string;
}
