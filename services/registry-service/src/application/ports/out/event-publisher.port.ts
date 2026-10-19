export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER');

export interface EventPublisherPort {
  publicar(evento: string, payload: Record<string, unknown>): Promise<void>;
}
