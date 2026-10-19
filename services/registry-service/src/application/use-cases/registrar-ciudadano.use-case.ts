import { Ciudadano } from '../../domain/entities/ciudadano.entity';
import { Curp } from '../../domain/value-objects/curp.vo';
import type { CiudadanoRepositoryPort } from '../ports/out/ciudadano.repository.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { RegistrarCiudadanoDto } from '../dto/registrar-ciudadano.dto';

export interface CiudadanoResumen {
  id: string;
  curp: string;
  nombre: string;
  fechaNacimiento: string;
  yaExistia: boolean;
}

export class RegistrarCiudadanoUseCase {
  constructor(
    private readonly ciudadanos: CiudadanoRepositoryPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async ejecutar(dto: RegistrarCiudadanoDto): Promise<CiudadanoResumen> {
    const curp = Curp.crear(dto.curp);

    const existente = await this.ciudadanos.buscarPorCurp(curp);
    if (existente) return this.resumir(existente, true);

    const [anio, mes, dia] = dto.fechaNacimiento.split('-').map(Number);
    const ciudadano = new Ciudadano(
      this.ids.generar(),
      curp,
      dto.nombre,
      new Date(anio, mes - 1, dia),
    );
    await this.ciudadanos.guardar(ciudadano);
    return this.resumir(ciudadano, false);
  }

  private resumir(c: Ciudadano, yaExistia: boolean): CiudadanoResumen {
    const f = c.fechaNacimiento;
    const mm = String(f.getMonth() + 1).padStart(2, '0');
    const dd = String(f.getDate()).padStart(2, '0');
    return {
      id: c.id,
      curp: c.curp.enmascarada(),
      nombre: c.nombre,
      fechaNacimiento: `${f.getFullYear()}-${mm}-${dd}`,
      yaExistia,
    };
  }
}
