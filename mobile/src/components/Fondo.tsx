import type { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

export function Fondo({ children }: { children: ReactNode }) {
  return (
    <ImageBackground source={require('../../assets/login-bg.jpg')} style={estilos.fondo} resizeMode="cover">
      <View style={estilos.velo}>{children}</View>
    </ImageBackground>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1 },
  velo: { flex: 1, backgroundColor: 'rgba(244,247,251,0.9)' },
});
