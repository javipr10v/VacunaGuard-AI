import type { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import type { Ruta } from '../../domain/entities/ruta.entity';
import type { UbicacionBrigadista } from '../../domain/entities/ubicacion.entity';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { NotificadorUbicacionesPort, UbicacionResumen } from '../ports/out/notificador-ubicaciones.port';
import type { PuntoVisitaRepositoryPort } from '../ports/out/punto-visita.repository.port';
import type { RutaRepositoryPort } from '../ports/out/ruta.repository.port';
import type { UbicacionRepositoryPort } from '../ports/out/ubicacion.repository.port';

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
  async listarTodas() {
    return [...this.items.values()];
  }
}

export class UbicacionesMemoria implements UbicacionRepositoryPort {
  items: UbicacionBrigadista[] = [];
  async guardar(u: UbicacionBrigadista) {
    this.items.push(u);
  }
  async recientes(minutos: number) {
    const limite = Date.now() - minutos * 60_000;
    return this.items.filter((u) => u.fecha.getTime() >= limite);
  }
}

export class NotificadorFalso implements NotificadorUbicacionesPort {
  resumenes: UbicacionResumen[] = [];
  ubicacionActualizada(resumen: UbicacionResumen) {
    this.resumenes.push(resumen);
  }
}

export class IdsFalso implements IdGeneratorPort {
  private n = 0;
  generar() {
    return 'id-' + ++this.n;
  }
}
