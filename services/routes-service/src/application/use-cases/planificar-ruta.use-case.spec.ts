import { PlanificarRutaUseCase } from './planificar-ruta.use-case';
import { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import { PuntosMemoria, RutasMemoria, IdsFalso } from '../testing/fakes';

const crear = () => {
  const puntos = new PuntosMemoria();
  const rutas = new RutasMemoria();
  [['A', 1, 30], ['B', 2, 20], ['C', 3, 10]].forEach(([id, lon, personas]) =>
    puntos.items.set(
      id as string,
      new PuntoVisita(id as string, 'Punto ' + id, Coordenada.crear(0, lon as number), personas as number),
    ),
  );
  return { rutas, useCase: new PlanificarRutaUseCase(puntos, rutas, new IdsFalso()) };
};

const dto = { brigadaId: 'brigada-1', origenLatitud: 0, origenLongitud: 0, puntoIds: ['C', 'A', 'B'] };

describe('PlanificarRutaUseCase', () => {
  it('ordena las paradas por cercanía sin importar el orden pedido', async () => {
    const { useCase } = crear();
    const r = await useCase.ejecutar(dto);
    expect(r.paradas.map((p) => p.id)).toEqual(['A', 'B', 'C']);
    expect(r.paradas.map((p) => p.orden)).toEqual([1, 2, 3]);
    expect(r.personasEstimadas).toBe(60);
    expect(r.distanciaTotalKm).toBeGreaterThan(333);
    expect(r.distanciaTotalKm).toBeLessThan(334);
  });
  it('guarda la ruta planificada', async () => {
    const { rutas, useCase } = crear();
    await useCase.ejecutar(dto);
    expect(rutas.items.size).toBe(1);
  });
  it('rechaza si algún punto no existe', async () => {
    const { rutas, useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, puntoIds: ['A', 'NO-EXISTE'] })).rejects.toThrow('no existe');
    expect(rutas.items.size).toBe(0);
  });
  it('rechaza puntos repetidos', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar({ ...dto, puntoIds: ['A', 'A'] })).rejects.toThrow('repetidos');
  });
});
