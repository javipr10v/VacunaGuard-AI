import { IsNumber, Max, Min } from 'class-validator';

export class RegistrarUbicacionDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud!: number;
}
