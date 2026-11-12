import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function Fondo({ children }: { children: ReactNode }) {
  return (
    <ImageBackground source={require('../../assets/login-bg.jpg')} style={estilos.fondo} resizeMode="cover">
      <LinearGradient colors={['rgba(224,242,254,0.55)', 'rgba(244,247,251,0.92)', 'rgba(224,242,254,0.82)']} style={estilos.velo}>{children}</LinearGradient>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1 },
  velo: { flex: 1, backgroundColor: 'rgba(214,236,252,0.82)' },
});
