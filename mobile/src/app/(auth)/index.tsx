import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Boton, Campo, Alerta } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { ErrorApi } from '@/api/client';

const ROLES = [
  { etiqueta: 'Administrador', emoji: '🛡️', descripcion: 'supervisa todo', email: 'javier.guzman24@unach.mx', password: 'Guzman45129011' },
  { etiqueta: 'Coordinador', emoji: '🗺️', descripcion: 'asigna rutas', email: 'coordinador@salud.gob.mx', password: 'Coordina2026' },
  { etiqueta: 'Brigadista', emoji: '💉', descripcion: 'vacuna en campo', email: 'ana@salud.gob.mx', password: 'Segura2026' },
];

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const iniciar = async (correo: string, clave: string) => {
    setError('');
    setCargando(true);
    try {
      await entrar(correo.trim(), clave);
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <ImageBackground source={require('../../../assets/login-bg.jpg')} style={estilos.fondo} resizeMode="cover">
      <View style={estilos.velo} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
          <View style={estilos.encabezado}>
            <Text style={estilos.marca}>🛡️ VacunaGuard <Text style={{ color: colores.acento }}>AI</Text></Text>
            <Text style={estilos.lema}>Brigadas de salud · Vacunación en campo</Text>
          </View>
          <View style={estilos.tarjeta}>
            <Text style={estilos.seccion}>¿Quién eres?</Text>
            <View style={estilos.roles}>
              {ROLES.map((r) => (
                <TouchableOpacity key={r.etiqueta} style={estilos.rol} onPress={() => iniciar(r.email, r.password)} disabled={cargando}>
                  <Text style={estilos.rolEmoji}>{r.emoji}</Text>
                  <Text style={estilos.rolTitulo}>{r.etiqueta}</Text>
                  <Text style={estilos.rolDesc}>{r.descripcion}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={estilos.divisor}>
              <View style={estilos.linea} />
              <Text style={estilos.divisorTexto}>o con tu cuenta</Text>
              <View style={estilos.linea} />
            </View>
            <Campo etiqueta="Correo institucional" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@salud.gob.mx" />
            <Campo etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••••" />
            {error ? <Alerta tipo="critico" titulo={error} /> : null}
            <Boton titulo="Iniciar sesión" onPress={() => iniciar(email, password)} cargando={cargando} deshabilitado={!email.trim() || !password} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1 },
  velo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4,47,46,0.8)' },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  encabezado: { alignItems: 'center', gap: 4 },
  marca: { color: '#ffffff', fontSize: 30, fontFamily: fuentes.titulo, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 8 },
  lema: { color: colores.acento, fontSize: 12.5, fontFamily: fuentes.cuerpo },
  tarjeta: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 18, gap: 11, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  seccion: { fontFamily: fuentes.medio, fontSize: 11.5, color: colores.mutado, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' },
  roles: { flexDirection: 'row', gap: 8 },
  rol: { flex: 1, alignItems: 'center', gap: 3, borderWidth: 1.5, borderColor: colores.celeste100, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 6, backgroundColor: colores.superficie },
  rolEmoji: { fontSize: 24 },
  rolTitulo: { fontFamily: fuentes.medio, fontSize: 11.5, color: colores.texto, textAlign: 'center' },
  rolDesc: { fontFamily: fuentes.cuerpo, fontSize: 9.5, color: colores.mutado, textAlign: 'center' },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  linea: { flex: 1, height: 1, backgroundColor: colores.linea },
  divisorTexto: { fontSize: 10.5, color: colores.mutado, fontFamily: fuentes.cuerpo },
});
