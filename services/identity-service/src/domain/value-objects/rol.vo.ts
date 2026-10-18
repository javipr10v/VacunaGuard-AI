export enum Rol {
  ADMINISTRADOR = 'ADMINISTRADOR',
  COORDINADOR = 'COORDINADOR',
  BRIGADISTA = 'BRIGADISTA',
}

export function esRol(valor: string): valor is Rol {
  return Object.values(Rol).includes(valor as Rol);
}
