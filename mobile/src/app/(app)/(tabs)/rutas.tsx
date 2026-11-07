import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Alerta, Boton, Pildora, Tarjeta, Titulo } from '@/components/ui';
import { MapaOffline } from '@/components/MapaOffline';
import { colores, fuentes } from '@/theme';
import { listarPuntos, planificarRuta, type RutaResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { guardarPuntos, guardarRuta, leerPuntos, leerRuta, type PuntoLocal, type RutaLocal } from '@/storage/cola';
import { useSync } from '@/context/SyncContext';

const TUZTLA = { latitude: 16.7528, longitude: -93.1152 };

export default function RutasScreen() {
  const { enLinea } = useSync();
  const [puntos, setPuntos] = useState<PuntoLocal[]>([]);
  const [ruta, setRuta] = useState<RutaLocal | null>(null);
  const [mensaje, setMensaje] = useState('');

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      if (!enLinea) {
        setPuntos(leerPuntos());
        setRuta(leerRuta());
        return () => { activo = false; };
      }
      listarPuntos()
        .then((p) => {
          if (!activo) return;
          const locales = p.map((x) => ({ id: x.id, nombre: x.nombre, latitud: x.latitud, longitud: x.longitud, personas: x.personasEstimadas }));
          setPuntos(locales);
          guardarPuntos(locales);
          setMensaje('');
        })
        .catch(() => { if (activo) setMensaje('Sin conexión con routes-service'); });
      return () => { activo = false; };
    }, [enLinea]),
  );

  const planificar = async () => {
    if (puntos.length === 0) return;
    try {
      const r: RutaResumen = await planificarRuta({
        brigadaId: 'B-12',
        origenLatitud: TUZTLA.latitude,
        origenLongitud: TUZTLA.longitude,
        puntoIds: puntos.map((p) => p.id),
      });
      const local: RutaLocal = {
        id: r.id,
        brigadaId: r.brigadaId,
        origenLat: TUZTLA.latitude,
        origenLon: TUZTLA.longitude,
        paradas: r.paradas.map((p) => ({ nombre: p.nombre, latitud: p.latitud, longitud: p.longitud })),
        distanciaKm: r.distanciaTotalKm,
        personas: r.personasEstimadas,
      };
      setRuta(local);
      guardarRuta(local);
      setMensaje('');
    } catch (e) {
      setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo planificar');
    }
  };

  const rutaCoords = ruta
    ? [{ latitude: ruta.origenLat, longitude: ruta.origenLon }, ...ruta.paradas.map((p) => ({ latitude: p.latitud, longitude: p.longitud }))]
    : [];

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto="Ruta de hoy" sub="Orden óptimo de paradas" />
      {enLinea ? (
        <>
          <View style={estilos.mapa}>
            <MapView style={{ flex: 1 }} initialRegion={{ ...TUZTLA, latitudeDelta: 0.35, longitudeDelta: 0.35 }}>
              {puntos.map((p) => (
                <Marker key={p.id} coordinate={{ latitude: p.latitud, longitude: p.longitud }} title={p.nombre} description={p.personas + ' personas'} pinColor={colores.critico} />
              ))}
              {rutaCoords.length > 1 ? <Polyline coordinates={rutaCoords} strokeColor={colores.primario600} strokeWidth={4} /> : null}
              <Marker coordinate={TUZTLA} title="Origen" pinColor={colores.primario700} />
            </MapView>
          </View>
          <Boton titulo={'Planificar ruta con ' + puntos.length + ' puntos'} onPress={planificar} deshabilitado={puntos.length === 0} />
          {mensaje ? <Alerta tipo="critico" titulo={mensaje} /> : null}
        </>
      ) : (
        <>
          <View style={estilos.filaPill}>
            <Pildora estado="ADVERTENCIA" />
            <Text style={estilos.pillTexto}>Modo sin conexión · mapa y ruta guardados</Text>
          </View>
          <MapaOffline puntos={puntos} ruta={ruta} />
        </>
      )}
      {ruta ? (
        <Tarjeta>
          <Text style={estilos.resumen}>Distancia total: {ruta.distanciaKm} km · {ruta.personas} personas estimadas</Text>
          {ruta.paradas.map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={estilos.parada}>{i + 1}. {p.nombre}</Text>
            </View>
          ))}
        </Tarjeta>
      ) : null}
      {!enLinea && !ruta ? (
        <Alerta tipo="advertencia" titulo="Sin ruta guardada" detalle="Conéctate una vez para descargar los puntos y planificar" />
      ) : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  mapa: { height: 250, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colores.linea },
  filaPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillTexto: { fontSize: 11.5, color: colores.mutado, fontFamily: fuentes.cuerpo },
  resumen: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.primario700, marginBottom: 4 },
  parada: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.texto },
});
