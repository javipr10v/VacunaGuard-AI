import { IsNumber, IsString, IsNotEmpty, Min, Max } from 'class-validator';

export class RegistrarLecturaDto {
  @IsString()
  @IsNotEmpty()
  sensorId!: string;

  @IsString()
  @IsNotEmpty()
  hielera!: string;

  @IsNumber()
  @Min(-100)
  @Max(100)
  temperatura!: number;
}
