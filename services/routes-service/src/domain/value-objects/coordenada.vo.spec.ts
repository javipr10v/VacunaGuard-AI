import { Coordenada } from './coordenada.vo';

describe('Coordenada', () => {
  it('crea una coordenada válida', () => {
    const c = Coordenada.crear(16.75, -93.11);
    expect(c.latitud).toBe(16.75);
    expect(c.longitud).toBe(-93.11);
  });
  it('rechaza una latitud fuera de rango', () => {
    expect(() => Coordenada.crear(91, 0)).toThrow('latitud');
  });
  it('rechaza una longitud fuera de rango', () => {
    expect(() => Coordenada.crear(0, 181)).toThrow('longitud');
  });
  it('rechaza valores que no son números', () => {
    expect(() => Coordenada.crear(NaN, 0)).toThrow();
  });
  it('la distancia a sí misma es 0', () => {
    const c = Coordenada.crear(16.75, -93.11);
    expect(c.distanciaKm(c)).toBe(0);
  });
  it('un grado de latitud mide unos 111.19 km', () => {
    const d = Coordenada.crear(0, 0).distanciaKm(Coordenada.crear(1, 0));
    expect(d).toBeCloseTo(111.19, 0);
  });
  it('Tuxtla a San Cristóbal queda entre 49 y 53 km en línea recta', () => {
    const tuxtla = Coordenada.crear(16.7528, -93.1152);
    const sancris = Coordenada.crear(16.737, -92.6376);
    const d = tuxtla.distanciaKm(sancris);
    expect(d).toBeGreaterThan(49);
    expect(d).toBeLessThan(53);
  });
  it('la distancia es simétrica', () => {
    const a = Coordenada.crear(16.75, -93.11);
    const b = Coordenada.crear(17.1, -92.9);
    expect(a.distanciaKm(b)).toBeCloseTo(b.distanciaKm(a), 8);
  });
});
