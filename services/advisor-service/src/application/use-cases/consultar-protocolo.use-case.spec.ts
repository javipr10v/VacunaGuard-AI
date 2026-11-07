import { DomainException } from '../../domain/exceptions/domain.exception';
import { Fragmento } from '../../domain/entities/fragmento.entity';
import type { ConsultarProtocoloDto } from '../dto/consultar-protocolo.dto';
import type { EmbeddingPort } from '../ports/out/embedding.port';
import type { FragmentoRepositoryPort, FragmentoResultado } from '../ports/out/fragmento.repository.port';
import type { LlmPort, MensajeLlm } from '../ports/out/llm.port';
import { ConsultarProtocoloUseCase } from './consultar-protocolo.use-case';

describe('ConsultarProtocoloUseCase', () => {
  const fragmentoEjemplo = new Fragmento(
    'Manual de Vacunación (México)',
    2021,
    45,
    0,
    'La vacuna SRP se aplica a los 12 meses de edad.',
  );

  const crear = (opciones?: { conFragmentos?: boolean; pregunta?: string }) => {
    const embedding: EmbeddingPort = { generar: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]) };
    const resultados: FragmentoResultado[] = opciones?.conFragmentos === false
      ? []
      : [{ fragmento: fragmentoEjemplo, similitud: 0.92 }];
    const fragmentos: FragmentoRepositoryPort = {
      guardar: jest.fn().mockResolvedValue(undefined),
      borrarPorDocumento: jest.fn().mockResolvedValue(1),
      buscarSimilares: jest.fn().mockResolvedValue(resultados),
      contar: jest.fn().mockResolvedValue(1),
    };
    const mensajes: MensajeLlm[][] = [];
    const llm: LlmPort = {
      responder: jest.fn(async (m: MensajeLlm[]) => {
        mensajes.push(m);
        return 'La SRP se aplica a los 12 meses [Manual de Vacunación (México) (2021), p. 45]';
      }),
    };
    const useCase = new ConsultarProtocoloUseCase(fragmentos, embedding, llm, 'llama3.2:3b', 5);
    return { useCase, fragmentos, embedding, llm, mensajes };
  };

  const dto = (pregunta: string): ConsultarProtocoloDto => ({ pregunta });

  it('rechaza una pregunta vacía', async () => {
    const { useCase } = crear();
    await expect(useCase.ejecutar(dto('   '))).rejects.toBeInstanceOf(DomainException);
  });

  it('responde sin información cuando no hay fragmentos y no llama al LLM', async () => {
    const { useCase, llm } = crear({ conFragmentos: false });
    const r = await useCase.ejecutar(dto('¿A qué edad se aplica la SRP?'));
    expect(r.respuesta).toContain('No encontré');
    expect(r.citas).toHaveLength(0);
    expect(llm.responder).not.toHaveBeenCalled();
  });

  it('genera el embedding, busca los 5 más similares y arma el contexto con citas', async () => {
    const { useCase, embedding, fragmentos, mensajes } = crear();
    const r = await useCase.ejecutar(dto('¿A qué edad se aplica la SRP?'));

    expect(embedding.generar).toHaveBeenCalledWith('¿A qué edad se aplica la SRP?');
    expect(fragmentos.buscarSimilares).toHaveBeenCalledWith([0.1, 0.2, 0.3], 5);

    const sistema = mensajes[0][0].contenido;
    const usuario = mensajes[0][1].contenido;
    expect(sistema).toContain('Cita cada afirmación');
    expect(usuario).toContain('Pregunta: ¿A qué edad se aplica la SRP?');
    expect(usuario).toContain('[1] Manual de Vacunación (México) (2021), p. 45');
    expect(usuario).toContain('La vacuna SRP se aplica a los 12 meses de edad.');

    expect(r.citas).toHaveLength(1);
    expect(r.citas[0]).toMatchObject({ documento: 'Manual de Vacunación (México)', anio: 2021, pagina: 45 });
    expect(r.modelo).toBe('llama3.2:3b');
  });
});
