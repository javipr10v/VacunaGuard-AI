import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Alerta, Boton, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { listarPuntos, planificarRuta, type PuntoResumen, type RutaResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';

const TUZTLA = { latitude: 16.7528, longitude: -93.1152 };

export default function RutasScreen() {
  const [puntos, setPuntos] = useState<PuntoResumen[]>([]);
  const [ruta, setRuta] = useState<RutaResumen | null>(null);
  const [mensaje, setMensaje] = useState('');

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      listarPuntos()
        .then((p) => { if (activo) setPuntos(p); })
        .catch(() => { if (activo) setMensaje('Sin conexión con routes-service'); });
      return () => { activo = false; };
    }, []),
  );

  const planificar = async () => {
    if (puntos.length === 0) return;
    try {
      const r = await planificarRuta({
        brigadaId: 'B-12',
        origenLatitud: TUZTLA.latitude,
        origenLongitud: TUZTLA.longitude,
        puntoIds: puntos.map((p) => p.id),
      });
      setRuta(r);
      setMensaje('');
    } catch (e) {
      setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo planificar');
    }
  };

  const rutaCoords = ruta
    ? [{ latitude: TUZTLA.latitude, longitude: TUZTLA.longitude }, ...ruta.paradas.map((p) => ({ latitude: p.latitud, longitude: p.longitud }))]
    : [];

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto="Ruta de hoy" sub="Orden óptimo de paradas" />
      <View style={estilos.mapa}>
        <MapView style={{ flex: 1 }} initialRegion={{ ...TUZTLA, latitudeDelta: 0.35, longitudeDelta: 0.35 }}>
          {puntos.map((p) => (
            <Marker key={p.id} coordinate={{ latitude: p.latitud, longitude: p.longitud }} title={p.nombre} description={p.personasEstimadas + ' personas'} pinColor={colores.critico} />
          ))}
          {rutaCoords.length > 1 ? <Polyline coordinates={rutaCoords} strokeColor={colores.primario600} strokeWidth={4} /> : null}
          <Marker coordinate={TUZTLA} title="Origen" pinColor={colores.primario700} />
        </MapView>
      </View>
      <Boton titulo={'Planificar ruta con ' + puntos.length + ' puntos'} onPress={planificar} deshabilitado={puntos.length === 0} />
      {mensaje ? <Alerta tipo="critico" titulo={mensaje} /> : null}
      {ruta ? (
        <Tarjeta>
          <Text style={estilos.resumen}>Distancia total: {ruta.distanciaTotalKm} km · {ruta.personasEstimadas} personas estimadas</Text>
          {ruta.paradas.map((p) => (
            <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={estilos.parada}>{p.orden}. {p.nombre}</Text>
              <Text style={estilos.detalle}>{p.personasEstimadas} pers.</Text>
            </View>
          ))}
        </Tarjeta>
      ) : null}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  mapa: { height: 250, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colores.linea },
  resumen: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.primario700, marginBottom: 4 },
  parada: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 11.5, color: colores.mutado },
});
