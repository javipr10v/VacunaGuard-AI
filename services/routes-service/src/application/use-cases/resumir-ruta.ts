import { Ruta } from '../../domain/entities/ruta.entity';
import type { RutaResumen } from './planificar-ruta.use-case';

export function resumirRuta(r: Ruta): RutaResumen {
  return {
    id: r.id,
    brigadaId: r.brigadaId,
    paradas: r.paradas.map((p, i) => ({
      orden: i + 1,
      id: p.id,
      nombre: p.nombre,
      latitud: p.coordenada.latitud,
      longitud: p.coordenada.longitud,
      personasEstimadas: p.personasEstimadas,
    })),
    distanciaTotalKm: Math.round(r.distanciaTotalKm() * 100) / 100,
    personasEstimadas: r.personasEstimadas(),
  };
}
