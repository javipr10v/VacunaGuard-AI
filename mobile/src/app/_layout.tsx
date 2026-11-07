import { Stack } from 'expo-router';
import { useFonts, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colores } from '@/theme';

function Contenido() {
  const { token, cargando } = useAuth();
  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.fondo }}>
        <ActivityIndicator size="large" color={colores.primario600} />
      </View>
    );
  }
  const headerAzul = {
    headerStyle: { backgroundColor: colores.superficie },
    headerTintColor: colores.primario700,
    headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 16 },
  };
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colores.fondo } }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="ciudadano" options={{ headerShown: true, title: 'Alta de ciudadano', ...headerAzul }} />
        <Stack.Screen name="vacunar" options={{ headerShown: true, title: 'Aplicar vacuna', ...headerAzul }} />
        <Stack.Screen name="red-frio" options={{ headerShown: true, title: 'Red de frío', ...headerAzul }} />
        <Stack.Screen name="gps" options={{ headerShown: true, title: 'GPS en vivo', ...headerAzul }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fuentesListas] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  if (!fuentesListas) {
    return <View style={{ flex: 1, backgroundColor: colores.fondo }} />;
  }
  return (
    <AuthProvider>
      <Contenido />
    </AuthProvider>
  );
}
