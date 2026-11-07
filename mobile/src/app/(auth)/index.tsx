import { useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Boton, Campo, Alerta } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { ErrorApi } from '@/api/client';

const CUENTAS = [
  { etiqueta: 'Administrador', emoji: '🛡️', email: 'javier.guzman24@unach.mx', password: 'Guzman45129011' },
  { etiqueta: 'Coordinador', emoji: '🗺️', email: 'coordinador@salud.gob.mx', password: 'Coordina2026' },
  { etiqueta: 'Brigadista', emoji: '💉', email: 'ana@salud.gob.mx', password: 'Segura2026' },
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
            <Text style={estilos.tituloTarjeta}>Iniciar sesión</Text>
            <Campo etiqueta="Correo institucional" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@salud.gob.mx" />
            <Campo etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••••" />
            {error ? <Alerta tipo="critico" titulo={error} /> : null}
            <Boton titulo="Iniciar sesión" onPress={() => iniciar(email, password)} cargando={cargando} deshabilitado={!email.trim() || !password} />
            <View style={estilos.divisor}>
              <View style={estilos.linea} />
              <Text style={estilos.divisorTexto}>entrada rápida para la demo</Text>
              <View style={estilos.linea} />
            </View>
            {CUENTAS.map((c) => (
              <TouchableOpacity key={c.etiqueta} style={estilos.cuenta} onPress={() => iniciar(c.email, c.password)} disabled={cargando}>
                <Text style={estilos.cuentaEmoji}>{c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.cuentaTitulo}>Entrar como {c.etiqueta}</Text>
                  <Text style={estilos.cuentaDetalle}>{c.email}</Text>
                </View>
                <Text style={estilos.flecha}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={estilos.pie}>VacunaGuard AI · Coordinación de brigadas de salud</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1 },
  velo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(4,47,46,0.78)' },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 26, gap: 16 },
  encabezado: { alignItems: 'center', gap: 4 },
  marca: { color: '#ffffff', fontSize: 30, fontFamily: fuentes.titulo, textShadowColor: 'rgba(0,0,0,0.4)', textShadowRadius: 8 },
  lema: { color: colores.acento, fontSize: 12.5, fontFamily: fuentes.cuerpo },
  tarjeta: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 20, padding: 20, gap: 12, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  tituloTarjeta: { fontFamily: fuentes.titulo, fontSize: 19, color: colores.texto, textAlign: 'center' },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  linea: { flex: 1, height: 1, backgroundColor: colores.linea },
  divisorTexto: { fontSize: 10.5, color: colores.mutado, fontFamily: fuentes.cuerpo },
  cuenta: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: colores.celeste100, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colores.superficie },
  cuentaEmoji: { fontSize: 20 },
  cuentaTitulo: { fontFamily: fuentes.medio, fontSize: 13, color: colores.texto },
  cuentaDetalle: { fontFamily: fuentes.cuerpo, fontSize: 10.5, color: colores.mutado },
  flecha: { fontSize: 18, color: colores.primario600, fontFamily: fuentes.medio },
  pie: { textAlign: 'center', fontSize: 10.5, color: '#bae6fd', fontFamily: fuentes.cuerpo },
});
