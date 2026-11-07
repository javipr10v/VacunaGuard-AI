export const EMBEDDING_SERVICE = Symbol('EMBEDDING_SERVICE');

export interface EmbeddingPort {
  generar(texto: string): Promise<number[]>;
}
