import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Boton, Campo, Alerta } from '@/components/ui';
import { SelectorRol } from '@/components/SelectorRol';
import { colores, fuentes } from '@/theme';
import { ErrorApi } from '@/api/client';

const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [rol, setRol] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errores, setErrores] = useState<{ rol?: string; email?: string; password?: string }>({});
  const [cargando, setCargando] = useState(false);

  const validar = (): boolean => {
    const e: { rol?: string; email?: string; password?: string } = {};
    if (!rol) e.rol = 'Selecciona tu rol';
    if (!PATRON_EMAIL.test(email.trim())) e.email = 'Escribe un correo válido';
    if (password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const iniciar = async () => {
    if (!validar()) return;
    setError('');
    setCargando(true);
    try {
      await entrar(email.trim(), password);
    } catch (err) {
      setError(err instanceof ErrorApi ? err.message : 'No se pudo iniciar sesión');
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
          </View>
          <View style={estilos.tarjeta}>
            <SelectorRol valor={rol} alCambiar={setRol} />
            {errores.rol ? <Text style={estilos.errorCampo}>{errores.rol}</Text> : null}
            <Campo etiqueta="Correo" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@salud.gob.mx" />
            {errores.email ? <Text style={estilos.errorCampo}>{errores.email}</Text> : null}
            <Campo etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••••" />
            {errores.password ? <Text style={estilos.errorCampo}>{errores.password}</Text> : null}
            {error ? <Alerta tipo="critico" titulo={error} /> : null}
            <Boton titulo="Iniciar sesión" onPress={iniciar} cargando={cargando} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1 },
  velo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4,47,46,0.78)' },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16 },
  encabezado: { alignItems: 'center' },
  marca: { color: '#ffffff', fontSize: 30, fontFamily: fuentes.titulo, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 8 },
  tarjeta: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: 18, gap: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  errorCampo: { fontFamily: fuentes.cuerpo, fontSize: 11, color: colores.critico, marginTop: -4 },
});
