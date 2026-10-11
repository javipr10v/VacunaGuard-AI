import { Temperatura, EstadoTemperatura } from './temperatura.vo';

describe('Temperatura', () => {
  it('5 °C es NORMAL', () => {
    expect(Temperatura.crear(5).estado()).toBe(EstadoTemperatura.NORMAL);
  });
  it('2.2 °C es ADVERTENCIA (cerca del límite)', () => {
    expect(Temperatura.crear(2.2).estado()).toBe(EstadoTemperatura.ADVERTENCIA);
  });
  it('11 °C es CRITICA', () => {
    expect(Temperatura.crear(11).esCritica()).toBe(true);
  });
  it('1.9 °C es CRITICA', () => {
    expect(Temperatura.crear(1.9).esCritica()).toBe(true);
  });
  it('rechaza NaN', () => {
    expect(() => Temperatura.crear(NaN)).toThrow();
  });
});
