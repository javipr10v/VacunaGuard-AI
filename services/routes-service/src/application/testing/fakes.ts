import type { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import type { Ruta } from '../../domain/entities/ruta.entity';
import type { PuntoVisitaRepositoryPort } from '../ports/out/punto-visita.repository.port';
import type { RutaRepositoryPort } from '../ports/out/ruta.repository.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';

export class PuntosMemoria implements PuntoVisitaRepositoryPort {
  items = new Map<string, PuntoVisita>();
  async guardar(p: PuntoVisita) {
    this.items.set(p.id, p);
  }
  async buscarPorIds(ids: string[]) {
    return ids.map((id) => this.items.get(id)).filter((p): p is PuntoVisita => !!p);
  }
  async listar() {
    return [...this.items.values()];
  }
}

export class RutasMemoria implements RutaRepositoryPort {
  items = new Map<string, Ruta>();
  async guardar(r: Ruta) {
    this.items.set(r.id, r);
  }
  async buscarPorId(id: string) {
    return this.items.get(id) ?? null;
  }
  async listarPorBrigada(brigadaId: string) {
    return [...this.items.values()].filter((r) => r.brigadaId === brigadaId);
  }
}

export class IdsFalso implements IdGeneratorPort {
  private n = 0;
  generar() {
    return 'id-' + ++this.n;
  }
}
