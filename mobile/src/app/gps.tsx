import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { io, type Socket } from 'socket.io-client';
import { base, ErrorApi } from '@/api/client';
import { enviarUbicacion, ubicacionesRecientes, type UbicacionResumen } from '@/api/vacunaguard';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { Alerta, Boton, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';

export default function GpsScreen() {
  const { usuario } = useAuth();
  const { encolarRegistro } = useSync();
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<UbicacionResumen[]>([]);
  const [miPosicion, setMiPosicion] = useState<{ latitud: number; longitud: number } | null>(null);
  const intervalo = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ubicacionesRecientes(5).then(setUbicaciones).catch(() => undefined);
    const socket: Socket = io(base('routes'), { path: '/socket.io' });
    socket.on('ubicacion', (u: UbicacionResumen) => {
      setUbicaciones((prev) => [u, ...prev.filter((x) => x.brigadistaId !== u.brigadistaId)].slice(0, 25));
    });
    return () => {
      socket.disconnect();
      if (intervalo.current) clearInterval(intervalo.current);
    };
  }, []);

  const alternar = async () => {
    if (transmitiendo) {
      if (intervalo.current) clearInterval(intervalo.current);
      intervalo.current = null;
      setTransmitiendo(false);
      return;
    }
    const permiso = await Location.requestForegroundPermissionsAsync();
    if (permiso.status !== 'granted') return;
    const enviar = async () => {
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        try {
          const u = await enviarUbicacion(pos.coords.latitude, pos.coords.longitude);
          setMiPosicion({ latitud: u.latitud, longitud: u.longitud });
        } catch (e) {
          // sin señal: el track se guarda en la cola y se envía al reconectar
          if (e instanceof ErrorApi && e.message.startsWith('No se pudo conectar')) {
            encolarRegistro('ubicacion', { latitud: pos.coords.latitude, longitud: pos.coords.longitude });
          }
        }
      } catch {
        // sin permiso de GPS: ignorar
      }
    };
    await enviar();
    intervalo.current = setInterval(enviar, 10000);
    setTransmitiendo(true);
  };

  const porBrigadista = new Map<string, UbicacionResumen>();
  for (const u of ubicaciones) if (!porBrigadista.has(u.brigadistaId)) porBrigadista.set(u.brigadistaId, u);
  const marcadores = [...porBrigadista.values()];

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto="GPS en vivo" sub={usuario?.rol === 'BRIGADISTA' ? 'Transmite tu posición' : 'Vista del coordinador'} />
      <View style={estilos.mapa}>
        <MapView style={{ flex: 1 }} initialRegion={{ latitude: 16.7528, longitude: -93.1152, latitudeDelta: 0.4, longitudeDelta: 0.4 }}>
          {marcadores.map((u) => (
            <Marker key={u.brigadistaId} coordinate={{ latitude: u.latitud, longitude: u.longitud }} title={u.brigadistaId} pinColor={colores.ok} />
          ))}
          {miPosicion ? <Marker coordinate={{ latitude: miPosicion.latitud, longitude: miPosicion.longitud }} title="Yo" pinColor={colores.critico} /> : null}
        </MapView>
      </View>
      {usuario?.rol === 'BRIGADISTA' ? (
        <Boton titulo={transmitiendo ? 'Detener transmisión' : 'Transmitir mi ubicación'} onPress={alternar} variante={transmitiendo ? 'fantasma' : 'primario'} />
      ) : null}
      <Alerta tipo="ok" titulo={marcadores.length + ' brigadistas en el mapa'} detalle="Posiciones actualizadas cada 10 segundos" />
      <Tarjeta>
        {marcadores.map((u) => (
          <View key={u.brigadistaId} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
            <Text style={estilos.nombre}>{u.brigadistaId} · brigada {u.brigadaId ?? '—'}</Text>
            <Text style={estilos.detalle}>{new Date(u.fecha).toLocaleTimeString()}</Text>
          </View>
        ))}
        {marcadores.length === 0 ? <Text style={estilos.detalle}>Aún no hay posiciones recientes</Text> : null}
      </Tarjeta>
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  mapa: { height: 260, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colores.linea },
  nombre: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 11.5, color: colores.mutado },
});
