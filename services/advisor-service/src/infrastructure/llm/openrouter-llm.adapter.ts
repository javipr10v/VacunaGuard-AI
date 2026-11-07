import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmPort, MensajeLlm } from '../../application/ports/out/llm.port';

interface RespuestaChat {
  choices?: Array<{ message?: { content?: string } }>;
}

/**
 * Adaptador para LLMs en la nube mediante OpenRouter (compatible con OpenAI):
 * una sola API key permite usar DeepSeek, Gemini, Claude, GPT, Llama en la nube, etc.
 * También puede apuntarse a cualquier API compatible con OpenAI cambiando OPENROUTER_BASE_URL.
 */
@Injectable()
export class OpenRouterLlmAdapter implements LlmPort {
  private readonly logger = new Logger(OpenRouterLlmAdapter.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly modelo: string;

  constructor(config: ConfigService) {
    this.baseUrl = (config.get<string>('OPENROUTER_BASE_URL') ?? 'https://openrouter.ai/api/v1').replace(/\/+$/, '');
    this.apiKey = config.getOrThrow<string>('OPENROUTER_API_KEY');
    this.modelo = config.getOrThrow<string>('OPENROUTER_MODEL');
  }

  async responder(mensajes: MensajeLlm[]): Promise<string> {
    const control = AbortSignal.timeout(120000);
    let respuesta: Response;
    try {
      respuesta = await fetch(this.baseUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.apiKey,
        },
        body: JSON.stringify({
          model: this.modelo,
          messages: mensajes.map((m) => ({ role: m.rol, content: m.contenido })),
          max_tokens: 300,
          stream: false,
        }),
        signal: control,
      });
    } catch (e) {
      throw new Error('No se pudo contactar al proveedor de LLM en la nube: ' + (e as Error).message);
    }
    if (!respuesta.ok) {
      const cuerpo = await respuesta.text().catch(() => '');
      throw new Error('El proveedor en la nube falló (' + respuesta.status + '): ' + cuerpo.slice(0, 300));
    }
    const datos = (await respuesta.json()) as RespuestaChat;
    const contenido = datos.choices?.[0]?.message?.content?.trim();
    if (!contenido) throw new Error('El proveedor en la nube devolvió una respuesta vacía');
    return contenido;
  }
}
