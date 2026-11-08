import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class RegistrarLoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  vacuna!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  numeroLote!: string;

  @IsInt()
  @Min(1)
  @Max(1000000)
  cantidad!: number;

  @IsDateString()
  fechaCaducidad!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  umbralStockBajo?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  hieleraId?: string;
}
