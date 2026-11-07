import { CiudadanoNoEncontradoException } from '../../domain/exceptions/registro.exceptions';
import type { CiudadanoRepositoryPort } from '../ports/out/ciudadano.repository.port';

export interface ConsultaCiudadanoResumen {
  id: string;
  curp: string;
  nombre: string;
  fechaNacimiento: string;
  edadAnios: number;
  edadMeses: number;
}

function resumir(c: { id: string; curp: { enmascarada(): string; valor: string }; nombre: string; fechaNacimiento: Date; edadEnAnios(en: Date): number; edadEnMeses(en: Date): number }): ConsultaCiudadanoResumen {
  const f = c.fechaNacimiento;
  const mm = String(f.getMonth() + 1).padStart(2, '0');
  const dd = String(f.getDate()).padStart(2, '0');
  const hoy = new Date();
  return {
    id: c.id,
    curp: c.curp.enmascarada(),
    nombre: c.nombre,
    fechaNacimiento: f.getFullYear() + '-' + mm + '-' + dd,
    edadAnios: c.edadEnAnios(hoy),
    edadMeses: c.edadEnMeses(hoy),
  };
}

export class ConsultarCiudadanoUseCase {
  constructor(private readonly ciudadanos: CiudadanoRepositoryPort) {}

  async ejecutar(id: string): Promise<ConsultaCiudadanoResumen> {
    const ciudadano = await this.ciudadanos.buscarPorId(id);
    if (!ciudadano) throw new CiudadanoNoEncontradoException();
    return resumir(ciudadano);
  }
}
