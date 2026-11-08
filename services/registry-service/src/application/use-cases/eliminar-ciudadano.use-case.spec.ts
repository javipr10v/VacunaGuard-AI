import { Ciudadano } from '../../domain/entities/ciudadano.entity';
import { RegistroVacunacion } from '../../domain/entities/registro-vacunacion.entity';
import { Curp } from '../../domain/value-objects/curp.vo';
import { CiudadanosMemoria, RegistrosMemoria } from '../testing/fakes';
import { EliminarCiudadanoUseCase } from './eliminar-ciudadano.use-case';
import { CiudadanoNoEncontradoException } from '../../domain/exceptions/registro.exceptions';

describe('EliminarCiudadanoUseCase', () => {
  it('elimina al ciudadano y sus registros', async () => {
    const ciudadanos = new CiudadanosMemoria();
    const registros = new RegistrosMemoria();
    ciudadanos.items.set('c1', new Ciudadano('c1', Curp.crear('GUMJ900515HCSZRV08'), 'Luis', new Date(2020, 5, 15)));
    registros.items.push(new RegistroVacunacion('r1', 'c1', 'SRP', 'L-01', 1, new Date(2021, 5, 15), 'b1'));
    const r = await new EliminarCiudadanoUseCase(ciudadanos, registros).ejecutar('c1');
    expect(r.eliminado).toBe(true);
    expect(ciudadanos.items.has('c1')).toBe(false);
    expect(registros.items).toHaveLength(0);
  });

  it('lanza 404 si no existe', async () => {
    const ciudadanos = new CiudadanosMemoria();
    const registros = new RegistrosMemoria();
    await expect(new EliminarCiudadanoUseCase(ciudadanos, registros).ejecutar('no')).rejects.toBeInstanceOf(CiudadanoNoEncontradoException);
  });
});
