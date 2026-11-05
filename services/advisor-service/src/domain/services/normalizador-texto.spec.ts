import { NormalizadorTexto } from './normalizador-texto';

describe('NormalizadorTexto', () => {
  it('reemplaza las ligaduras', () => {
    expect(NormalizadorTexto.normalizar('In\uFB02uenza y \uFB01ebre')).toBe('Influenza y fiebre');
  });
  it('conserva el símbolo º', () => {
    expect(NormalizadorTexto.normalizar('ángulo de 10-15º')).toBe('ángulo de 10-15º');
  });
  it('une las palabras cortadas con guion al final de línea', () => {
    expect(NormalizadorTexto.normalizar('la enferme-\ndad grave')).toBe('la enfermedad grave');
  });
  it('quita el guion suave', () => {
    expect(NormalizadorTexto.normalizar('vacu\u00ADna')).toBe('vacuna');
  });
  it('arma párrafos uniendo las líneas internas', () => {
    expect(NormalizadorTexto.parrafos('linea uno\nlinea dos\n\nsegundo parrafo')).toEqual([
      'linea uno linea dos',
      'segundo parrafo',
    ]);
  });
});
