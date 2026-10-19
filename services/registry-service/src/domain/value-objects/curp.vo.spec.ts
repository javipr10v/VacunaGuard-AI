import { Curp } from './curp.vo';

describe('Curp', () => {
  it('acepta una CURP válida y la pasa a mayúsculas', () => {
    expect(Curp.crear(' gumj900515hcszrv08 ').valor).toBe('GUMJ900515HCSZRV08');
  });
  it('rechaza una CURP con longitud incorrecta', () => {
    expect(() => Curp.crear('GUMJ900515')).toThrow();
  });
  it('rechaza una CURP con mes inválido', () => {
    expect(() => Curp.crear('GUMJ901315HCSZRV08')).toThrow();
  });
  it('la enmascara dejando solo el inicio y el final', () => {
    expect(Curp.crear('GUMJ900515HCSZRV08').enmascarada()).toBe('GUMJ************08');
  });
});
