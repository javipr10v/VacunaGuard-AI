import { DomainException } from '../exceptions/domain.exception';

export enum EstadoTemperatura {
  NORMAL = 'NORMAL',
  ADVERTENCIA = 'ADVERTENCIA',
  CRITICA = 'CRITICA',
}

export class Temperatura {
  static readonly MIN_SEGURA = 2;
  static readonly MAX_SEGURA = 8;
  static readonly MARGEN_ADVERTENCIA = 0.5;

  private constructor(private readonly _celsius: number) {}

  static crear(celsius: number): Temperatura {
    if (typeof celsius !== 'number' || Number.isNaN(celsius)) {
      throw new DomainException('La temperatura debe ser un número válido');
    }
    if (celsius < -100 || celsius > 100) {
      throw new DomainException('Temperatura fuera del rango físico del sensor');
    }
    return new Temperatura(celsius);
  }

  get celsius(): number {
    return this._celsius;
  }

  estado(): EstadoTemperatura {
    if (this._celsius < Temperatura.MIN_SEGURA || this._celsius > Temperatura.MAX_SEGURA) {
      return EstadoTemperatura.CRITICA;
    }
    const cercaDelLimite =
      this._celsius - Temperatura.MIN_SEGURA < Temperatura.MARGEN_ADVERTENCIA ||
      Temperatura.MAX_SEGURA - this._celsius < Temperatura.MARGEN_ADVERTENCIA;
    return cercaDelLimite ? EstadoTemperatura.ADVERTENCIA : EstadoTemperatura.NORMAL;
  }

  esCritica(): boolean {
    return this.estado() === EstadoTemperatura.CRITICA;
  }
}
