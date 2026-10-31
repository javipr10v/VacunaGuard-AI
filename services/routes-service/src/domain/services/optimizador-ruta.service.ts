import { PuntoVisita } from '../entities/punto-visita.entity';
import { Coordenada } from '../value-objects/coordenada.vo';

export class OptimizadorRuta {
  static ordenar(origen: Coordenada, puntos: PuntoVisita[]): PuntoVisita[] {
    const pendientes = [...puntos];
    const orden: PuntoVisita[] = [];
    let actual = origen;

    while (pendientes.length > 0) {
      let mejor = 0;
      let mejorDistancia = actual.distanciaKm(pendientes[0].coordenada);
      for (let i = 1; i < pendientes.length; i++) {
        const d = actual.distanciaKm(pendientes[i].coordenada);
        if (d < mejorDistancia || (d === mejorDistancia && pendientes[i].id < pendientes[mejor].id)) {
          mejor = i;
          mejorDistancia = d;
        }
      }
      const [elegido] = pendientes.splice(mejor, 1);
      orden.push(elegido);
      actual = elegido.coordenada;
    }
    return orden;
  }

  static distanciaTotalKm(origen: Coordenada, orden: PuntoVisita[]): number {
    let total = 0;
    let actual = origen;
    for (const punto of orden) {
      total += actual.distanciaKm(punto.coordenada);
      actual = punto.coordenada;
    }
    return total;
  }
}
