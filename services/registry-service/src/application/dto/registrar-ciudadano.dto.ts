import { IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegistrarCiudadanoDto {
  @IsString()
  @Length(18, 18)
  curp!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fechaNacimiento debe ser AAAA-MM-DD' })
  fechaNacimiento!: string;
}
