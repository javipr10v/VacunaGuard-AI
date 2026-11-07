import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Alerta, Pildora, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { eliminarLote, listarLotes, type LoteResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { useAuth } from '@/context/AuthContext';

export default function RedFrioScreen() {
  const { usuario } = useAuth();
  const puedeBorrar = usuario?.rol === 'ADMINISTRADOR' || usuario?.rol === 'COORDINADOR';
  const [lotes, setLotes] = useState<LoteResumen[]>([]);
  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const confirmarBorrado = (l: LoteResumen) => {
    Alert.alert('Eliminar lote', '¿Seguro que quieres eliminar ' + l.vacuna + ' · ' + l.numeroLote + '?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminarLote(l.id)
            .then(() => {
              setLotes((prev) => prev.filter((x) => x.id !== l.id));
              setMensaje('Lote eliminado');
            })
            .catch((e: unknown) => setMensaje(e instanceof ErrorApi ? e.message : 'No se pudo eliminar'));
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      listarLotes()
        .then((l) => { if (activo) setLotes(l); })
        .catch(() => { if (activo) setError(true); });
      return () => { activo = false; };
    }, []),
  );

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto="Red de frío" sub="Lotes y stock de la brigada" />
      {error ? <Alerta tipo="critico" titulo="Sin conexión con cold-chain" /> : null}
      {mensaje ? <Alerta tipo="ok" titulo={mensaje} /> : null}
      {lotes.map((l) => {
        const estado = l.caducado ? 'CRITICA' : l.stockBajo ? 'ADVERTENCIA' : 'NORMAL';
        const pct = Math.max(4, Math.min(100, Math.round((l.cantidad / 200) * 100)));
        return (
          <Tarjeta key={l.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={estilos.nombre}>{l.vacuna} · {l.numeroLote}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {puedeBorrar ? (
                  <TouchableOpacity onPress={() => confirmarBorrado(l)}>
                    <Text style={{ fontSize: 16, color: colores.critico }}>🗑️</Text>
                  </TouchableOpacity>
                ) : null}
                <Pildora estado={estado} />
              </View>
            </View>
            <Text style={estilos.detalle}>Stock: {l.cantidad} dosis · umbral {l.umbralStockBajo} · caduca {l.fechaCaducidad}</Text>
            <View style={estilos.barra}>
              <View style={[estilos.relleno, { width: pct + '%', backgroundColor: l.caducado ? colores.critico : l.stockBajo ? colores.advertencia : colores.primario500 }]} />
            </View>
          </Tarjeta>
        );
      })}
      {lotes.length === 0 && !error ? <Alerta tipo="ok" titulo="Sin lotes registrados" /> : null}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  nombre: { fontFamily: fuentes.medio, fontSize: 13.5, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 11.5, color: colores.mutado, marginTop: 3 },
  barra: { height: 7, backgroundColor: '#f1f5f9', borderRadius: 999, overflow: 'hidden', marginTop: 8 },
  relleno: { height: '100%', borderRadius: 999 },
});
