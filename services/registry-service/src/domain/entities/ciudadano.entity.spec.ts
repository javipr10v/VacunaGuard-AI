import { Ciudadano } from './ciudadano.entity';
import { Curp } from '../value-objects/curp.vo';

const curp = Curp.crear('GUMJ900515HCSZRV08');

describe('Ciudadano', () => {
  it('calcula la edad en años', () => {
    const c = new Ciudadano('c1', curp, 'Luis Gómez', new Date(2020, 5, 15));
    expect(c.edadEnAnios(new Date(2026, 5, 14))).toBe(5);
    expect(c.edadEnAnios(new Date(2026, 5, 15))).toBe(6);
  });
  it('calcula la edad en meses', () => {
    const c = new Ciudadano('c1', curp, 'Luis Gómez', new Date(2026, 0, 15));
    expect(c.edadEnMeses(new Date(2026, 3, 14))).toBe(2);
    expect(c.edadEnMeses(new Date(2026, 3, 15))).toBe(3);
  });
  it('rechaza un nombre vacío', () => {
    expect(() => new Ciudadano('c1', curp, '  ', new Date(2000, 0, 1))).toThrow();
  });
  it('rechaza una fecha de nacimiento futura', () => {
    expect(() => new Ciudadano('c1', curp, 'Luis', new Date(2999, 0, 1))).toThrow();
  });
});
