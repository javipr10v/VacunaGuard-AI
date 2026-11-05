const LIGADURAS: Record<string, string> = {
  '\uFB00': 'ff',
  '\uFB01': 'fi',
  '\uFB02': 'fl',
  '\uFB03': 'ffi',
  '\uFB04': 'ffl',
  '\uFB05': 'st',
  '\uFB06': 'st',
};

export class NormalizadorTexto {
  static normalizar(texto: string): string {
    return texto
      .replace(/[\uFB00-\uFB06]/g, (c) => LIGADURAS[c] ?? c)
      .replace(/\u00ad/g, '')
      .replace(/\r/g, '')
      .replace(/(\p{L})-\n(\p{Ll})/gu, '$1$2')
      .replace(/[ \t]+/g, ' ')
      .replace(/ ?\n ?/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  static parrafos(texto: string): string[] {
    return NormalizadorTexto.normalizar(texto)
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((p) => p.length > 0);
  }
}
