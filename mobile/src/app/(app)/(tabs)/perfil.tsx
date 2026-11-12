import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fondo } from '@/components/Fondo';
import { useAuth } from '@/context/AuthContext';
import { Avatar, Boton, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';

export default function PerfilScreen() {
  const { usuario, salir } = useAuth();
  return (
    <Fondo>
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Titulo texto="Mi perfil" sub="Sesión de brigadista" />
      <Tarjeta>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar iniciales={usuario?.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() ?? 'VG'} />
          <View>
            <Text style={estilos.nombre}>{usuario?.nombre ?? 'Brigadista'}</Text>
            <Text style={estilos.detalle}>{usuario?.email}</Text>
            <Text style={estilos.rol}>{usuario?.rol} · brigada {usuario?.brigadaId ?? '—'}</Text>
          </View>
        </View>
      </Tarjeta>
      <Boton titulo="Cerrar sesión" onPress={salir} variante="fantasma" />
    </ScrollView>
    </SafeAreaView>
    </Fondo>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'transparent' },
  contenido: { padding: 18, gap: 11, width: '100%', maxWidth: 680, alignSelf: 'center' },
  nombre: { fontFamily: fuentes.medio, fontSize: 15, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 12, color: colores.mutado },
  rol: { fontFamily: fuentes.medio, fontSize: 11, color: colores.primario700, marginTop: 3 },
});
