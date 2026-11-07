import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { iniciarSesion, type ResultadoSesion, type UsuarioResumen } from '../api/vacunaguard';
import { guardarToken, borrarToken } from '../api/client';

interface EstadoAuth {
  token: string | null;
  usuario: UsuarioResumen | null;
  cargando: boolean;
  entrar: (email: string, password: string) => Promise<void>;
  salir: () => Promise<void>;
}

const AuthContext = createContext<EstadoAuth>({
  token: null,
  usuario: null,
  cargando: true,
  entrar: async () => undefined,
  salir: async () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<UsuarioResumen | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await SecureStore.getItemAsync('vg_token');
        const u = await SecureStore.getItemAsync('vg_usuario');
        if (t) setToken(t);
        if (u) setUsuario(JSON.parse(u) as UsuarioResumen);
      } catch {
        // sesión limpia
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const entrar = async (email: string, password: string) => {
    const r: ResultadoSesion = await iniciarSesion(email, password);
    await guardarToken(r.accessToken);
    await SecureStore.setItemAsync('vg_usuario', JSON.stringify(r.usuario));
    setToken(r.accessToken);
    setUsuario(r.usuario);
  };

  const salir = async () => {
    await borrarToken();
    await SecureStore.deleteItemAsync('vg_usuario');
    setToken(null);
    setUsuario(null);
  };

  const valor = useMemo(() => ({ token, usuario, cargando, entrar, salir }), [token, usuario, cargando]);
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): EstadoAuth {
  return useContext(AuthContext);
}
