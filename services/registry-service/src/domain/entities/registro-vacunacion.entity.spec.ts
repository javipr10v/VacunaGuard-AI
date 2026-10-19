import { RegistroVacunacion } from './registro-vacunacion.entity';

const crear = (cambios: Partial<{ vacuna: string; dosis: number; fecha: Date; reaccion: string | null }> = {}) =>
  new RegistroVacunacion(
    'r1',
    'c1',
    cambios.vacuna ?? 'Influenza',
    'L-2026-01',
    cambios.dosis ?? 1,
    cambios.fecha ?? new Date(2026, 0, 10),
    'b1',
    cambios.reaccion ?? null,
  );

describe('RegistroVacunacion', () => {
  it('se crea con datos válidos', () => {
    const r = crear();
    expect(r.numeroDosis).toBe(1);
    expect(r.hayReaccionAdversa()).toBe(false);
  });
  it('rechaza la dosis 0', () => {
    expect(() => crear({ dosis: 0 })).toThrow();
  });
  it('rechaza una dosis decimal', () => {
    expect(() => crear({ dosis: 1.5 })).toThrow();
  });
  it('rechaza una fecha futura', () => {
    expect(() => crear({ fecha: new Date(2999, 0, 1) })).toThrow();
  });
  it('rechaza una vacuna vacía', () => {
    expect(() => crear({ vacuna: ' ' })).toThrow();
  });
  it('detecta una reacción adversa', () => {
    expect(crear({ reaccion: 'Fiebre leve' }).hayReaccionAdversa()).toBe(true);
  });
});
