import { Email } from './email.vo';

describe('Email', () => {
  it('normaliza espacios y mayúsculas', () => {
    expect(Email.crear('  Ana@Correo.COM ').valor).toBe('ana@correo.com');
  });
  it('rechaza un correo sin arroba', () => {
    expect(() => Email.crear('anacorreo.com')).toThrow();
  });
  it('rechaza un correo vacío', () => {
    expect(() => Email.crear('')).toThrow();
  });
  it('compara dos correos iguales', () => {
    expect(Email.crear('a@b.com').equals(Email.crear('A@B.com'))).toBe(true);
  });
});
