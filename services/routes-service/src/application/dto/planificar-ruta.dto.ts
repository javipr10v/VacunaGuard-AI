import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PlanificarRutaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  brigadaId!: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  origenLatitud!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  origenLongitud!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  puntoIds!: string[];
}
