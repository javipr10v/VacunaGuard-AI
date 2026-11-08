import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colores, fuentes } from '@/theme';

export const ESTADOS: { codigo: string; nombre: string }[] = [
  { codigo: 'AS', nombre: 'Aguascalientes' },
  { codigo: 'BC', nombre: 'Baja California' },
  { codigo: 'BS', nombre: 'Baja California Sur' },
  { codigo: 'CC', nombre: 'Campeche' },
  { codigo: 'CL', nombre: 'Coahuila' },
  { codigo: 'CM', nombre: 'Colima' },
  { codigo: 'CS', nombre: 'Chiapas' },
  { codigo: 'CH', nombre: 'Chihuahua' },
  { codigo: 'DF', nombre: 'Ciudad de México' },
  { codigo: 'DG', nombre: 'Durango' },
  { codigo: 'GT', nombre: 'Guanajuato' },
  { codigo: 'GR', nombre: 'Guerrero' },
  { codigo: 'HG', nombre: 'Hidalgo' },
  { codigo: 'JC', nombre: 'Jalisco' },
  { codigo: 'MC', nombre: 'Estado de México' },
  { codigo: 'MN', nombre: 'Michoacán' },
  { codigo: 'MS', nombre: 'Morelos' },
  { codigo: 'NT', nombre: 'Nayarit' },
  { codigo: 'NL', nombre: 'Nuevo León' },
  { codigo: 'OC', nombre: 'Oaxaca' },
  { codigo: 'PL', nombre: 'Puebla' },
  { codigo: 'QT', nombre: 'Querétaro' },
  { codigo: 'QR', nombre: 'Quintana Roo' },
  { codigo: 'SP', nombre: 'San Luis Potosí' },
  { codigo: 'SL', nombre: 'Sinaloa' },
  { codigo: 'SR', nombre: 'Sonora' },
  { codigo: 'TC', nombre: 'Tabasco' },
  { codigo: 'TS', nombre: 'Tamaulipas' },
  { codigo: 'TL', nombre: 'Tlaxcala' },
  { codigo: 'VZ', nombre: 'Veracruz' },
  { codigo: 'YN', nombre: 'Yucatán' },
  { codigo: 'ZS', nombre: 'Zacatecas' },
  { codigo: 'NE', nombre: 'Nacido en el extranjero' },
];

interface Props {
  valor: string;
  alCambiar: (codigo: string) => void;
}

export function SelectorEstado({ valor, alCambiar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const actual = ESTADOS.find((e) => e.codigo === valor);

  return (
    <View>
      <Text style={estilos.etiqueta}>Estado de nacimiento</Text>
      <TouchableOpacity style={estilos.campo} onPress={() => setAbierto(true)}>
        <Text style={[estilos.texto, !actual ? { color: '#94a3b8' } : null]}>
          {actual ? '📍 ' + actual.nombre : 'Elige un estado…'}
        </Text>
        <Text style={estilos.flecha}>▾</Text>
      </TouchableOpacity>
      <Modal transparent visible={abierto} animationType="fade" onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity style={estilos.fondoModal} activeOpacity={1} onPress={() => setAbierto(false)}>
          <View style={estilos.menu}>
            <Text style={estilos.tituloMenu}>Estado donde nació</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {ESTADOS.map((e) => (
                <TouchableOpacity
                  key={e.codigo}
                  style={[estilos.opcion, e.codigo === valor ? estilos.opcionActiva : null]}
                  onPress={() => {
                    alCambiar(e.codigo);
                    setAbierto(false);
                  }}
                >
                  <Text style={[estilos.opcionTexto, e.codigo === valor ? { color: colores.primario700 } : null]}>
                    {e.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
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
  opcion: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  opcionActiva: { backgroundColor: colores.celeste100 },
  opcionTexto: { fontSize: 13.5, fontFamily: fuentes.medio, color: colores.texto },
});
