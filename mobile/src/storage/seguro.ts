import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Almacenamiento seguro: SecureStore en iOS/Android, localStorage en web
export async function guardarSeguro(clave: string, valor: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento */ }
    return;
  }
  await SecureStore.setItemAsync(clave, valor);
}

export async function leerSeguro(clave: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try { return localStorage.getItem(clave); } catch { return null; }
  }
  return SecureStore.getItemAsync(clave);
}

export async function borrarSeguro(clave: string): Promise<void> {
  if (Platform.OS === 'web') {
    try { localStorage.removeItem(clave); } catch { /* sin almacenamiento */ }
    return;
  }
  await SecureStore.deleteItemAsync(clave);
}
