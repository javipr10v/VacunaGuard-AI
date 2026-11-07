import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ConsultarCiudadanosQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(18)
  curp?: string;
}
