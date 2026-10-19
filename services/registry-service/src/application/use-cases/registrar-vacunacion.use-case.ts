import { RegistroVacunacion } from '../../domain/entities/registro-vacunacion.entity';
import {
  CiudadanoNoEncontradoException,
  DosisDuplicadaException,
} from '../../domain/exceptions/registro.exceptions';
import type { CiudadanoRepositoryPort } from '../ports/out/ciudadano.repository.port';
import type { RegistroRepositoryPort } from '../ports/out/registro.repository.port';
import type { EventPublisherPort } from '../ports/out/event-publisher.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { RegistrarVacunacionDto } from '../dto/registrar-vacunacion.dto';

export interface ResultadoVacunacion {
  registroId: string;
  vacuna: string;
  lote: string;
  numeroDosis: number;
  fechaAplicacion: string;
  reaccionAdversa: boolean;
}

export class RegistrarVacunacionUseCase {
  constructor(
    private readonly ciudadanos: CiudadanoRepositoryPort,
    private readonly registros: RegistroRepositoryPort,
    private readonly publisher: EventPublisherPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async ejecutar(
    dto: RegistrarVacunacionDto,
    brigadistaId: string,
  ): Promise<ResultadoVacunacion> {
    const ciudadano = await this.ciudadanos.buscarPorId(dto.ciudadanoId);
    if (!ciudadano) throw new CiudadanoNoEncontradoException();

    const fecha = dto.fechaAplicacion ? new Date(dto.fechaAplicacion) : new Date();
    const registro = new RegistroVacunacion(
      this.ids.generar(),
      ciudadano.id,
      dto.vacuna,
      dto.lote,
      dto.numeroDosis,
      fecha,
      brigadistaId,
      dto.reaccionAdversa ?? null,
    );

    if (await this.registros.existeDosis(ciudadano.id, registro.vacuna, registro.numeroDosis)) {
      throw new DosisDuplicadaException();
    }

    await this.registros.guardar(registro);

    await this.publisher.publicar('vacuna.aplicada', {
      registroId: registro.id,
      vacuna: registro.vacuna,
      lote: registro.lote,
      cantidad: 1,
      numeroDosis: registro.numeroDosis,
      brigadistaId,
      fecha: registro.fechaAplicacion.toISOString(),
    });

    return {
      registroId: registro.id,
      vacuna: registro.vacuna,
      lote: registro.lote,
      numeroDosis: registro.numeroDosis,
      fechaAplicacion: registro.fechaAplicacion.toISOString(),
      reaccionAdversa: registro.hayReaccionAdversa(),
    };
  }
}
