import { useCallback, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Alerta, Avatar, Boton, Campo, Pildora, Tarjeta, Titulo } from '@/components/ui';
import { SelectorBrigada } from '@/components/SelectorBrigada';
import { colores, fuentes } from '@/theme';
import { actualizarUsuario, eliminarUsuario, listarUsuarios, type UsuarioResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { Fondo } from '@/components/Fondo';

export default function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico'; texto: string } | null>(null);
  const [brigadas, setBrigadas] = useState<Record<string, string>>({});
  const [editando, setEditando] = useState<UsuarioResumen | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editEmail, setEditEmail] = useState('');

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

  const abrirEdicion = (u: UsuarioResumen) => {
    setEditando(u);
    setEditNombre(u.nombre);
    setEditEmail(u.email);
  };

  const guardarEdicion = async () => {
    if (!editando) return;
    try {
      const r = await actualizarUsuario(editando.id, { nombre: editNombre.trim(), email: editEmail.trim() });
      setUsuarios((prev) => prev.map((x) => (x.id === r.id ? r : x)));
      setEditando(null);
      setMensaje({ tipo: 'ok', texto: r.nombre + ' actualizado' });
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo actualizar' });
    }
  };

  const confirmarEliminar = (u: UsuarioResumen) => {
    Alert.alert('Eliminar personal', '¿Eliminar la cuenta de ' + u.nombre + '? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminarUsuario(u.id)
            .then(() => {
              setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
              setMensaje({ tipo: 'ok', texto: u.nombre + ' eliminado' });
            })
            .catch((e: unknown) => setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo eliminar' }));
        },
      },
    ]);
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
            <TouchableOpacity onPress={() => abrirEdicion(u)}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmarEliminar(u)}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
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
      <Modal transparent visible={editando !== null} animationType="fade" onRequestClose={() => setEditando(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 26 }}>
          <View style={{ backgroundColor: colores.superficie, borderRadius: 16, padding: 14, gap: 10 }}>
            <Text style={{ fontFamily: fuentes.medio, fontSize: 13, color: colores.texto }}>Editar a {editando?.nombre}</Text>
            <Campo etiqueta="Nombre completo" value={editNombre} onChangeText={setEditNombre} />
            <Campo etiqueta="Correo" value={editEmail} onChangeText={setEditEmail} autoCapitalize="none" keyboardType="email-address" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Boton titulo="Cancelar" onPress={() => setEditando(null)} variante="fantasma" />
              </View>
              <View style={{ flex: 1 }}>
                <Boton titulo="Guardar" onPress={guardarEdicion} deshabilitado={!editNombre.trim() || !editEmail.trim()} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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