import { UbicacionBrigadista } from '../../domain/entities/ubicacion.entity';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import type { RegistrarUbicacionDto } from '../dto/registrar-ubicacion.dto';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { NotificadorUbicacionesPort, UbicacionResumen } from '../ports/out/notificador-ubicaciones.port';
import type { UbicacionRepositoryPort } from '../ports/out/ubicacion.repository.port';

export class RegistrarUbicacionUseCase {
  constructor(
    private readonly ubicaciones: UbicacionRepositoryPort,
    private readonly ids: IdGeneratorPort,
    private readonly notificador: NotificadorUbicacionesPort,
  ) {}

  async ejecutar(
    dto: RegistrarUbicacionDto,
    brigadistaId: string,
    nombre: string,
    brigadaId: string | null,
  ): Promise<UbicacionResumen> {
    const coordenada = Coordenada.crear(dto.latitud, dto.longitud);
    const ubicacion = new UbicacionBrigadista(
      this.ids.generar(),
      brigadistaId,
      nombre,
      brigadaId,
      coordenada,
      new Date(),
    );
    await this.ubicaciones.guardar(ubicacion);
    const resumen: UbicacionResumen = {
      id: ubicacion.id,
      brigadistaId: ubicacion.brigadistaId,
      nombre: ubicacion.nombre,
      brigadaId: ubicacion.brigadaId,
      latitud: ubicacion.coordenada.latitud,
      longitud: ubicacion.coordenada.longitud,
      fecha: ubicacion.fecha.toISOString(),
    };
    this.notificador.ubicacionActualizada(resumen);
    return resumen;
  }
}
