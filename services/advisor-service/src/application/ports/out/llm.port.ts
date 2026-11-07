export const LLM_SERVICE = Symbol('LLM_SERVICE');

export interface MensajeLlm {
  rol: 'system' | 'user';
  contenido: string;
}

export interface LlmPort {
  responder(mensajes: MensajeLlm[]): Promise<string>;
}
