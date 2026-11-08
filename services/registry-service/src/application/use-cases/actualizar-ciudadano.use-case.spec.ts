import { Ciudadano } from '../../domain/entities/ciudadano.entity';
import { Curp } from '../../domain/value-objects/curp.vo';
import { CiudadanosMemoria } from '../testing/fakes';
import { ActualizarCiudadanoUseCase } from './actualizar-ciudadano.use-case';
import { CiudadanoNoEncontradoException } from '../../domain/exceptions/registro.exceptions';

describe('ActualizarCiudadanoUseCase', () => {
  it('modifica nombre y fecha de nacimiento', async () => {
    const repo = new CiudadanosMemoria();
    repo.items.set('c1', new Ciudadano('c1', Curp.crear('GUMJ900515HCSZRV08'), 'Luis', new Date(2020, 5, 15)));
    const r = await new ActualizarCiudadanoUseCase(repo).ejecutar('c1', { nombre: 'Luis Alberto', fechaNacimiento: '2019-06-15' });
    expect(r.nombre).toBe('Luis Alberto');
    expect(r.fechaNacimiento).toBe('2019-06-15');
    expect(r.curp.includes('*')).toBe(true);
  });

  it('lanza 404 si no existe', async () => {
    const repo = new CiudadanosMemoria();
    await expect(new ActualizarCiudadanoUseCase(repo).ejecutar('no', { nombre: 'X' })).rejects.toBeInstanceOf(CiudadanoNoEncontradoException);
  });
});
