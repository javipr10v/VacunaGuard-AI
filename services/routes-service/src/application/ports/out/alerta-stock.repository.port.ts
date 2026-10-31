export const ALERTA_REPOSITORY = Symbol('ALERTA_REPOSITORY');

export interface AlertaStock {
  vacuna: string;
  lote: string;
  stockRestante: number;
  umbral: number;
  fecha: Date;
}

export interface AlertaStockRepositoryPort {
  guardar(alerta: AlertaStock): Promise<void>;
}
