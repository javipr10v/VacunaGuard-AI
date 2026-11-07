import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ConsultarProtocoloDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  pregunta!: string;
}
