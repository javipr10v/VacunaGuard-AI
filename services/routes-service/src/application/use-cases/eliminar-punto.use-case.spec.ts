import { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import { PuntosMemoria } from '../testing/fakes';
import { EliminarPuntoUseCase } from './eliminar-punto.use-case';
import { PuntoNoEncontradoException } from '../../domain/exceptions/ruta.exceptions';

describe('EliminarPuntoUseCase', () => {
  it('elimina un punto existente', async () => {
    const repo = new PuntosMemoria();
    repo.items.set('p1', new PuntoVisita('p1', 'Parque', Coordenada.crear(16.7, -93.1), 20));
    const r = await new EliminarPuntoUseCase(repo).ejecutar('p1');
    expect(r.eliminado).toBe(true);
    expect(repo.items.has('p1')).toBe(false);
  });

  it('lanza 404 si el punto no existe', async () => {
    const repo = new PuntosMemoria();
    await expect(new EliminarPuntoUseCase(repo).ejecutar('no')).rejects.toBeInstanceOf(PuntoNoEncontradoException);
  });
});
