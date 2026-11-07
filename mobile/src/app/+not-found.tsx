import { StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Boton } from '@/components/ui';
import { colores, fuentes } from '@/theme';

export default function PantallaNoEncontrada() {
  const ruta = usePathname();
  return (
    <View style={estilos.fondo}>
      <Text style={estilos.emoji}>🧭</Text>
      <Text style={estilos.titulo}>Ruta no encontrada</Text>
      <Text style={estilos.detalle}>Esta pantalla no existe en la app. Toca el botón para volver al inicio.</Text>
      <Text style={estilos.rutaActual}>Ruta actual: {ruta}</Text>
      <View style={{ alignSelf: 'stretch' }}>
        <Boton titulo="Ir al inicio" onPress={() => router.replace('/')} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 12 },
  emoji: { fontSize: 44 },
  titulo: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.texto, textAlign: 'center' },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 13, color: colores.mutado, textAlign: 'center' },
  rutaActual: { fontFamily: fuentes.cuerpo, fontSize: 11, color: colores.primario700, backgroundColor: colores.celeste100, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 999, overflow: 'hidden' },
});
