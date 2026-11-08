import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MapView, Marker } from '@/components/mapa';
import * as Location from 'expo-location';
import { io, type Socket } from 'socket.io-client';
import { base, ErrorApi } from '@/api/client';
import { enviarUbicacion, listarUsuarios, ubicacionesRecientes, type UbicacionResumen, type UsuarioResumen } from '@/api/vacunaguard';
import { guardarCache, leerCache } from '@/storage/cola';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { Alerta, Boton, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';

interface FichaBrigadista {
  id: string;
  nombre: string;
  brigadaId: string | null;
  latitud: number | null;
  longitud: number | null;
  fecha: string | null;
}

function haceMinutos(fecha: string): number {
  return Math.floor((Date.now() - new Date(fecha).getTime()) / 60_000);
}

export default function GpsScreen() {
  const { usuario } = useAuth();
  const { encolarRegistro } = useSync();
  const esCoord = usuario?.rol !== 'BRIGADISTA';
  const [transmitiendo, setTransmitiendo] = useState(false);
  const [posiciones, setPosiciones] = useState<Map<string, UbicacionResumen>>(new Map());
  const [brigadistas, setBrigadistas] = useState<UsuarioResumen[]>([]);
  const [miPosicion, setMiPosicion] = useState<{ latitud: number; longitud: number } | null>(null);
  const intervalo = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (esCoord) {
      Promise.all([listarUsuarios(), ubicacionesRecientes(0)])
        .then(([usuarios, ubi]) => {
          const brig = usuarios.filter((u) => u.rol === 'BRIGADISTA');
          setBrigadistas(brig);
          const m = new Map<string, UbicacionResumen>();
          for (const p of ubi) if (!m.has(p.brigadistaId)) m.set(p.brigadistaId, p);
          setPosiciones(m);
          guardarCache('ubicaciones', JSON.stringify(ubi));
        })
        .catch(() => {
          const cache = leerCache('ubicaciones');
          if (cache) {
            try {
              const ubi = JSON.parse(cache) as UbicacionResumen[];
              const m = new Map<string, UbicacionResumen>();
              for (const p of ubi) if (!m.has(p.brigadistaId)) m.set(p.brigadistaId, p);
              setPosiciones(m);
            } catch { /* caché dañada */ }
          }
        });
    }
    const socket: Socket = io(base('routes'), { path: '/socket.io' });
    socket.on('ubicacion', (u: UbicacionResumen) => {
      setPosiciones((prev) => {
        const n = new Map(prev);
        n.set(u.brigadistaId, u);
        return n;
      });
      setBrigadistas((prev) => {
        if (prev.some((b) => b.id === u.brigadistaId)) return prev;
        return [...prev, { id: u.brigadistaId, nombre: u.nombre, email: '', rol: 'BRIGADISTA', activo: true, brigadaId: u.brigadaId }];
      });
    });
    return () => {
      socket.disconnect();
      if (intervalo.current) clearInterval(intervalo.current);
    };
  }, [esCoord]);

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
          if (e instanceof ErrorApi && e.message.startsWith('No se pudo conectar')) {
            encolarRegistro('ubicacion', { latitud: pos.coords.latitude, longitud: pos.coords.longitude });
          }
        }
      } catch {
        // sin permiso de GPS
      }
    };
    await enviar();
    intervalo.current = setInterval(enviar, 10000);
    setTransmitiendo(true);
  };

  const fichas: FichaBrigadista[] = brigadistas.map((b) => {
    const p = posiciones.get(b.id);
    return {
      id: b.id,
      nombre: b.nombre,
      brigadaId: b.brigadaId,
      latitud: p?.latitud ?? null,
      longitud: p?.longitud ?? null,
      fecha: p?.fecha ?? null,
    };
  });
  const conPosicion = fichas.filter((f) => f.latitud !== null && f.longitud !== null);
  const transmitiendoAhora = fichas.filter((f) => f.fecha !== null && haceMinutos(f.fecha) < 10).length;

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto="GPS en vivo" sub={esCoord ? 'Brigadistas asignados y su última posición' : 'Transmite tu posición'} />
      {MapView ? (
        <View style={estilos.mapa}>
          <MapView style={{ flex: 1 }} initialRegion={{ latitude: 16.7528, longitude: -93.1152, latitudeDelta: 0.4, longitudeDelta: 0.4 }}>
            {esCoord
              ? conPosicion.map((f) => (
                  <Marker key={f.id} coordinate={{ latitude: f.latitud as number, longitude: f.longitud as number }} title={f.nombre} pinColor={colores.ok} />
                ))
              : null}
            {miPosicion ? <Marker coordinate={{ latitude: miPosicion.latitud, longitude: miPosicion.longitud }} title={usuario?.nombre ?? 'Yo'} pinColor={colores.critico} /> : null}
          </MapView>
        </View>
      ) : (
        <Tarjeta>
          <Text style={estilos.detalle}>El mapa en vivo está disponible en la app móvil. Aquí puedes ver la lista de brigadistas.</Text>
        </Tarjeta>
      )}

      {!esCoord ? (
        <Boton titulo={transmitiendo ? 'Detener transmisión' : 'Transmitir mi ubicación'} onPress={alternar} variante={transmitiendo ? 'fantasma' : 'primario'} />
      ) : null}

      {esCoord ? (
        <>
          <Alerta tipo="ok" titulo={fichas.length + ' brigadistas asignados · ' + transmitiendoAhora + ' transmitiendo'} />
          <Tarjeta>
            {fichas.map((f) => {
              const enVivo = f.fecha !== null && haceMinutos(f.fecha) < 10;
              const estado = enVivo ? '● transmitiendo' : f.fecha ? 'última vez ' + haceMinutos(f.fecha) + ' min' : 'sin señal';
              return (
                <View key={f.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={estilos.nombre}>📍 {f.nombre}</Text>
                    <Text style={estilos.detalle}>Brigada {f.brigadaId ?? '—'} · {f.fecha ? new Date(f.fecha).toLocaleTimeString() : 'aún sin posición'}</Text>
                  </View>
                  <Text style={[estilos.estado, { backgroundColor: enVivo ? colores.okFondo : '#e2e8f0', color: enVivo ? colores.ok : '#64748b' }]}>
                    {estado}
                  </Text>
                </View>
              );
            })}
            {fichas.length === 0 ? <Text style={estilos.detalle}>Aún no hay brigadistas asignados</Text> : null}
          </Tarjeta>
        </>
      ) : (
        <Tarjeta>
          <Text style={estilos.nombre}>👤 {usuario?.nombre}</Text>
          <Text style={estilos.detalle}>Brigada {usuario?.brigadaId ?? '—'} · {transmitiendo ? 'transmitiendo cada 10 segundos' : 'transmisión detenida'}</Text>
        </Tarjeta>
      )}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  mapa: { height: 260, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colores.linea },
  nombre: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 11.5, color: colores.mutado },
  estado: { fontFamily: fuentes.medio, fontSize: 10, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
});
