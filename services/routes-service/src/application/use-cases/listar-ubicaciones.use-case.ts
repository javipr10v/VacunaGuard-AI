import type { UbicacionResumen } from '../ports/out/notificador-ubicaciones.port';
import type { UbicacionRepositoryPort } from '../ports/out/ubicacion.repository.port';

export class ListarUbicacionesUseCase {
  constructor(private readonly ubicaciones: UbicacionRepositoryPort) {}

  async ejecutar(minutos = 5): Promise<UbicacionResumen[]> {
    const recientes = await this.ubicaciones.recientes(minutos);
    return recientes.map((u) => ({
      id: u.id,
      brigadistaId: u.brigadistaId,
      brigadaId: u.brigadaId,
      latitud: u.coordenada.latitud,
      longitud: u.coordenada.longitud,
      fecha: u.fecha.toISOString(),
    }));
  }
}
