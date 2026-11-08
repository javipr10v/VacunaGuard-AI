// Generador de CURP basado en el algoritmo público de RENAPO
// (primeras letras de apellidos y nombre, fecha, sexo, estado, consonantes internas,
// homoclave y dígito verificador módulo 10).
const VOCALES = new Set(['A', 'E', 'I', 'O', 'U']);
const CONECTORES = new Set(['DE', 'DEL', 'LA', 'LAS', 'MC', 'MAC', 'VON', 'VAN', 'Y']);

// Palabras altisonantes más comunes (RENAPO sustituye la 2ª letra por X)
const ALTISONANTES = new Set([
  'BACA', 'BAKA', 'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO',
  'COGE', 'COJA', 'COJE', 'COJI', 'COJO', 'CULO', 'FETO', 'GUEY', 'JOTO', 'KACA',
  'KACO', 'KAGA', 'KAGO', 'KOGE', 'KOJO', 'KAKA', 'KULO', 'MAME', 'MAMO', 'MEAR',
  'MEAS', 'MEON', 'MION', 'MOCO', 'MULA', 'PEDA', 'PEDO', 'PENE', 'PUTA', 'PUTO',
  'QULO', 'RATA', 'RUIN',
]);

export interface DatosCurp {
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombre: string;
  fechaNacimiento: Date;
  sexo: 'H' | 'M';
  estado: string;
}

function limpiar(texto: string): string {
  return (texto ?? '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Ñ/g, 'X')
    .replace(/[^A-Z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function quitarConectores(texto: string): string {
  const palabras = texto.split(' ').filter((p) => p && !CONECTORES.has(p));
  return palabras.join(' ') || 'X';
}

function primeraVocalInterna(palabra: string): string {
  for (let i = 1; i < palabra.length; i++) if (VOCALES.has(palabra[i])) return palabra[i];
  return 'X';
}

function primeraConsonanteInterna(palabra: string): string {
  for (let i = 1; i < palabra.length; i++) if (!VOCALES.has(palabra[i])) return palabra[i];
  return 'X';
}

function dosDigitos(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

function homoclave(nombreCompleto: string, fecha: Date): string {
  const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const fechaCadena = String(fecha.getFullYear()) + dosDigitos(fecha.getMonth() + 1) + dosDigitos(fecha.getDate());
  const cadena = nombreCompleto.replace(/[^A-Z]/g, '') + '00' + fechaCadena;
  let suma = 0;
  for (let i = 0; i < cadena.length; i++) {
    const c = cadena[i];
    const num = /\d/.test(c) ? parseInt(c, 10) : abc.indexOf(c) + 1;
    suma += num * (18 - i);
  }
  const mod = suma % 1000;
  const simbolos = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  // Posición 17: homoclave (1 carácter alfanumérico)
  return simbolos[mod % 36];
}

function digitoVerificador(base: string): string {
  const alfabeto = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
  let suma = 0;
  for (const c of base) suma += alfabeto.indexOf(c);
  return String(suma % 10);
}

export function generarCurp(d: DatosCurp): string {
  const p = quitarConectores(limpiar(d.apellidoPaterno));
  const m = quitarConectores(limpiar(d.apellidoMaterno));
  let n = quitarConectores(limpiar(d.nombre));
  // "María" o "José" como primer nombre se omiten
  const partes = n.split(' ');
  if (partes.length > 1 && (partes[0] === 'MARIA' || partes[0] === 'JOSE')) {
    n = partes.slice(1).join(' ');
  }

  let letras = [
    p[0] ?? 'X',
    primeraVocalInterna(p),
    m[0] ?? 'X',
    n[0] ?? 'X',
  ].join('');
  if (ALTISONANTES.has(letras)) {
    letras = letras[0] + 'X' + letras.slice(2);
  }

  const fechaParte =
    dosDigitos(d.fechaNacimiento.getFullYear() % 100) +
    dosDigitos(d.fechaNacimiento.getMonth() + 1) +
    dosDigitos(d.fechaNacimiento.getDate());

  const base =
    letras +
    fechaParte +
    d.sexo +
    d.estado +
    primeraConsonanteInterna(p) +
    primeraConsonanteInterna(m) +
    primeraConsonanteInterna(n);

  const nombreCompleto = n + ' ' + p + ' ' + m;
  const homo = homoclave(nombreCompleto, d.fechaNacimiento);
  const conHomoclave = base + homo;
  return conHomoclave + digitoVerificador(conHomoclave);
}
