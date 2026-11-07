import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarUsuarioDto {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  brigadaId?: string | null;
}
