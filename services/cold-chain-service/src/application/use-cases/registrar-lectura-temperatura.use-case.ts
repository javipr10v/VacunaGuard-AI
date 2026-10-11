import { Temperatura, EstadoTemperatura } from '../../domain/value-objects/temperatura.vo';
import type { EventPublisherPort } from '../ports/out/event-publisher.port';
import type { RegistrarLecturaDto } from '../dto/registrar-lectura.dto';

export interface ResultadoLectura {
  sensorId: string;
  hielera: string;
  celsius: number;
  estado: EstadoTemperatura;
  alertaPublicada: boolean;
}

export class RegistrarLecturaTemperaturaUseCase {
  constructor(private readonly publisher: EventPublisherPort) {}

  async ejecutar(dto: RegistrarLecturaDto): Promise<ResultadoLectura> {
    const temperatura = Temperatura.crear(dto.temperatura);
    const estado = temperatura.estado();
    let alertaPublicada = false;

    if (temperatura.esCritica()) {
      await this.publisher.publicar('temperatura.critica', {
        sensorId: dto.sensorId,
        hielera: dto.hielera,
        celsius: temperatura.celsius,
        rangoSeguro: [Temperatura.MIN_SEGURA, Temperatura.MAX_SEGURA],
        fecha: new Date().toISOString(),
      });
      alertaPublicada = true;
    }

    return {
      sensorId: dto.sensorId,
      hielera: dto.hielera,
      celsius: temperatura.celsius,
      estado,
      alertaPublicada,
    };
  }
}
