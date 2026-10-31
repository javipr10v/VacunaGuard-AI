import { OptimizadorRuta } from './optimizador-ruta.service';
import { PuntoVisita } from '../entities/punto-visita.entity';
import { Coordenada } from '../value-objects/coordenada.vo';

const punto = (id: string, lat: number, lon: number) =>
  new PuntoVisita(id, 'Punto ' + id, Coordenada.crear(lat, lon));
const origen = Coordenada.crear(0, 0);

describe('OptimizadorRuta', () => {
  it('ordena por vecino más cercano', () => {
    const orden = OptimizadorRuta.ordenar(origen, [punto('A', 0, 1), punto('B', 0, 3), punto('C', 0, 2)]);
    expect(orden.map((p) => p.id)).toEqual(['A', 'C', 'B']);
  });
  it('no modifica el arreglo original', () => {
    const originales = [punto('A', 0, 3), punto('B', 0, 1)];
    OptimizadorRuta.ordenar(origen, originales);
    expect(originales.map((p) => p.id)).toEqual(['A', 'B']);
  });
  it('devuelve una lista vacía si no hay puntos', () => {
    expect(OptimizadorRuta.ordenar(origen, [])).toEqual([]);
  });
  it('desempata por id cuando dos puntos están igual de lejos', () => {
    const orden = OptimizadorRuta.ordenar(origen, [punto('b', 0, 1), punto('a', 0, -1)]);
    expect(orden[0].id).toBe('a');
  });
  it('suma los tramos de la ruta', () => {
    const total = OptimizadorRuta.distanciaTotalKm(origen, [punto('A', 0, 1), punto('B', 0, 2)]);
    expect(total).toBeGreaterThan(222);
    expect(total).toBeLessThan(223);
  });
});
