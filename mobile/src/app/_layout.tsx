import { Stack } from 'expo-router';
import { useFonts, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SyncProvider } from '@/context/SyncContext';
import { colores } from '@/theme';

function PilaRaiz() {
  const { cargando } = useAuth();
  if (cargando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.fondo }}>
        <ActivityIndicator size="large" color={colores.primario600} />
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.fondo } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
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
      <SyncProvider>
        <PilaRaiz />
      </SyncProvider>
    </AuthProvider>
  );
}
