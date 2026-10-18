import { Usuario } from './usuario.entity';
import { Email } from '../value-objects/email.vo';
import { Rol } from '../value-objects/rol.vo';

const crear = (rol: Rol) =>
  new Usuario('u1', 'Ana Pérez', Email.crear('ana@correo.com'), 'hash', rol);

describe('Usuario', () => {
  it('se crea activo y con su rol', () => {
    const u = crear(Rol.BRIGADISTA);
    expect(u.activo).toBe(true);
    expect(u.rol).toBe(Rol.BRIGADISTA);
  });
  it('rechaza un nombre vacío', () => {
    expect(() => new Usuario('u1', '  ', Email.crear('a@b.com'), 'hash', Rol.BRIGADISTA)).toThrow();
  });
  it('no puede iniciar sesión si está desactivado', () => {
    const u = crear(Rol.BRIGADISTA);
    u.desactivar();
    expect(u.puedeIniciarSesion()).toBe(false);
  });
  it('un administrador no se asigna a una brigada', () => {
    expect(() => crear(Rol.ADMINISTRADOR).asignarBrigada('b1')).toThrow();
  });
  it('un brigadista sí se asigna a una brigada', () => {
    const u = crear(Rol.BRIGADISTA);
    u.asignarBrigada('b1');
    expect(u.brigadaId).toBe('b1');
  });
  it('valida permisos por rol', () => {
    const u = crear(Rol.COORDINADOR);
    expect(u.tienePermiso([Rol.ADMINISTRADOR, Rol.COORDINADOR])).toBe(true);
    expect(u.tienePermiso([Rol.ADMINISTRADOR])).toBe(false);
  });
});
