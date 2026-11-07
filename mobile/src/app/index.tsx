import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Boton, Campo, Alerta } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { ErrorApi } from '@/api/client';

export default function LoginScreen() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const iniciar = async () => {
    setError('');
    setCargando(true);
    try {
      await entrar(email.trim(), password);
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={estilos.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
        <View style={estilos.encabezado}>
          <Text style={estilos.marca}>🛡️ VacunaGuard <Text style={{ color: colores.acento }}>AI</Text></Text>
          <Text style={estilos.lema}>Brigadas de salud · Vacunación en campo</Text>
        </View>
        <View style={estilos.tarjeta}>
          <Campo etiqueta="Correo institucional" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nombre@salud.gob.mx" />
          <Campo etiqueta="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••••" />
          {error ? <Alerta tipo="critico" titulo={error} /> : null}
          <Boton titulo="Entrar a mi brigada" onPress={iniciar} cargando={cargando} deshabilitado={!email.trim() || !password} />
          <Text style={estilos.nota}>VacunaGuard AI · Coordinación de brigadas de salud</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.marino },
  contenido: { flexGrow: 1, justifyContent: 'center', padding: 26, gap: 18 },
  encabezado: { alignItems: 'center', gap: 4 },
  marca: { color: '#ffffff', fontSize: 26, fontFamily: fuentes.titulo },
  lema: { color: colores.acento, fontSize: 12, fontFamily: fuentes.cuerpo },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: 18, padding: 18, gap: 13, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  nota: { textAlign: 'center', fontSize: 10.5, color: colores.mutado, fontFamily: fuentes.cuerpo },
});
