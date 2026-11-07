import { Coordenada } from '../../domain/value-objects/coordenada.vo';
import { PuntoVisita } from '../../domain/entities/punto-visita.entity';
import { RegistrarUbicacionUseCase } from './registrar-ubicacion.use-case';
import { ListarUbicacionesUseCase } from './listar-ubicaciones.use-case';
import { ListarPuntosUseCase } from './listar-puntos.use-case';
import { ListarRutasUseCase } from './listar-rutas.use-case';
import { ConsultarRutaUseCase } from './consultar-ruta.use-case';
import { RutaNoEncontradaException } from '../../domain/exceptions/ruta.exceptions';
import { IdsFalso, NotificadorFalso, PuntosMemoria, RutasMemoria, UbicacionesMemoria } from '../testing/fakes';
import { Ruta } from '../../domain/entities/ruta.entity';

describe('Lecturas y GPS (routes)', () => {
  it('registra la ubicación, la guarda y la notifica al canal en vivo', async () => {
    const repo = new UbicacionesMemoria();
    const notificador = new NotificadorFalso();
    const useCase = new RegistrarUbicacionUseCase(repo, new IdsFalso(), notificador);
    const r = await useCase.ejecutar({ latitud: 16.75, longitud: -93.11 }, 'b1', 'B-12');
    expect(r).toMatchObject({ brigadistaId: 'b1', brigadaId: 'B-12', latitud: 16.75, longitud: -93.11 });
    expect(repo.items).toHaveLength(1);
    expect(notificador.resumenes).toHaveLength(1);
  });

  it('lista solo las ubicaciones recientes', async () => {
    const repo = new UbicacionesMemoria();
    const reciente = new (await import('../../domain/entities/ubicacion.entity')).UbicacionBrigadista(
      'u1', 'b1', 'B-12', Coordenada.crear(16.7, -93.1), new Date(),
    );
    const vieja = new (await import('../../domain/entities/ubicacion.entity')).UbicacionBrigadista(
      'u2', 'b2', 'B-07', Coordenada.crear(16.6, -93.2), new Date(Date.now() - 60 * 60_000),
    );
    repo.items.push(reciente, vieja);
    const r = await new ListarUbicacionesUseCase(repo).ejecutar(5);
    expect(r).toHaveLength(1);
    expect(r[0].id).toBe('u1');
  });

  it('lista puntos y rutas por brigada o todas', async () => {
    const puntos = new PuntosMemoria();
    puntos.items.set('p1', new PuntoVisita('p1', 'Parque', Coordenada.crear(16.75, -93.11), 40));
    const r = await new ListarPuntosUseCase(puntos).ejecutar();
    expect(r).toHaveLength(1);
    expect(r[0].nombre).toBe('Parque');

    const rutas = new RutasMemoria();
    const ruta = Ruta.planificar('r1', 'B-12', Coordenada.crear(16.7, -93.1), [puntos.items.get('p1')!]);
    await rutas.guardar(ruta);
    expect(await new ListarRutasUseCase(rutas).ejecutar('B-12')).toHaveLength(1);
    expect(await new ListarRutasUseCase(rutas).ejecutar(null)).toHaveLength(1);
    expect(await new ListarRutasUseCase(rutas).ejecutar('OTRA')).toHaveLength(0);
  });

  it('consultar ruta lanza 404 si no existe', async () => {
    const rutas = new RutasMemoria();
    await expect(new ConsultarRutaUseCase(rutas).ejecutar('no')).rejects.toBeInstanceOf(RutaNoEncontradaException);
  });
});
