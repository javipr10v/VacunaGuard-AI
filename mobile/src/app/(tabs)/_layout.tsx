import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primario600,
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.linea },
      }}
    >
      <Tabs.Screen name="panel" options={{ title: 'Panel', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color as string} /> }} />
      <Tabs.Screen name="rutas" options={{ title: 'Rutas', tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color as string} /> }} />
      <Tabs.Screen name="protocolos" options={{ title: 'Protocolos', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color as string} /> }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color as string} /> }} />
    </Tabs>
  );
}
