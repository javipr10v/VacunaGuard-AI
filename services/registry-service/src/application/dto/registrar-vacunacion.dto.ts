import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RegistrarVacunacionDto {
  @IsUUID()
  ciudadanoId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  vacuna!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  lote!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  numeroDosis!: number;

  @IsOptional()
  @IsDateString()
  fechaAplicacion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reaccionAdversa?: string;
}
