import { Lote } from '../../domain/entities/lote.entity';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { LoteDuplicadoException } from '../../domain/exceptions/lote.exceptions';
import type { LoteRepositoryPort } from '../ports/out/lote.repository.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { RegistrarLoteDto } from '../dto/registrar-lote.dto';

export interface LoteResumen {
  id: string;
  vacuna: string;
  numeroLote: string;
  cantidad: number;
  fechaCaducidad: string;
  umbralStockBajo: number;
  hieleraId: string | null;
}

export class RegistrarLoteUseCase {
  constructor(
    private readonly lotes: LoteRepositoryPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async ejecutar(dto: RegistrarLoteDto, hoy: Date = new Date()): Promise<LoteResumen> {
    const caducidad = new Date(dto.fechaCaducidad);
    if (Number.isNaN(caducidad.getTime())) {
      throw new DomainException('La fecha de caducidad no es válida');
    }
    if (caducidad.getTime() <= hoy.getTime()) {
      throw new DomainException('El lote ya está caducado');
    }

    const vacuna = dto.vacuna.trim();
    const numeroLote = dto.numeroLote.trim();
    if (await this.lotes.buscarPorVacunaYLote(vacuna, numeroLote)) {
      throw new LoteDuplicadoException();
    }

    const lote = new Lote(
      this.ids.generar(),
      vacuna,
      numeroLote,
      dto.cantidad,
      caducidad,
      dto.umbralStockBajo ?? 20,
      dto.hieleraId?.trim() || null,
    );
    await this.lotes.guardar(lote);

    return {
      id: lote.id,
      vacuna: lote.vacuna,
      numeroLote: lote.numeroLote,
      cantidad: lote.cantidad,
      fechaCaducidad: lote.fechaCaducidad.toISOString().slice(0, 10),
      umbralStockBajo: lote.umbralStockBajo,
      hieleraId: lote.hieleraId,
    };
  }
}
