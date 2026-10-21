import type { Lote } from '../../domain/entities/lote.entity';
import type { LoteRepositoryPort } from '../ports/out/lote.repository.port';
import type { EventPublisherPort } from '../ports/out/event-publisher.port';

export class LotesMemoria implements LoteRepositoryPort {
  items = new Map<string, Lote>();
  async guardar(l: Lote) {
    this.items.set(l.id, l);
  }
  async buscarPorId(id: string) {
    return this.items.get(id) ?? null;
  }
  async buscarPorVacunaYLote(vacuna: string, numeroLote: string) {
    return (
      [...this.items.values()].find((l) => l.vacuna === vacuna && l.numeroLote === numeroLote) ??
      null
    );
  }
  async listar() {
    return [...this.items.values()];
  }
}

export class PublisherFalso implements EventPublisherPort {
  eventos: { evento: string; payload: Record<string, unknown> }[] = [];
  async publicar(evento: string, payload: Record<string, unknown>) {
    this.eventos.push({ evento, payload });
  }
}
