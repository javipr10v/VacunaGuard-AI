import { PasswordPlano } from './password-plano.vo';

describe('PasswordPlano', () => {
  it('acepta una contraseña válida', () => {
    expect(() => PasswordPlano.validar('Segura2026')).not.toThrow();
  });
  it('rechaza una contraseña corta', () => {
    expect(() => PasswordPlano.validar('Ab1')).toThrow();
  });
  it('rechaza una sin mayúscula', () => {
    expect(() => PasswordPlano.validar('segura2026')).toThrow();
  });
  it('rechaza una sin número', () => {
    expect(() => PasswordPlano.validar('SeguraClave')).toThrow();
  });
});
