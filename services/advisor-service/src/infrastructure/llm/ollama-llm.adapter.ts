import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmPort, MensajeLlm } from '../../application/ports/out/llm.port';

interface RespuestaChat {
  message?: { content?: string };
}

@Injectable()
export class OllamaLlmAdapter implements LlmPort {
  private readonly logger = new Logger(OllamaLlmAdapter.name);
  private readonly url: string;
  private readonly modelo: string;

  constructor(config: ConfigService) {
    this.url = (config.get<string>('OLLAMA_URL') ?? 'http://127.0.0.1:11434').replace(/\/+$/, '');
    this.modelo = config.get<string>('LLM_MODEL') ?? 'llama3.2:3b';
  }

  async responder(mensajes: MensajeLlm[]): Promise<string> {
    const control = AbortSignal.timeout(300000);
    let respuesta: Response;
    try {
      respuesta = await fetch(this.url + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelo,
          messages: mensajes.map((m) => ({ role: m.rol, content: m.contenido })),
          options: { num_predict: 300 },
          stream: false,
        }),
        signal: control,
      });
    } catch (e) {
      throw new Error('No se pudo contactar a Ollama en ' + this.url + ': ' + (e as Error).message);
    }
    if (!respuesta.ok) {
      const cuerpo = await respuesta.text().catch(() => '');
      throw new Error('Ollama chat falló (' + respuesta.status + '): ' + cuerpo.slice(0, 200));
    }
    const datos = (await respuesta.json()) as RespuestaChat;
    const contenido = datos.message?.content?.trim();
    if (!contenido) throw new Error('Ollama devolvió una respuesta vacía');
    return contenido;
  }
}
