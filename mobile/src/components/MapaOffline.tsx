import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { colores, fuentes } from '@/theme';
import type { PuntoLocal, RutaLocal } from '@/storage/cola';

interface Props {
  puntos: PuntoLocal[];
  ruta: RutaLocal | null;
}

export function MapaOffline({ puntos, ruta }: Props) {
  const W = 300;
  const H = 190;
  const M = 20;

  const paradas = ruta ? ruta.paradas : puntos;
  const todos = [...(ruta ? [{ latitud: ruta.origenLat, longitud: ruta.origenLon }] : []), ...paradas];

  if (todos.length === 0) {
    return (
      <View style={[estilos.mapa, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={estilos.vacio}>Aún no hay datos guardados</Text>
        <Text style={estilos.vacioDetalle}>Conéctate una vez para descargar el mapa y la ruta</Text>
      </View>
    );
  }

  const lats = todos.map((t) => t.latitud);
  const lons = todos.map((t) => t.longitud);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const rangoLat = Math.max(maxLat - minLat, 0.001);
  const rangoLon = Math.max(maxLon - minLon, 0.001);
  const x = (lon: number) => M + ((lon - minLon) / rangoLon) * (W - 2 * M);
  const y = (lat: number) => H - M - ((lat - minLat) / rangoLat) * (H - 2 * M);

  const puntosRuta = ruta
    ? [{ latitud: ruta.origenLat, longitud: ruta.origenLon }, ...ruta.paradas]
    : [];
  const polilinea = puntosRuta.map((p) => x(p.longitud) + ',' + y(p.latitud)).join(' ');

  return (
    <View style={estilos.mapa}>
      <Svg width="100%" height="100%" viewBox={'0 0 ' + W + ' ' + H}>
        <Rect x={0} y={0} width={W} height={H} fill="#e8f3fb" />
        {[0.25, 0.5, 0.75].map((f) => (
          <Line key={'v' + f} x1={W * f} y1={0} x2={W * f} y2={H} stroke="#d7e8f5" strokeWidth={1.5} />
        ))}
        {[0.25, 0.5, 0.75].map((f) => (
          <Line key={'h' + f} x1={0} y1={H * f} x2={W} y2={H * f} stroke="#d7e8f5" strokeWidth={1.5} />
        ))}
        {polilinea.length > 0 ? (
          <Polyline points={polilinea} fill="none" stroke={colores.primario600} strokeWidth={3.5} strokeDasharray="7 5" />
        ) : null}
        {ruta ? (
          <>
            <Circle cx={x(ruta.origenLon)} cy={y(ruta.origenLat)} r={10} fill={colores.primario700} stroke="#fff" strokeWidth={2.5} />
            <SvgText x={x(ruta.origenLon)} y={y(ruta.origenLat) + 4} fontSize={10} fill="#fff" textAnchor="middle" fontWeight="bold">S</SvgText>
          </>
        ) : null}
        {paradas.map((p, i) => (
          <Circle key={i} cx={x(p.longitud)} cy={y(p.latitud)} r={9} fill={colores.critico} stroke="#fff" strokeWidth={2.5} />
        ))}
        {paradas.map((p, i) => (
          <SvgText key={'t' + i} x={x(p.longitud)} y={y(p.latitud) + 3.5} fontSize={9} fill="#fff" textAnchor="middle" fontWeight="bold">
            {i + 1}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const estilos = StyleSheet.create({
  mapa: { height: 250, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colores.linea, backgroundColor: '#e8f3fb' },
  vacio: { fontFamily: fuentes.medio, fontSize: 13, color: colores.texto },
  vacioDetalle: { fontFamily: fuentes.cuerpo, fontSize: 11.5, color: colores.mutado, marginTop: 4 },
});
