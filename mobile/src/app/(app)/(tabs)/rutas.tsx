import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fondo } from '@/components/Fondo';
import { MapView, Marker, Polyline } from '@/components/mapa';
import { Alerta, Boton, Campo, Pildora, Tarjeta, Titulo } from '@/components/ui';
import { MapaOffline } from '@/components/MapaOffline';
import { colores, fuentes } from '@/theme';
import { crearPunto, eliminarPunto, listarPuntos, listarRutas, planificarRuta, type RutaResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { guardarPuntos, guardarRuta, leerPuntos, leerRuta, type PuntoLocal, type RutaLocal } from '@/storage/cola';
import { useSync } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';

const TUZTLA = { latitude: 16.7528, longitude: -93.1152 };

export default function RutasScreen() {
  const { enLinea } = useSync();
  const { usuario } = useAuth();
  const esBrigadista = usuario?.rol === 'BRIGADISTA';
  const [puntos, setPuntos] = useState<PuntoLocal[]>([]);
  const [ruta, setRuta] = useState<RutaLocal | null>(null);
  const [mensaje, setMensaje] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nombreP, setNombreP] = useState('');
  const [latP, setLatP] = useState('');
  const [lonP, setLonP] = useState('');
  const [persP, setPersP] = useState('');

  const guardarPunto = async () => {
    try {
      const p = await crearPunto({
        nombre: nombreP.trim(),
        latitud: Number(latP),
        longitud: Number(lonP),
        personasEstimadas: Number(persP) || 0,
      });
      const locales = [...puntos, { id: p.id, nombre: p.nombre, latitud: p.latitud, longitud: p.longitud, personas: p.personasEstimadas }];
      setPuntos(locales);
      guardarPuntos(locales);
      setNombreP(''); setLatP(''); setLonP(''); setPersP('');
      setMostrarForm(false);
      setMensaje('Punto agregado: ' + p.nombre);
    } catch (e) {
      setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo guardar el punto');
    }
  };

  const aLocal = (r: RutaResumen): RutaLocal => ({
    id: r.id,
    brigadaId: r.brigadaId,
    origenLat: TUZTLA.latitude,
    origenLon: TUZTLA.longitude,
    paradas: r.paradas.map((p) => ({ nombre: p.nombre, latitud: p.latitud, longitud: p.longitud })),
    distanciaKm: r.distanciaTotalKm,
    personas: r.personasEstimadas,
  });

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      if (!enLinea) {
        setPuntos(leerPuntos());
        setRuta(leerRuta());
        return () => { activo = false; };
      }
      if (esBrigadista) {
        listarRutas()
          .then((rs) => {
            if (!activo) return;
            if (rs.length > 0) {
              const local = aLocal(rs[0]);
              setRuta(local);
              guardarRuta(local);
            }
            setMensaje(rs.length === 0 ? 'Aún no te asignan una ruta' : '');
          })
          .catch(() => { if (activo) setMensaje('Sin conexión con routes-service'); });
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
    }, [enLinea, esBrigadista]),
  );

  const borrarPunto = (id: string, nombre: string) => {
    Alert.alert('Eliminar punto', '¿Eliminar ' + nombre + '?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminarPunto(id)
            .then(() => {
              setPuntos((prev) => prev.filter((p) => p.id !== id));
              setMensaje('Punto eliminado');
            })
            .catch((e: unknown) => setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo eliminar'));
        },
      },
    ]);
  };

  const planificar = async () => {
    if (puntos.length === 0) return;
    try {
      const r = await planificarRuta({
        brigadaId: 'B-12',
        origenLatitud: TUZTLA.latitude,
        origenLongitud: TUZTLA.longitude,
        puntoIds: puntos.map((p) => p.id),
      });
      const local = aLocal(r);
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
    <Fondo>
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <Titulo texto={esBrigadista ? 'Mi ruta' : 'Asignar ruta'} sub={esBrigadista ? 'Ruta de la brigada' : 'Orden óptimo de paradas'} />
        {enLinea ? (
          <>
            {MapView ? (
            <View style={estilos.mapa}>
              <MapView style={{ flex: 1 }} initialRegion={{ ...TUZTLA, latitudeDelta: 0.35, longitudeDelta: 0.35 }}>
                {puntos.map((p) => (
                  <Marker key={p.id} coordinate={{ latitude: p.latitud, longitude: p.longitud }} title={p.nombre} description={p.personas + ' personas'} pinColor={colores.critico} />
                ))}
                {rutaCoords.length > 1 ? <Polyline coordinates={rutaCoords} strokeColor={colores.primario600} strokeWidth={4} /> : null}
                <Marker coordinate={TUZTLA} title="Origen" pinColor={colores.primario700} />
              </MapView>
            </View>
            ) : (
              <MapaOffline puntos={puntos} ruta={ruta} />
            )}
            {!esBrigadista ? (
              <>
                <Boton titulo={mostrarForm ? 'Ocultar formulario' : 'Agregar punto de visita'} onPress={() => setMostrarForm(!mostrarForm)} variante={mostrarForm ? 'fantasma' : 'primario'} />
                {mostrarForm ? (
                  <Tarjeta>
                    <Campo etiqueta="Nombre del punto (ej. Pichucalco, Tapachula…)" value={nombreP} onChangeText={setNombreP} placeholder="Tapachula" />
                    <Campo etiqueta="Latitud" value={latP} onChangeText={setLatP} keyboardType="decimal-pad" placeholder="14.9100" />
                    <Campo etiqueta="Longitud" value={lonP} onChangeText={setLonP} keyboardType="decimal-pad" placeholder="-92.2641" />
                    <Campo etiqueta="Personas estimadas" value={persP} onChangeText={setPersP} keyboardType="number-pad" placeholder="30" />
                    <Boton titulo="Guardar punto" onPress={guardarPunto} deshabilitado={!nombreP.trim() || !latP.trim() || !lonP.trim()} />
                  </Tarjeta>
                ) : null}
                <Boton titulo={'Planificar ruta con ' + puntos.length + ' puntos'} onPress={planificar} deshabilitado={puntos.length === 0} />
              </>
            ) : null}
            {mensaje ? <Alerta tipo="advertencia" titulo={mensaje} /> : null}
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
        {!esBrigadista && enLinea && puntos.length > 0 ? (
          <Tarjeta>
            <Text style={estilos.resumen}>Puntos de visita ({puntos.length})</Text>
            {puntos.map((p) => (
              <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                <Text style={estilos.parada}>{p.nombre} · {p.personas} pers.</Text>
                <TouchableOpacity onPress={() => borrarPunto(p.id, p.nombre)}>
                  <Text style={{ fontSize: 15 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </Tarjeta>
        ) : null}
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
    </SafeAreaView>
    </Fondo>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'transparent' },
  contenido: { padding: 18, gap: 11 },
  mapa: { height: 250, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colores.linea },
  filaPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillTexto: { fontSize: 11.5, color: colores.mutado, fontFamily: fuentes.cuerpo },
  resumen: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.primario700, marginBottom: 4 },
  parada: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.texto },
});
