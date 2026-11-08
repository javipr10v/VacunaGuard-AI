import { CiudadanoNoEncontradoException } from '../../domain/exceptions/registro.exceptions';
import type { ActualizarCiudadanoDto } from '../dto/actualizar-ciudadano.dto';
import type { CiudadanoRepositoryPort } from '../ports/out/ciudadano.repository.port';

export interface CiudadanoActualizado {
  id: string;
  curp: string;
  nombre: string;
  fechaNacimiento: string;
  edadAnios: number;
}

export class ActualizarCiudadanoUseCase {
  constructor(private readonly ciudadanos: CiudadanoRepositoryPort) {}

  async ejecutar(id: string, dto: ActualizarCiudadanoDto): Promise<CiudadanoActualizado> {
    const ciudadano = await this.ciudadanos.buscarPorId(id);
    if (!ciudadano) throw new CiudadanoNoEncontradoException();

    if (dto.nombre !== undefined) ciudadano.cambiarNombre(dto.nombre);
    if (dto.fechaNacimiento !== undefined) {
      ciudadano.cambiarFechaNacimiento(new Date(dto.fechaNacimiento + 'T00:00:00'));
    }
    await this.ciudadanos.guardar(ciudadano);

    return {
      id: ciudadano.id,
      curp: ciudadano.curp.enmascarada(),
      nombre: ciudadano.nombre,
      fechaNacimiento: ciudadano.fechaNacimiento.toISOString().slice(0, 10),
      edadAnios: ciudadano.edadEnAnios(),
    };
  }
}
