export const CIFRADOR = Symbol('CIFRADOR');

export interface CifradorPort {
  cifrar(texto: string): string;
  descifrar(cifrado: string): string;
  huella(texto: string): string;
}
