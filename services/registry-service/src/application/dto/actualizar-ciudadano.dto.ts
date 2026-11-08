import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarCiudadanoDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  nombre?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;
}
