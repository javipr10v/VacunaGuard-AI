import { DomainException } from '../exceptions/domain.exception';

export class Coordenada {
  private static readonly RADIO_TIERRA_KM = 6371;

  private constructor(
    public readonly latitud: number,
    public readonly longitud: number,
  ) {}

  static crear(latitud: number, longitud: number): Coordenada {
    if (
      typeof latitud !== 'number' ||
      typeof longitud !== 'number' ||
      !Number.isFinite(latitud) ||
      !Number.isFinite(longitud)
    ) {
      throw new DomainException('La coordenada debe tener números válidos');
    }
    if (latitud < -90 || latitud > 90) {
      throw new DomainException('La latitud debe estar entre -90 y 90');
    }
    if (longitud < -180 || longitud > 180) {
      throw new DomainException('La longitud debe estar entre -180 y 180');
    }
    return new Coordenada(latitud, longitud);
  }

  distanciaKm(otra: Coordenada): number {
    const rad = (grados: number) => (grados * Math.PI) / 180;
    const dLat = rad(otra.latitud - this.latitud);
    const dLon = rad(otra.longitud - this.longitud);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(rad(this.latitud)) * Math.cos(rad(otra.latitud)) * Math.sin(dLon / 2) ** 2;
    return 2 * Coordenada.RADIO_TIERRA_KM * Math.asin(Math.min(1, Math.sqrt(a)));
  }
}
