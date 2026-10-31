import { Ruta } from './ruta.entity';
import { PuntoVisita } from './punto-visita.entity';
import { Coordenada } from '../value-objects/coordenada.vo';

const punto = (id: string, lon: number, personas = 0) =>
  new PuntoVisita(id, 'Punto ' + id, Coordenada.crear(0, lon), personas);
const origen = Coordenada.crear(0, 0);

describe('Ruta', () => {
  it('planifica las paradas en orden de cercanía', () => {
    const r = Ruta.planificar('r1', 'b1', origen, [punto('C', 3), punto('A', 1), punto('B', 2)]);
    expect(r.paradas.map((p) => p.id)).toEqual(['A', 'B', 'C']);
  });
  it('calcula la distancia total y las personas estimadas', () => {
    const r = Ruta.planificar('r1', 'b1', origen, [punto('A', 1, 30), punto('B', 2, 20)]);
    expect(r.distanciaTotalKm()).toBeGreaterThan(222);
    expect(r.personasEstimadas()).toBe(50);
  });
  it('rechaza una brigada vacía', () => {
    expect(() => Ruta.planificar('r1', ' ', origen, [punto('A', 1)])).toThrow('brigada');
  });
  it('rechaza puntos repetidos', () => {
    expect(() => Ruta.planificar('r1', 'b1', origen, [punto('A', 1), punto('A', 2)])).toThrow('repetidos');
  });
  it('rechaza más de 50 paradas', () => {
    const muchos = Array.from({ length: 51 }, (_, i) => punto('P' + i, i * 0.01));
    expect(() => Ruta.planificar('r1', 'b1', origen, muchos)).toThrow('máximo');
  });
});
