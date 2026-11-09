import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmPort, MensajeLlm } from '../../application/ports/out/llm.port';

interface RespuestaGemini {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

/**
 * Adaptador para Gemini (Google AI Studio, capa gratuita).
 * Respuestas en 2-5 segundos y de propósito general.
 */
@Injectable()
export class GeminiLlmAdapter implements LlmPort {
  private readonly logger = new Logger(GeminiLlmAdapter.name);
  private readonly apiKey: string;
  private readonly modelo: string;

  constructor(config: ConfigService) {
    this.apiKey = config.getOrThrow<string>('GEMINI_API_KEY');
    this.modelo = config.get<string>('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  }

  async responder(mensajes: MensajeLlm[]): Promise<string> {
    const system = mensajes.find((m) => m.rol === 'system');
    const resto = mensajes.filter((m) => m.rol !== 'system');

    const control = AbortSignal.timeout(60000);
    let respuesta: Response;
    try {
      respuesta = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + this.modelo + ':generateContent?key=' + encodeURIComponent(this.apiKey),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: system ? { parts: [{ text: system.contenido }] } : undefined,
            contents: resto.map((m) => ({
              role: m.rol === 'user' ? 'user' : 'model',
              parts: [{ text: m.contenido }],
            })),
            generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
          }),
          signal: control,
        },
      );
    } catch (e) {
      throw new Error('No se pudo contactar a Gemini: ' + (e as Error).message);
    }
    if (!respuesta.ok) {
      const cuerpo = await respuesta.text().catch(() => '');
      throw new Error('Gemini falló (' + respuesta.status + '): ' + cuerpo.slice(0, 300));
    }
    const datos = (await respuesta.json()) as RespuestaGemini;
    const texto = datos.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!texto) throw new Error('Gemini devolvió una respuesta vacía');
    return texto;
  }
}
