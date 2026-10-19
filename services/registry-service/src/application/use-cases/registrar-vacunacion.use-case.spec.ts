import { RegistrarVacunacionUseCase } from './registrar-vacunacion.use-case';
import { RegistrarCiudadanoUseCase } from './registrar-ciudadano.use-case';
import {
  CiudadanosMemoria,
  RegistrosMemoria,
  PublisherFalso,
  IdsFalso,
} from '../testing/fakes';

const preparar = async () => {
  const ciudadanos = new CiudadanosMemoria();
  const registros = new RegistrosMemoria();
  const publisher = new PublisherFalso();
  const ids = new IdsFalso();
  const ciudadano = await new RegistrarCiudadanoUseCase(ciudadanos, ids).ejecutar({
    curp: 'GUMJ900515HCSZRV08',
    nombre: 'Luis Gómez',
    fechaNacimiento: '2020-06-15',
  });
  const useCase = new RegistrarVacunacionUseCase(ciudadanos, registros, publisher, ids);
  const dto = {
    ciudadanoId: ciudadano.id,
    vacuna: 'Influenza',
    lote: 'L-2026-01',
    numeroDosis: 1,
  };
  return { registros, publisher, useCase, dto };
};

describe('RegistrarVacunacionUseCase', () => {
  it('registra la vacunación y publica vacuna.aplicada', async () => {
    const { registros, publisher, useCase, dto } = await preparar();
    const r = await useCase.ejecutar(dto, 'brigadista-1');
    expect(r.vacuna).toBe('Influenza');
    expect(r.reaccionAdversa).toBe(false);
    expect(registros.items).toHaveLength(1);
    expect(publisher.eventos).toHaveLength(1);
    expect(publisher.eventos[0].evento).toBe('vacuna.aplicada');
    expect(publisher.eventos[0].payload).toMatchObject({
      vacuna: 'Influenza',
      lote: 'L-2026-01',
      cantidad: 1,
      brigadistaId: 'brigadista-1',
    });
  });
  it('el evento no incluye datos personales del ciudadano', async () => {
    const { publisher, useCase, dto } = await preparar();
    await useCase.ejecutar(dto, 'brigadista-1');
    const claves = Object.keys(publisher.eventos[0].payload);
    expect(claves).not.toContain('curp');
    expect(claves).not.toContain('nombre');
    expect(claves).not.toContain('ciudadanoId');
  });
  it('rechaza un ciudadano que no existe', async () => {
    const { useCase, dto } = await preparar();
    await expect(useCase.ejecutar({ ...dto, ciudadanoId: 'no-existe' }, 'b1')).rejects.toThrow(
      'Ciudadano no encontrado',
    );
  });
  it('rechaza la misma dosis registrada dos veces y no publica el evento', async () => {
    const { publisher, useCase, dto } = await preparar();
    await useCase.ejecutar(dto, 'b1');
    await expect(useCase.ejecutar(dto, 'b1')).rejects.toThrow('ya fue registrada');
    expect(publisher.eventos).toHaveLength(1);
  });
  it('marca la reacción adversa cuando se reporta', async () => {
    const { useCase, dto } = await preparar();
    const r = await useCase.ejecutar({ ...dto, reaccionAdversa: 'Fiebre leve' }, 'b1');
    expect(r.reaccionAdversa).toBe(true);
  });
});
