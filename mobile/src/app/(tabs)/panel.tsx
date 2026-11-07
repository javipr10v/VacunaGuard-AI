import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { listarLotes, type LoteResumen } from '@/api/vacunaguard';
import { Alerta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';

export default function PanelScreen() {
  const { usuario } = useAuth();
  const [lotes, setLotes] = useState<LoteResumen[]>([]);
  const [sinConexion, setSinConexion] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      listarLotes()
        .then((l) => { if (activo) { setLotes(l); setSinConexion(false); } })
        .catch(() => { if (activo) setSinConexion(true); });
      return () => { activo = false; };
    }, []),
  );

  const criticos = lotes.filter((l) => l.caducado || l.stockBajo);
  const tiles: { icono: keyof typeof Ionicons.glyphMap; etiqueta: string; ruta: string }[] = [
    { icono: 'person-add-outline', etiqueta: 'Ciudadano', ruta: '/ciudadano' },
    { icono: 'medkit-outline', etiqueta: 'Vacunar', ruta: '/vacunar' },
    { icono: 'snow-outline', etiqueta: 'Red de frío', ruta: '/red-frio' },
    { icono: 'chatbubbles-outline', etiqueta: 'Protocolos IA', ruta: '/protocolos' },
    { icono: 'map-outline', etiqueta: 'Mi ruta', ruta: '/rutas' },
    { icono: 'navigate-outline', etiqueta: 'Ubicación', ruta: '/gps' },
  ];
  if (usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR') {
    tiles.push({ icono: 'cube-outline', etiqueta: 'Nuevo lote', ruta: '/nuevo-lote' });
  }
  if (usuario?.rol === 'ADMINISTRADOR') {
    tiles.push({ icono: 'people-outline', etiqueta: 'Nuevo brigadista', ruta: '/nuevo-usuario' });
  }

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto={'Hola, ' + (usuario?.nombre.split(' ')[0] ?? 'brigadista') + ' 👋'} sub="Panel de brigada" />
      {sinConexion ? <Alerta tipo="advertencia" titulo="Sin conexión con el backend" detalle="Revisa que los servicios estén corriendo en WSL" /> : null}
      {criticos.length > 0 ? (
        criticos.slice(0, 2).map((l) => (
          <Alerta
            key={l.id}
            tipo={l.caducado ? 'critico' : 'advertencia'}
            titulo={l.caducado ? l.vacuna + ' · lote caducado' : 'Stock bajo · ' + l.vacuna + ' ' + l.numeroLote}
            detalle={'quedan ' + l.cantidad + ' dosis · umbral ' + l.umbralStockBajo}
          />
        ))
      ) : (
        <Alerta tipo="ok" titulo="Sin alertas activas" detalle="Todos los lotes en orden" />
      )}
      <View style={estilos.grilla}>
        {tiles.map((t) => (
          <TouchableOpacity key={t.ruta} style={estilos.tile} onPress={() => router.push(t.ruta)}>
            <Ionicons name={t.icono} size={24} color={colores.primario600} />
            <Text style={estilos.tileTexto}>{t.etiqueta}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', flexGrow: 1, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 6 },
  tileTexto: { fontSize: 12, color: '#334155', fontFamily: fuentes.medio },
});
