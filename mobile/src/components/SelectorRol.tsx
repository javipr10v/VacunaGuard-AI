import { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores, fuentes } from '@/theme';

const OPCIONES = [
  { valor: 'ADMINISTRADOR', etiqueta: 'Administrador', emoji: '🛡️' },
  { valor: 'COORDINADOR', etiqueta: 'Coordinador', emoji: '🗺️' },
  { valor: 'BRIGADISTA', etiqueta: 'Brigadista', emoji: '💉' },
];

interface Props {
  valor: string;
  alCambiar: (v: string) => void;
}

export function SelectorRol({ valor, alCambiar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const actual = OPCIONES.find((o) => o.valor === valor);

  return (
    <View>
      <Text style={estilos.etiqueta}>Selecciona tu rol</Text>
      <TouchableOpacity style={estilos.campo} onPress={() => setAbierto(true)}>
        <Text style={[estilos.texto, !actual ? { color: '#94a3b8' } : null]}>
          {actual ? actual.emoji + '  ' + actual.etiqueta : 'Elige una opción…'}
        </Text>
        <Text style={estilos.flecha}>▾</Text>
      </TouchableOpacity>
      <Modal transparent visible={abierto} animationType="fade" onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity style={estilos.fondoModal} activeOpacity={1} onPress={() => setAbierto(false)}>
          <View style={estilos.menu}>
            {OPCIONES.map((o) => (
              <TouchableOpacity
                key={o.valor}
                style={[estilos.opcion, o.valor === valor ? estilos.opcionActiva : null]}
                onPress={() => {
                  alCambiar(o.valor);
                  setAbierto(false);
                }}
              >
                <Text style={[estilos.opcionTexto, o.valor === valor ? { color: colores.primario700 } : null]}>
                  {o.emoji}  {o.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}
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
  fondoModal: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 30 },
  menu: { backgroundColor: colores.superficie, borderRadius: 16, padding: 8 },
  opcion: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10 },
  opcionActiva: { backgroundColor: colores.celeste100 },
  opcionTexto: { fontSize: 14, fontFamily: fuentes.medio, color: colores.texto },
});
