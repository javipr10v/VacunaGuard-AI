import type { Ciudadano } from '../../domain/entities/ciudadano.entity';
import type { RegistroVacunacion } from '../../domain/entities/registro-vacunacion.entity';
import type { Curp } from '../../domain/value-objects/curp.vo';
import type { CiudadanoRepositoryPort } from '../ports/out/ciudadano.repository.port';
import type { RegistroRepositoryPort } from '../ports/out/registro.repository.port';
import type { EventPublisherPort } from '../ports/out/event-publisher.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';

export class CiudadanosMemoria implements CiudadanoRepositoryPort {
  items = new Map<string, Ciudadano>();
  async guardar(c: Ciudadano) {
    this.items.set(c.id, c);
  }
  async buscarPorCurp(curp: Curp) {
    return [...this.items.values()].find((c) => c.curp.equals(curp)) ?? null;
  }
  async buscarPorId(id: string) {
    return this.items.get(id) ?? null;
  }
}

export class RegistrosMemoria implements RegistroRepositoryPort {
  items: RegistroVacunacion[] = [];
  async guardar(r: RegistroVacunacion) {
    this.items.push(r);
  }
  async existeDosis(ciudadanoId: string, vacuna: string, numeroDosis: number) {
    return this.items.some(
      (r) =>
        r.ciudadanoId === ciudadanoId &&
        r.vacuna === vacuna &&
        r.numeroDosis === numeroDosis,
    );
  }
  async listarPorCiudadano(ciudadanoId: string) {
    return this.items.filter((r) => r.ciudadanoId === ciudadanoId);
  }
}

export class PublisherFalso implements EventPublisherPort {
  eventos: { evento: string; payload: Record<string, unknown> }[] = [];
  async publicar(evento: string, payload: Record<string, unknown>) {
    this.eventos.push({ evento, payload });
  }
}

export class IdsFalso implements IdGeneratorPort {
  private n = 0;
  generar() {
    return 'id-' + ++this.n;
  }
}
