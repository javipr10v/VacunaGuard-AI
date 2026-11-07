import { DomainException } from '../../domain/exceptions/domain.exception';
import type { ConsultarProtocoloDto } from '../dto/consultar-protocolo.dto';
import type { EmbeddingPort } from '../ports/out/embedding.port';
import type { FragmentoRepositoryPort } from '../ports/out/fragmento.repository.port';
import type { LlmPort } from '../ports/out/llm.port';

export interface CitaResumen {
  documento: string;
  anio: number;
  pagina: number;
  fragmento: string;
}

export interface ResultadoConsulta {
  respuesta: string;
  modelo: string;
  citas: CitaResumen[];
}

const SIN_INFORMACION = 'No encontré esa información en los documentos de referencia.';

const PROMPT_SISTEMA = [
  'Eres el consultor de protocolos de vacunación de VacunaGuard.',
  'Responde ÚNICAMENTE con la información contenida en los fragmentos de referencia proporcionados.',
  'Transcribe con exactitud las cifras, edades, dosis y porcentajes tal como aparecen: no los redondees, cambies ni interpretes.',
  'Cita cada afirmación entre corchetes con el formato [documento (año), p. X], usando el número de página que encabeza el fragmento citado.',
  'Si la información solicitada no aparece en los fragmentos, responde exactamente: "' + SIN_INFORMACION + '"',
  'No inventes dosis, edades, esquemas ni contraindicaciones.',
  'Responde en español, de forma breve y práctica para un brigadista en campo.',
].join(' ');

export class ConsultarProtocoloUseCase {
  constructor(
    private readonly fragmentos: FragmentoRepositoryPort,
    private readonly embeddings: EmbeddingPort,
    private readonly llm: LlmPort,
    private readonly modelo: string,
    private readonly topK = 5,
  ) {}

  async ejecutar(dto: ConsultarProtocoloDto): Promise<ResultadoConsulta> {
    const pregunta = dto.pregunta.trim();
    if (!pregunta) throw new DomainException('La pregunta es obligatoria');

    const vector = await this.embeddings.generar(pregunta);
    const resultados = await this.fragmentos.buscarSimilares(vector, this.topK);

    if (resultados.length === 0) {
      return { respuesta: SIN_INFORMACION, modelo: this.modelo, citas: [] };
    }

    const contexto = resultados
      .map((r, i) => '[' + (i + 1) + '] ' + r.fragmento.cita + '\n' + this.recortar(r.fragmento.texto))
      .join('\n\n');

    const respuesta = await this.llm.responder([
      { rol: 'system', contenido: PROMPT_SISTEMA },
      {
        rol: 'user',
        contenido: 'Pregunta: ' + pregunta + '\n\nFragmentos de referencia:\n' + contexto,
      },
    ]);

    return {
      respuesta,
      modelo: this.modelo,
      citas: resultados.map((r) => ({
        documento: r.fragmento.documento,
        anio: r.fragmento.anio,
        pagina: r.fragmento.pagina,
        fragmento: r.fragmento.texto.slice(0, 300),
      })),
    };
  }

  private recortar(texto: string, max = 600): string {
    return texto.length <= max ? texto : texto.slice(0, max) + '…';
  }
}
