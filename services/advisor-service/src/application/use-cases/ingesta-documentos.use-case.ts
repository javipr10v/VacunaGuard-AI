import { Injectable, Logger } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Fragmento } from '../../domain/entities/fragmento.entity';
import { NormalizadorTexto } from '../../domain/services/normalizador-texto';
import type { EmbeddingPort } from '../ports/out/embedding.port';
import type { FragmentoRepositoryPort } from '../ports/out/fragmento.repository.port';

interface Fuente {
  archivo: string;
  documento: string;
  anio: number;
  tipo?: 'paginas' | 'secciones';
}

const FUENTES: Fuente[] = [
  {
    archivo: 'PRONAM_limpio.txt',
    documento: 'Protocolo Nacional de Atención Médica (PRONAM) de Vacunación a lo largo de la vida',
    anio: 2026,
  },
  { archivo: 'Manual_de_Vacunacion_2021.txt', documento: 'Manual de Vacunación (México)', anio: 2021 },
  {
    archivo: 'Cartilla2023.txt',
    documento: 'Cartilla Nacional de Salud (Niñas y niños de 0 a 9 años)',
    anio: 2023,
  },
  { archivo: 'Resumen_red_frio.txt', documento: 'Resumen de la Red de Frío', anio: 0 },
  { archivo: 'Manual_ESAVI_2026_limpio.txt', documento: 'Manual de ESAVI (Marco general)', anio: 2026 },
  {
    archivo: 'Esquema_Vacunacion_Mexico_2026.md',
    documento: 'Esquema de Vacunación México (resumen curado)',
    anio: 2026,
    tipo: 'secciones',
  },
];

function trocear(texto: string, max = 1500, solape = 150): string[] {
  const limpio = NormalizadorTexto.normalizar(texto);
  if (limpio.length <= max) return [limpio];
  const trozos: string[] = [];
  let inicio = 0;
  while (inicio < limpio.length) {
    let fin = Math.min(inicio + max, limpio.length);
    if (fin < limpio.length) {
      const corte = limpio.lastIndexOf('.', fin);
      if (corte > inicio + max / 2) fin = corte + 1;
    }
    trozos.push(limpio.slice(inicio, fin).trim());
    if (fin >= limpio.length) break;
    inicio = Math.max(fin - solape, inicio + 1);
  }
  return trozos.filter((t) => t.length > 40);
}

@Injectable()
export class IngestaDocumentosUseCase {
  private readonly logger = new Logger(IngestaDocumentosUseCase.name);

  constructor(
    private readonly fragmentos: FragmentoRepositoryPort,
    private readonly embeddings: EmbeddingPort,
    private readonly carpetaDocumentos: string,
  ) {}

  async ejecutar(): Promise<void> {
    for (const fuente of FUENTES) {
      const ruta = join(this.carpetaDocumentos, fuente.archivo);
      if (!existsSync(ruta)) {
        this.logger.warn('Omitido (no existe): ' + ruta);
        continue;
      }
      const contenido = readFileSync(ruta, 'utf8');
      const piezas = (fuente.tipo ?? 'paginas') === 'secciones'
        ? this.secciones(contenido)
        : this.paginas(contenido);
      await this.fragmentos.borrarPorDocumento(fuente.documento);

      let orden = 0;
      for (const pieza of piezas) {
        for (const trozo of trocear(pieza.texto)) {
          const fragmento = new Fragmento(fuente.documento, fuente.anio, pieza.pagina, orden++, trozo);
          const vector = await this.embeddings.generar(trozo);
          await this.fragmentos.guardar(fragmento, vector);
        }
      }
      this.logger.log('Ingestado: ' + fuente.documento + ' (' + orden + ' fragmentos)');
    }
    this.logger.log('Total de fragmentos en la base: ' + (await this.fragmentos.contar()));
  }

  private paginas(contenido: string): Array<{ pagina: number; texto: string }> {
    const partes = contenido.split(/^--- PAGINA (\d+) ---/m);
    const resultado: Array<{ pagina: number; texto: string }> = [];
    for (let i = 1; i < partes.length; i += 2) {
      const pagina = Number(partes[i]);
      const texto = (partes[i + 1] ?? '').trim();
      if (texto.length >= 40) resultado.push({ pagina, texto });
    }
    return resultado;
  }

  private secciones(contenido: string): Array<{ pagina: number; texto: string }> {
    const partes = contenido.split(/^## /m);
    const resultado: Array<{ pagina: number; texto: string }> = [];
    for (let i = 0; i < partes.length; i++) {
      const texto = NormalizadorTexto.normalizar(partes[i]);
      if (texto.length >= 40) resultado.push({ pagina: i === 0 ? 1 : i, texto });
    }
    return resultado;
  }
}
