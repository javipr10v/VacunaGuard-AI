import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { token, cargando } = useAuth();
  if (cargando) return null;
  if (token) return <Redirect href="/panel" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
