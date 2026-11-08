import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Alerta, Avatar, Pildora, Tarjeta, Titulo } from '@/components/ui';
import { SelectorBrigada } from '@/components/SelectorBrigada';
import { colores, fuentes } from '@/theme';
import { actualizarUsuario, listarUsuarios, type UsuarioResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { Fondo } from '@/components/Fondo';

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico'; texto: string } | null>(null);
  const [brigadas, setBrigadas] = useState<Record<string, string>>({});

  const cargar = useCallback(async () => {
    try {
      const u = await listarUsuarios();
      setUsuarios(u);
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo cargar' });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void cargar();
    }, [cargar]),
  );

  const alternarActivo = async (u: UsuarioResumen) => {
    try {
      const r = await actualizarUsuario(u.id, { activo: !u.activo });
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? r : x)));
      setMensaje({ tipo: 'ok', texto: r.activo ? r.nombre + ' activado' : r.nombre + ' desactivado' });
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo actualizar' });
    }
  };

  const asignarBrigada = async (u: UsuarioResumen) => {
    const valor = (brigadas[u.id] ?? '').trim();
    try {
      const r = await actualizarUsuario(u.id, { brigadaId: valor.length > 0 ? valor : null });
      setUsuarios((prev) => prev.map((x) => (x.id === u.id ? r : x)));
      setMensaje({ tipo: 'ok', texto: valor.length > 0 ? r.nombre + ' asignado a la brigada ' + valor : 'Brigada retirada de ' + r.nombre });
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo asignar' });
    }
  };

  return (
    <Fondo>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Titulo texto="Personal" sub="Activar, desactivar y asignar brigada" />
      {mensaje ? <Alerta tipo={mensaje.tipo} titulo={mensaje.texto} /> : null}
      {usuarios.map((u) => (
        <Tarjeta key={u.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Avatar iniciales={u.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()} color={u.activo ? colores.primario600 : '#94a3b8'} />
            <View style={{ flex: 1 }}>
              <Text style={estilos.nombre}>{u.nombre}</Text>
              <Text style={estilos.detalle}>{u.email}</Text>
            </View>
            <Pildora estado={u.activo ? 'NORMAL' : 'CRITICA'} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.etiqueta}>ROL: {u.rol}</Text>
              <SelectorBrigada valor={brigadas[u.id] ?? u.brigadaId ?? ''} alCambiar={(c) => setBrigadas((prev) => ({ ...prev, [u.id]: c }))} />
            </View>
            <TouchableOpacity style={estilos.boton} onPress={() => void asignarBrigada(u)}>
              <Text style={estilos.botonTexto}>Asignar</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[estilos.boton, estilos.botonAncho, { backgroundColor: u.activo ? colores.criticoFondo : colores.okFondo }]} onPress={() => void alternarActivo(u)}>
            <Text style={{ fontFamily: fuentes.medio, fontSize: 12, color: u.activo ? colores.critico : colores.ok }}>
              {u.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
            </Text>
          </TouchableOpacity>
        </Tarjeta>
      ))}
    </ScrollView>
    </Fondo>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  nombre: { fontFamily: fuentes.medio, fontSize: 13.5, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 11, color: colores.mutado },
  etiqueta: { fontFamily: fuentes.medio, fontSize: 10.5, color: colores.mutado, marginBottom: 3 },
  campo: { backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, fontSize: 12, color: colores.texto, fontFamily: fuentes.cuerpo },
  boton: { backgroundColor: colores.celeste100, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12, alignItems: 'center' },
  botonAncho: { marginTop: 8 },
  botonTexto: { fontFamily: fuentes.medio, fontSize: 12, color: colores.primario700 },
});
