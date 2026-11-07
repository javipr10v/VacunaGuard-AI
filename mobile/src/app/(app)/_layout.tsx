import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { colores } from '@/theme';

const headerAzul = {
  headerStyle: { backgroundColor: colores.superficie },
  headerTintColor: colores.primario700,
  headerTitleStyle: { fontFamily: 'Manrope_700Bold', fontSize: 16 },
};

export default function AppLayout() {
  const { token, cargando } = useAuth();
  if (cargando) return null;
  if (!token) return <Redirect href="/" />;
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colores.fondo } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="ciudadano" options={{ headerShown: true, title: 'Alta de ciudadano', ...headerAzul }} />
      <Stack.Screen name="nuevo-lote" options={{ headerShown: true, title: 'Nuevo lote', ...headerAzul }} />
      <Stack.Screen name="nuevo-usuario" options={{ headerShown: true, title: 'Nuevo brigadista', ...headerAzul }} />
      <Stack.Screen name="usuarios" options={{ headerShown: true, title: 'Brigadistas', ...headerAzul }} />
      <Stack.Screen name="vacunar" options={{ headerShown: true, title: 'Aplicar vacuna', ...headerAzul }} />
      <Stack.Screen name="red-frio" options={{ headerShown: true, title: 'Red de frío', ...headerAzul }} />
      <Stack.Screen name="gps" options={{ headerShown: true, title: 'GPS en vivo', ...headerAzul }} />
    </Stack>
  );
}
