import type { Ciudadano } from '../../../domain/entities/ciudadano.entity';
import type { Curp } from '../../../domain/value-objects/curp.vo';

export const CIUDADANO_REPOSITORY = Symbol('CIUDADANO_REPOSITORY');

export interface CiudadanoRepositoryPort {
  guardar(ciudadano: Ciudadano): Promise<void>;
  buscarPorCurp(curp: Curp): Promise<Ciudadano | null>;
  buscarPorId(id: string): Promise<Ciudadano | null>;
}
