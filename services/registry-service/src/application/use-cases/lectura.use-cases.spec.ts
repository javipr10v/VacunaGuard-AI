import { Ciudadano } from '../../domain/entities/ciudadano.entity';
import { RegistroVacunacion } from '../../domain/entities/registro-vacunacion.entity';
import { Curp } from '../../domain/value-objects/curp.vo';
import { CiudadanosMemoria, RegistrosMemoria } from '../testing/fakes';
import { ConsultarCiudadanoUseCase } from './consultar-ciudadano.use-case';
import { BuscarCiudadanoPorCurpUseCase } from './buscar-ciudadano.use-case';
import { ListarVacunacionesUseCase } from './listar-vacunaciones.use-case';
import { CiudadanoNoEncontradoException } from '../../domain/exceptions/registro.exceptions';

describe('Casos de uso de lectura (registry)', () => {
  const ciudadano = new Ciudadano('c1', Curp.crear('GUMJ900515HCSZRV08'), 'Luis Gómez', new Date(2020, 5, 15));

  it('consultar devuelve resumen con CURP enmascarada y edad', async () => {
    const repo = new CiudadanosMemoria();
    await repo.guardar(ciudadano);
    const r = await new ConsultarCiudadanoUseCase(repo).ejecutar('c1');
    expect(r.nombre).toBe('Luis Gómez');
    expect(r.curp).toMatch(/^GUMJ\*+08$/);
    expect(r.edadAnios).toBeGreaterThanOrEqual(5);
  });

  it('consultar lanza 404 si no existe', async () => {
    const repo = new CiudadanosMemoria();
    await expect(new ConsultarCiudadanoUseCase(repo).ejecutar('no')).rejects.toBeInstanceOf(CiudadanoNoEncontradoException);
  });

  it('buscar por CURP encuentra al ciudadano o devuelve null', async () => {
    const repo = new CiudadanosMemoria();
    await repo.guardar(ciudadano);
    const useCase = new BuscarCiudadanoPorCurpUseCase(repo, new ConsultarCiudadanoUseCase(repo));
    const r = await useCase.ejecutar('gumj900515hcszrv08');
    expect(r?.id).toBe('c1');
    expect(await useCase.ejecutar('AAAA000101HCSZRV00')).toBeNull();
  });

  it('lista las vacunaciones de un ciudadano', async () => {
    const registros = new RegistrosMemoria();
    registros.items.push(
      new RegistroVacunacion('r1', 'c1', 'SRP', 'L-01', 1, new Date(2021, 5, 15), 'b1', null),
      new RegistroVacunacion('r2', 'c1', 'SRP', 'L-01', 2, new Date(2021, 11, 15), 'b1', 'Fiebre leve'),
    );
    const r = await new ListarVacunacionesUseCase(registros).ejecutar('c1');
    expect(r).toHaveLength(2);
    expect(r[1].reaccionAdversa).toBe(true);
  });
});
