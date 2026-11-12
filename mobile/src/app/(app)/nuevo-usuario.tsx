import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alerta, Boton, Campo, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { registrarUsuario } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';

const ROLES = ['BRIGADISTA', 'COORDINADOR', 'ADMINISTRADOR'] as const;
type Rol = (typeof ROLES)[number];

export default function NuevoUsuarioScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>('BRIGADISTA');
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setMensaje(null);
    setCargando(true);
    try {
      const r = await registrarUsuario({ nombre: nombre.trim(), email: email.trim(), password, rol });
      setMensaje({ tipo: 'ok', texto: 'Usuario ' + r.nombre + ' registrado como ' + r.rol });
      setNombre(''); setEmail(''); setPassword('');
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo registrar el usuario' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Titulo texto="Nuevo brigadista" sub="Alta de personal de la brigada" />
      <Tarjeta>
        <Campo etiqueta="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Ana López" />
        <Campo etiqueta="Correo institucional" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="ana@salud.gob.mx" />
        <Campo etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 8 caracteres" />
        <Text style={estilos.etiqueta}>Rol</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {ROLES.map((r) => (
            <TouchableOpacity key={r} onPress={() => setRol(r)} style={[estilos.chip, rol === r && estilos.chipActivo]}>
              <Text style={[estilos.chipTexto, rol === r && estilos.chipTextoActivo]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Boton titulo="Registrar usuario" onPress={enviar} cargando={cargando} deshabilitado={!nombre.trim() || !email.trim() || password.length < 8} />
      </Tarjeta>
      {mensaje ? <Alerta tipo={mensaje.tipo} titulo={mensaje.texto} /> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11, width: '100%', maxWidth: 680, alignSelf: 'center' },
  etiqueta: { fontSize: 11, color: colores.mutado, marginBottom: 3, fontFamily: fuentes.medio },
  chip: { borderWidth: 1.5, borderColor: colores.linea, borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14, backgroundColor: colores.superficie },
  chipActivo: { backgroundColor: colores.celeste100, borderColor: colores.primario600 },
  chipTexto: { fontSize: 11.5, fontFamily: fuentes.medio, color: colores.mutado },
  chipTextoActivo: { color: colores.primario700 },
});
