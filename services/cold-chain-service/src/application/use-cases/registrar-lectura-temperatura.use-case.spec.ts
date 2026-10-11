import { RegistrarLecturaTemperaturaUseCase } from './registrar-lectura-temperatura.use-case';

describe('RegistrarLecturaTemperaturaUseCase', () => {
  const crear = () => {
    const publicar = jest.fn().mockResolvedValue(undefined);
    const useCase = new RegistrarLecturaTemperaturaUseCase({ publicar });
    return { useCase, publicar };
  };

  it('no publica alerta con 5 °C', async () => {
    const { useCase, publicar } = crear();
    const r = await useCase.ejecutar({ sensorId: 's1', hielera: 'H-01', temperatura: 5 });
    expect(r.alertaPublicada).toBe(false);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('publica temperatura.critica con 11 °C', async () => {
    const { useCase, publicar } = crear();
    const r = await useCase.ejecutar({ sensorId: 's1', hielera: 'H-01', temperatura: 11 });
    expect(r.alertaPublicada).toBe(true);
    expect(publicar).toHaveBeenCalledWith(
      'temperatura.critica',
      expect.objectContaining({ hielera: 'H-01', celsius: 11 }),
    );
  });
});
