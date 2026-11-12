import { useCallback, useState } from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { listarLotes, type LoteResumen } from '@/api/vacunaguard';
import { guardarCache, leerCache } from '@/storage/cola';
import { Avatar, Boton } from '@/components/ui';
import { colores, fuentes } from '@/theme';

export default function PanelScreen() {
  const { usuario } = useAuth();
  const { enLinea, pendientes, sincronizando, sincronizar } = useSync();
  const [lotes, setLotes] = useState<LoteResumen[]>([]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      if (!enLinea) {
        const cache = leerCache('lotes');
        if (cache) {
          try { setLotes(JSON.parse(cache) as LoteResumen[]); } catch { setLotes([]); }
        }
        return () => { activo = false; };
      }
      listarLotes()
        .then((l) => { if (!activo) return; setLotes(l); guardarCache('lotes', JSON.stringify(l)); })
        .catch(() => { if (activo) setLotes([]); });
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
      { icono: 'bus-outline', etiqueta: 'Brigadas', ruta: '/brigadas' },
      { icono: 'people-outline', etiqueta: 'Personal', ruta: '/usuarios' },
      { icono: 'snow-outline', etiqueta: 'Red de frío', ruta: '/red-frio' },
      { icono: 'cube-outline', etiqueta: 'Nuevo lote', ruta: '/nuevo-lote' },
      { icono: 'chatbubbles-outline', etiqueta: 'Protocolos IA', ruta: '/protocolos' },
      { icono: 'navigate-outline', etiqueta: 'Ubicaciones', ruta: '/gps' },
    ],
    ADMINISTRADOR: [
      { icono: 'people-outline', etiqueta: 'Personal', ruta: '/usuarios' },
      { icono: 'bus-outline', etiqueta: 'Brigadas', ruta: '/brigadas' },
      { icono: 'person-add-outline', etiqueta: 'Nuevo brigadista', ruta: '/nuevo-usuario' },
      { icono: 'cube-outline', etiqueta: 'Nuevo lote', ruta: '/nuevo-lote' },
      { icono: 'snow-outline', etiqueta: 'Red de frío', ruta: '/red-frio' },
      { icono: 'chatbubbles-outline', etiqueta: 'Protocolos IA', ruta: '/protocolos' },
      { icono: 'navigate-outline', etiqueta: 'Ubicaciones', ruta: '/gps' },
    ],
  };
  const tiles = porRol[rol] ?? porRol.BRIGADISTA;
  const PALETA = ['#dbeafe', '#dcfce7', '#fef3c7', '#ede9fe', '#fce7f3', '#cffafe'];
  const ICONOS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2'];
  const iniciales = (usuario?.nombre ?? 'VG').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }} contentContainerStyle={{ paddingBottom: 28 }}>
      <ImageBackground source={require('../../../../assets/panel-hero.jpg')} style={estilos.hero} resizeMode="cover">
        <LinearGradient colors={['rgba(4,47,46,0.82)', 'rgba(13,148,136,0.45)', 'rgba(4,47,46,0.15)']} style={estilos.heroVelo}>
          <SafeAreaView edges={['top']}>
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
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>

      <View style={estilos.cuerpo}>
        <View style={estilos.estadisticas}>
          <View style={estilos.stat}>
            <View style={[estilos.statIcono, { backgroundColor: '#dbeafe' }]}><Text style={{ fontSize: 13 }}>💉</Text></View>
            <Text style={estilos.statNum}>{lotes.length}</Text><Text style={estilos.statEtiqueta}>Lotes</Text>
          </View>
          <View style={estilos.stat}>
            <View style={[estilos.statIcono, { backgroundColor: '#fef3c7' }]}><Text style={{ fontSize: 13 }}>⚠️</Text></View>
            <Text style={[estilos.statNum, { color: criticos.length > 0 ? colores.critico : colores.ok }]}>{criticos.length}</Text><Text style={estilos.statEtiqueta}>Alertas</Text>
          </View>
          <View style={estilos.stat}>
            <View style={[estilos.statIcono, { backgroundColor: '#dcfce7' }]}><Text style={{ fontSize: 13 }}>📦</Text></View>
            <Text style={[estilos.statNum, { color: pendientes > 0 ? colores.advertencia : colores.mutado }]}>{pendientes}</Text><Text style={estilos.statEtiqueta}>En cola</Text>
          </View>
        </View>

        <View style={estilos.filaPill}>
          {enLinea ? (
            <Text style={[estilos.pill, { backgroundColor: colores.okFondo, color: colores.ok }]}>● EN LÍNEA</Text>
          ) : (
            <Text style={[estilos.pill, { backgroundColor: '#e2e8f0', color: '#475569' }]}>📴 SIN SEÑAL</Text>
          )}
          <Text style={estilos.pillTexto}>
            {enLinea ? (pendientes > 0 ? pendientes + ' registros por sincronizar' : 'todo sincronizado') : (pendientes > 0 ? pendientes + ' registros en cola' : 'últimos datos guardados')}
          </Text>
        </View>

        {pendientes > 0 && enLinea ? (
          <Boton titulo={sincronizando ? 'Sincronizando…' : 'Sincronizar ahora'} onPress={() => void sincronizar()} cargando={sincronizando} />
        ) : null}

        <Text style={estilos.seccion}>Acciones</Text>
        <View style={estilos.grilla}>
          {tiles.map((t, i) => (
            <TouchableOpacity key={t.ruta} style={estilos.tile} onPress={() => router.push(t.ruta)}>
              <View style={[estilos.tileIcono, { backgroundColor: PALETA[i % 6] }]}>
                <Ionicons name={t.icono} size={20} color={ICONOS[i % 6]} />
              </View>
              <Text style={estilos.tileTexto}>{t.etiqueta}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  hero: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' },
  heroVelo: { backgroundColor: 'rgba(4,47,46,0.62)', paddingBottom: 30 },
  encabezado: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, width: '100%', maxWidth: 1040, alignSelf: 'center' },
  saludo: { fontFamily: fuentes.titulo, fontSize: 21, color: '#ffffff' },
  sub: { fontFamily: fuentes.cuerpo, fontSize: 11, color: colores.acento },
  rolChip: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  rolTexto: { fontFamily: fuentes.medio, fontSize: 10, color: '#ffffff' },
  cuerpo: { padding: 18, gap: 12, width: '100%', maxWidth: 1040, alignSelf: 'center' },
  estadisticas: { flexDirection: 'row', gap: 10, marginTop: -20 },
  stat: { flex: 1, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 14, paddingVertical: 12, alignItems: 'center', shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  statIcono: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statNum: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.primario700 },
  statEtiqueta: { fontFamily: fuentes.cuerpo, fontSize: 10.5, color: colores.mutado },
  filaPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pill: { fontFamily: fuentes.medio, fontSize: 10, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden' },
  pillTexto: { fontSize: 11.5, color: colores.mutado, fontFamily: fuentes.cuerpo },
  seccion: { fontFamily: fuentes.medio, fontSize: 12, color: colores.mutado, textTransform: 'uppercase', letterSpacing: 0.5 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', flexGrow: 1, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 6 },
  tileIcono: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  tileTexto: { fontSize: 12, color: '#334155', fontFamily: fuentes.medio },
});
