import type { RegistroVacunacion } from '../../../domain/entities/registro-vacunacion.entity';

export const REGISTRO_REPOSITORY = Symbol('REGISTRO_REPOSITORY');

export interface RegistroRepositoryPort {
  guardar(registro: RegistroVacunacion): Promise<void>;
  existeDosis(ciudadanoId: string, vacuna: string, numeroDosis: number): Promise<boolean>;
  listarPorCiudadano(ciudadanoId: string): Promise<RegistroVacunacion[]>;
  eliminarPorCiudadano(ciudadanoId: string): Promise<number>;
}
