import { peticion } from './client';

export interface UsuarioResumen {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMINISTRADOR' | 'COORDINADOR' | 'BRIGADISTA';
  activo: boolean;
  brigadaId: string | null;
}

export interface ResultadoSesion {
  accessToken: string;
  usuario: UsuarioResumen;
}

export interface LoteResumen {
  id: string;
  vacuna: string;
  numeroLote: string;
  cantidad: number;
  fechaCaducidad: string;
  umbralStockBajo: number;
  stockBajo: boolean;
  caducado: boolean;
}

export interface PuntoResumen {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
  personasEstimadas: number;
}

export interface ParadaResumen extends PuntoResumen {
  orden: number;
}

export interface RutaResumen {
  id: string;
  brigadaId: string;
  paradas: ParadaResumen[];
  distanciaTotalKm: number;
  personasEstimadas: number;
}

export interface ConsultaCiudadanoResumen {
  id: string;
  curp: string;
  nombre: string;
  fechaNacimiento: string;
  edadAnios: number;
  edadMeses: number;
}

export interface VacunacionResumen {
  id: string;
  vacuna: string;
  lote: string;
  numeroDosis: number;
  fechaAplicacion: string;
  reaccionAdversa: boolean;
}

export interface CitaResumen {
  documento: string;
  anio: number;
  pagina: number;
  fragmento: string;
}

export interface ResultadoConsulta {
  respuesta: string;
  modelo: string;
  citas: CitaResumen[];
}

export interface UbicacionResumen {
  id: string;
  brigadistaId: string;
  nombre: string;
  brigadaId: string | null;
  latitud: number;
  longitud: number;
  fecha: string;
}

export const iniciarSesion = (email: string, password: string) =>
  peticion<ResultadoSesion>('identity', '/auth/login', { metodo: 'POST', cuerpo: { email, password }, conToken: false });

export const listarLotes = () => peticion<LoteResumen[]>('coldChain', '/lotes');

export const listarPuntos = () => peticion<PuntoResumen[]>('routes', '/puntos');

export const crearPunto = (dto: { nombre: string; latitud: number; longitud: number; personasEstimadas?: number }) =>
  peticion<PuntoResumen>('routes', '/puntos', { metodo: 'POST', cuerpo: dto });

export const planificarRuta = (dto: { brigadaId: string; origenLatitud: number; origenLongitud: number; puntoIds: string[] }) =>
  peticion<RutaResumen>('routes', '/rutas', { metodo: 'POST', cuerpo: dto });

export const listarRutas = (brigadaId?: string) =>
  peticion<RutaResumen[]>('routes', brigadaId ? '/rutas?brigadaId=' + encodeURIComponent(brigadaId) : '/rutas');

export const registrarCiudadano = (dto: { curp: string; nombre: string; fechaNacimiento: string }) =>
  peticion<{ id: string; curp: string; nombre: string; fechaNacimiento: string; yaExistia: boolean }>('registry', '/ciudadanos', { metodo: 'POST', cuerpo: dto });

export const buscarCiudadano = (curp: string) =>
  peticion<ConsultaCiudadanoResumen | { encontrado: false }>('registry', '/ciudadanos?curp=' + encodeURIComponent(curp));

export const consultarCiudadano = (id: string) =>
  peticion<ConsultaCiudadanoResumen>('registry', '/ciudadanos/' + id);

export const eliminarCiudadano = (id: string) =>
  peticion<{ eliminado: boolean }>('registry', '/ciudadanos/' + id, { metodo: 'DELETE' });

export interface BrigadaResumen {
  id: string;
  clave: string;
  nombre: string;
}

export const listarBrigadas = () => peticion<BrigadaResumen[]>('identity', '/auth/brigadas');

export const crearBrigada = (clave: string, nombre: string) =>
  peticion<BrigadaResumen>('identity', '/auth/brigadas', { metodo: 'POST', cuerpo: { clave, nombre } });

export const actualizarBrigada = (id: string, datos: { nombre?: string; clave?: string }) =>
  peticion<BrigadaResumen>('identity', '/auth/brigadas/' + id, { metodo: 'PATCH', cuerpo: datos });

export const eliminarBrigada = (id: string) =>
  peticion<{ eliminado: boolean }>('identity', '/auth/brigadas/' + id, { metodo: 'DELETE' });

export const vacunacionesDe = (id: string) =>
  peticion<VacunacionResumen[]>('registry', '/ciudadanos/' + id + '/vacunaciones');

export const registrarVacunacion = (dto: { ciudadanoId: string; vacuna: string; lote: string; numeroDosis: number; reaccionAdversa?: string }) =>
  peticion<{ registroId: string }>('registry', '/vacunaciones', { metodo: 'POST', cuerpo: dto });

export const crearLote = (dto: { vacuna: string; numeroLote: string; cantidad: number; fechaCaducidad: string; umbralStockBajo?: number }) =>
  peticion<LoteResumen>('coldChain', '/lotes', { metodo: 'POST', cuerpo: dto });

export const registrarUsuario = (dto: { nombre: string; email: string; password: string; rol: UsuarioResumen['rol'] }) =>
  peticion<UsuarioResumen>('identity', '/auth/registro', { metodo: 'POST', cuerpo: dto });

export const consultarProtocolo = (pregunta: string) =>
  peticion<ResultadoConsulta>('advisor', '/consultas', { metodo: 'POST', cuerpo: { pregunta } });

export const enviarUbicacion = (latitud: number, longitud: number) =>
  peticion<UbicacionResumen>('routes', '/ubicaciones', { metodo: 'POST', cuerpo: { latitud, longitud } });

export const ubicacionesRecientes = (minutos = 5) =>
  peticion<UbicacionResumen[]>('routes', '/ubicaciones?minutos=' + minutos);

export const listarUsuarios = () => peticion<UsuarioResumen[]>('identity', '/auth/usuarios');

export const actualizarUsuario = (id: string, dto: { activo?: boolean; brigadaId?: string | null }) =>
  peticion<UsuarioResumen>('identity', '/auth/usuarios/' + id, { metodo: 'PATCH', cuerpo: dto });

export const eliminarLote = (id: string) =>
  peticion<{ eliminado: boolean }>('coldChain', '/lotes/' + id, { metodo: 'DELETE' });

export const eliminarPunto = (id: string) =>
  peticion<{ eliminado: boolean }>('routes', '/puntos/' + id, { metodo: 'DELETE' });
