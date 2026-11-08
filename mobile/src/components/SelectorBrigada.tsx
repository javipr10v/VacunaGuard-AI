import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listarBrigadas, type BrigadaResumen } from '@/api/vacunaguard';
import { colores, fuentes } from '@/theme';

interface Props {
  valor: string;
  alCambiar: (clave: string) => void;
  etiqueta?: string;
}

export function SelectorBrigada({ valor, alCambiar, etiqueta }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [brigadas, setBrigadas] = useState<BrigadaResumen[]>([]);

  useEffect(() => {
    listarBrigadas()
      .then(setBrigadas)
      .catch(() => setBrigadas([]));
  }, [abierto]);

  const actual = brigadas.find((b) => b.clave === valor);

  return (
    <View>
      <Text style={estilos.etiqueta}>{etiqueta ?? 'Brigada'}</Text>
      <TouchableOpacity style={estilos.campo} onPress={() => setAbierto(true)}>
        <Text style={[estilos.texto, !actual ? { color: '#94a3b8' } : null]}>
          {actual ? '🚑 ' + actual.clave + ' · ' + actual.nombre : 'Elige una brigada…'}
        </Text>
        <Text style={estilos.flecha}>▾</Text>
      </TouchableOpacity>
      <Modal transparent visible={abierto} animationType="fade" onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity style={estilos.fondoModal} activeOpacity={1} onPress={() => setAbierto(false)}>
          <View style={estilos.menu}>
            <Text style={estilos.tituloMenu}>Elige la brigada</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity
                style={[estilos.opcion, valor === '' ? estilos.opcionActiva : null]}
                onPress={() => {
                  alCambiar('');
                  setAbierto(false);
                }}
              >
                <Text style={estilos.opcionTexto}>🚫 Sin brigada</Text>
              </TouchableOpacity>
              {brigadas.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={[estilos.opcion, b.clave === valor ? estilos.opcionActiva : null]}
                  onPress={() => {
                    alCambiar(b.clave);
                    setAbierto(false);
                  }}
                >
                  <Text style={[estilos.opcionTexto, b.clave === valor ? { color: colores.primario700 } : null]}>
                    🚑 {b.clave} · {b.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
              {brigadas.length === 0 ? (
                <Text style={estilos.vacio}>No hay brigadas registradas aún. Créalas en la pantalla “Brigadas”.</Text>
              ) : null}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: { fontSize: 11, color: colores.mutado, marginBottom: 3, fontFamily: fuentes.medio },
  campo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12 },
  texto: { fontSize: 13.5, color: colores.texto, fontFamily: fuentes.cuerpo },
  flecha: { fontSize: 12, color: colores.mutado },
  fondoModal: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 26 },
  menu: { backgroundColor: colores.superficie, borderRadius: 16, padding: 10 },
  tituloMenu: { fontFamily: fuentes.medio, fontSize: 12, color: colores.mutado, marginBottom: 6, paddingHorizontal: 4 },
  opcion: { paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10 },
  opcionActiva: { backgroundColor: colores.celeste100 },
  opcionTexto: { fontSize: 13.5, fontFamily: fuentes.medio, color: colores.texto },
  vacio: { fontSize: 12, color: colores.mutado, padding: 10, fontFamily: fuentes.cuerpo },
});
