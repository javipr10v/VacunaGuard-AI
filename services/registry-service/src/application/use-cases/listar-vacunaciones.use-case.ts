import type { RegistroRepositoryPort } from '../ports/out/registro.repository.port';

export interface VacunacionResumen {
  id: string;
  vacuna: string;
  lote: string;
  numeroDosis: number;
  fechaAplicacion: string;
  reaccionAdversa: boolean;
}

export class ListarVacunacionesUseCase {
  constructor(private readonly registros: RegistroRepositoryPort) {}

  async ejecutar(ciudadanoId: string): Promise<VacunacionResumen[]> {
    const registros = await this.registros.listarPorCiudadano(ciudadanoId);
    return registros.map((r) => ({
      id: r.id,
      vacuna: r.vacuna,
      lote: r.lote,
      numeroDosis: r.numeroDosis,
      fechaAplicacion: r.fechaAplicacion.toISOString(),
      reaccionAdversa: r.hayReaccionAdversa(),
    }));
  }
}
