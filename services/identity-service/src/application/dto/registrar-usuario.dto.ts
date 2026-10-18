import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Rol } from '../../domain/value-objects/rol.vo';

export class RegistrarUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;

  @IsEnum(Rol)
  rol!: Rol;
}
