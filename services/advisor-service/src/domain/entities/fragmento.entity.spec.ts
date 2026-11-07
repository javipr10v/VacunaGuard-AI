import { Fragmento } from './fragmento.entity';

describe('Fragmento', () => {
  it('arma la cita con documento, año y página', () => {
    const f = new Fragmento('Manual de Vacunación', 2021, 12, 0, 'texto del fragmento');
    expect(f.cita).toBe('Manual de Vacunación (2021), p. 12');
  });
  it('cita s.f. cuando el año es desconocido (anio 0)', () => {
    const f = new Fragmento('Resumen de la Red de Frío', 0, 3, 0, 'texto');
    expect(f.cita).toBe('Resumen de la Red de Frío (s.f.), p. 3');
  });
  it('rechaza un año negativo', () => {
    expect(() => new Fragmento('Manual', -1, 1, 0, 'texto')).toThrow('año');
  });
  it('rechaza un texto vacío', () => {
    expect(() => new Fragmento('Manual', 2021, 1, 0, '   ')).toThrow('texto');
  });
  it('rechaza la página 0', () => {
    expect(() => new Fragmento('Manual', 2021, 0, 0, 'texto')).toThrow('página');
  });
});
