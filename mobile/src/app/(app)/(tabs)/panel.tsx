import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { listarLotes, type LoteResumen } from '@/api/vacunaguard';
import { guardarCache, leerCache } from '@/storage/cola';
import { Alerta, Avatar, Boton } from '@/components/ui';
import { colores, fuentes } from '@/theme';

export default function PanelScreen() {
  const { usuario } = useAuth();
  const { enLinea, pendientes, sincronizando, sincronizar } = useSync();
  const [lotes, setLotes] = useState<LoteResumen[]>([]);
  const [sinDatos, setSinDatos] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      if (!enLinea) {
        const cache = leerCache('lotes');
        if (cache) {
          try { setLotes(JSON.parse(cache) as LoteResumen[]); setSinDatos(false); } catch { setSinDatos(true); }
        } else setSinDatos(true);
        return () => { activo = false; };
      }
      listarLotes()
        .then((l) => { if (!activo) return; setLotes(l); setSinDatos(false); guardarCache('lotes', JSON.stringify(l)); })
        .catch(() => { if (activo) setSinDatos(true); });
      return () => { activo = false; };
    }, [enLinea]),
  );

  const criticos = lotes.filter((l) => l.caducado || l.stockBajo);
  const rol = usuario?.rol ?? 'BRIGADISTA';
  const porRol: Record<string, { icono: keyof typeof Ionicons.glyphMap; etiqueta: string; ruta: string }[]> = {
    BRIGADISTA: [
      { icono: 'person-add-outline', etiqueta: 'Ciudadano', ruta: '/ciudadano' },
      { icono: 'medkit-outline', etiqueta: 'Vacunar', ruta: '/vacunar' },
      { icono: 'map-outline', etiqueta: 'Mi ruta', ruta: '/rutas' },
      { icono: 'snow-outline', etiqueta: 'Red de frío', ruta: '/red-frio' },
      { icono: 'chatbubbles-outline', etiqueta: 'Protocolos IA', ruta: '/protocolos' },
      { icono: 'navigate-outline', etiqueta: 'Ubicación', ruta: '/gps' },
    ],
    COORDINADOR: [
      { icono: 'map-outline', etiqueta: 'Asignar ruta', ruta: '/rutas' },
      { icono: 'snow-outline', etiqueta: 'Red de frío', ruta: '/red-frio' },
      { icono: 'cube-outline', etiqueta: 'Nuevo lote', ruta: '/nuevo-lote' },
      { icono: 'chatbubbles-outline', etiqueta: 'Protocolos IA', ruta: '/protocolos' },
      { icono: 'navigate-outline', etiqueta: 'Ubicaciones', ruta: '/gps' },
    ],
    ADMINISTRADOR: [
      { icono: 'people-outline', etiqueta: 'Nuevo brigadista', ruta: '/nuevo-usuario' },
      { icono: 'cube-outline', etiqueta: 'Nuevo lote', ruta: '/nuevo-lote' },
      { icono: 'snow-outline', etiqueta: 'Red de frío', ruta: '/red-frio' },
      { icono: 'chatbubbles-outline', etiqueta: 'Protocolos IA', ruta: '/protocolos' },
      { icono: 'navigate-outline', etiqueta: 'Ubicaciones', ruta: '/gps' },
    ],
  };
  const tiles = porRol[rol] ?? porRol.BRIGADISTA;

  const iniciales = (usuario?.nombre ?? 'VG').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <SafeAreaView edges={['top']} style={estilos.fondo}>
      <ScrollView contentContainerStyle={estilos.contenido}>
        <View style={estilos.encabezado}>
          <Avatar iniciales={iniciales} />
          <View style={{ flex: 1 }}>
            <Text style={estilos.saludo}>Hola, {(usuario?.nombre ?? 'brigadista').split(' ')[0]} 👋</Text>
            <Text style={estilos.sub}>{usuario?.email}</Text>
          </View>
          <View style={estilos.rolChip}>
            <Text style={estilos.rolTexto}>{rol}</Text>
          </View>
        </View>

        <View style={estilos.estadisticas}>
          <View style={estilos.stat}><Text style={estilos.statNum}>{lotes.length}</Text><Text style={estilos.statEtiqueta}>Lotes</Text></View>
          <View style={estilos.stat}><Text style={[estilos.statNum, { color: criticos.length > 0 ? colores.critico : colores.ok }]}>{criticos.length}</Text><Text style={estilos.statEtiqueta}>Alertas</Text></View>
          <View style={estilos.stat}><Text style={[estilos.statNum, { color: pendientes > 0 ? colores.advertencia : colores.mutado }]}>{pendientes}</Text><Text style={estilos.statEtiqueta}>En cola</Text></View>
        </View>

        <View style={estilos.filaPill}>
          {enLinea ? (
            <Text style={[estilos.pill, { backgroundColor: colores.okFondo, color: colores.ok }]}>● EN LÍNEA</Text>
          ) : (
            <Text style={[estilos.pill, { backgroundColor: '#e2e8f0', color: '#475569' }]}>📴 SIN SEÑAL</Text>
          )}
          <Text style={estilos.pillTexto}>
            {enLinea ? (pendientes > 0 ? pendientes + ' registros por sincronizar' : 'todo sincronizado') : (pendientes > 0 ? pendientes + ' registros en cola' : 'mostrando últimos datos guardados')}
          </Text>
        </View>

        {pendientes > 0 && enLinea ? (
          <Boton titulo={sincronizando ? 'Sincronizando…' : 'Sincronizar ahora'} onPress={() => void sincronizar()} cargando={sincronizando} />
        ) : null}

        {sinDatos ? <Alerta tipo="advertencia" titulo="Sin datos disponibles" detalle="Conéctate para descargar la información de la brigada" /> : null}
        {criticos.length > 0 ? (
          criticos.slice(0, 2).map((l) => (
            <Alerta key={l.id} tipo={l.caducado ? 'critico' : 'advertencia'}
              titulo={l.caducado ? l.vacuna + ' · lote caducado' : 'Stock bajo · ' + l.vacuna + ' ' + l.numeroLote}
              detalle={'quedan ' + l.cantidad + ' dosis · umbral ' + l.umbralStockBajo} />
          ))
        ) : (
          !sinDatos ? <Alerta tipo="ok" titulo="Sin alertas activas" detalle="Todos los lotes en orden" /> : null
        )}

        <Text style={estilos.seccion}>Acciones</Text>
        <View style={estilos.grilla}>
          {tiles.map((t) => (
            <TouchableOpacity key={t.ruta} style={estilos.tile} onPress={() => router.push(t.ruta)}>
              <Ionicons name={t.icono} size={24} color={colores.primario600} />
              <Text style={estilos.tileTexto}>{t.etiqueta}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 12 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saludo: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.texto },
  sub: { fontFamily: fuentes.cuerpo, fontSize: 11, color: colores.mutado },
  rolChip: { backgroundColor: colores.celeste100, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  rolTexto: { fontFamily: fuentes.medio, fontSize: 10, color: colores.primario700 },
  estadisticas: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  statNum: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.primario700 },
  statEtiqueta: { fontFamily: fuentes.cuerpo, fontSize: 10.5, color: colores.mutado },
  filaPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { fontFamily: fuentes.medio, fontSize: 10, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
  pillTexto: { fontSize: 11.5, color: colores.mutado, fontFamily: fuentes.cuerpo },
  seccion: { fontFamily: fuentes.medio, fontSize: 12, color: colores.mutado, textTransform: 'uppercase', letterSpacing: 0.5 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', flexGrow: 1, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 6 },
  tileTexto: { fontSize: 12, color: '#334155', fontFamily: fuentes.medio },
});
