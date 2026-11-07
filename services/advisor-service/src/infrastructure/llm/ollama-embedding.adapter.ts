import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmbeddingPort } from '../../application/ports/out/embedding.port';

interface RespuestaEmbedding {
  embedding?: number[];
}

@Injectable()
export class OllamaEmbeddingAdapter implements EmbeddingPort {
  private readonly logger = new Logger(OllamaEmbeddingAdapter.name);
  private readonly url: string;
  private readonly modelo: string;

  constructor(config: ConfigService) {
    this.url = (config.get<string>('OLLAMA_URL') ?? 'http://127.0.0.1:11434').replace(/\/+$/, '');
    this.modelo = config.get<string>('EMBED_MODEL') ?? 'nomic-embed-text';
  }

  async generar(texto: string): Promise<number[]> {
    const control = AbortSignal.timeout(30000);
    let respuesta: Response;
    try {
      respuesta = await fetch(this.url + '/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.modelo, prompt: texto }),
        signal: control,
      });
    } catch (e) {
      throw new Error('No se pudo contactar a Ollama en ' + this.url + ': ' + (e as Error).message);
    }
    if (!respuesta.ok) {
      const cuerpo = await respuesta.text().catch(() => '');
      throw new Error('Ollama embeddings falló (' + respuesta.status + '): ' + cuerpo.slice(0, 200));
    }
    const datos = (await respuesta.json()) as RespuestaEmbedding;
    if (!Array.isArray(datos.embedding) || datos.embedding.length === 0) {
      throw new Error('Ollama devolvió un embedding vacío');
    }
    return datos.embedding;
  }
}
