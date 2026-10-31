import { PuntoVisita } from './punto-visita.entity';
import { Coordenada } from '../value-objects/coordenada.vo';

const coord = Coordenada.crear(16.75, -93.11);

describe('PuntoVisita', () => {
  it('se crea con datos válidos', () => {
    const p = new PuntoVisita('p1', 'Escuela Benito Juárez', coord, 40);
    expect(p.personasEstimadas).toBe(40);
  });
  it('rechaza un nombre vacío', () => {
    expect(() => new PuntoVisita('p1', '  ', coord)).toThrow();
  });
  it('rechaza personas negativas o decimales', () => {
    expect(() => new PuntoVisita('p1', 'Centro', coord, -1)).toThrow();
    expect(() => new PuntoVisita('p1', 'Centro', coord, 2.5)).toThrow();
  });
});
