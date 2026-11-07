import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import * as Network from 'expo-network';
import { iniciarBase } from '@/storage/db';
import { eliminarDeCola, encolar, pendientes, type TipoRegistro } from '@/storage/cola';
import { enviarUbicacion, registrarCiudadano, registrarVacunacion } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';

interface EstadoSync {
  enLinea: boolean;
  pendientes: number;
  sincronizando: boolean;
  encolarRegistro: (tipo: TipoRegistro, payload: Record<string, unknown>) => void;
  sincronizar: () => Promise<void>;
  verificarRed: () => Promise<boolean>;
}

const SyncContext = createContext<EstadoSync>({
  enLinea: true,
  pendientes: 0,
  sincronizando: false,
  encolarRegistro: () => undefined,
  sincronizar: async () => undefined,
  verificarRed: async () => true,
});

function esErrorDeRed(e: unknown): boolean {
  return e instanceof ErrorApi && e.message.startsWith('No se pudo conectar');
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const [enLinea, setEnLinea] = useState(true);
  const [pendientesCount, setPendientes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const ocupado = useRef(false);

  const refrescarPendientes = useCallback(() => {
    setPendientes(pendientes().length);
  }, []);

  const verificarRed = useCallback(async (): Promise<boolean> => {
    try {
      const estado = await Network.getNetworkStateAsync();
      setEnLinea(!!estado.isConnected);
      return !!estado.isConnected;
    } catch {
      setEnLinea(false);
      return false;
    }
  }, []);

  const enviarItem = useCallback(async (item: { tipo: TipoRegistro; payload: Record<string, unknown> }) => {
    if (item.tipo === 'ciudadano') {
      await registrarCiudadano(item.payload as { curp: string; nombre: string; fechaNacimiento: string });
    } else if (item.tipo === 'vacunacion') {
      await registrarVacunacion(item.payload as { ciudadanoId: string; vacuna: string; lote: string; numeroDosis: number; reaccionAdversa?: string });
    } else {
      await enviarUbicacion(item.payload.latitud as number, item.payload.longitud as number);
    }
  }, []);

  const sincronizar = useCallback(async () => {
    if (ocupado.current) return;
    ocupado.current = true;
    setSincronizando(true);
    try {
      const enRed = await verificarRed();
      if (!enRed) return;
      const items = pendientes();
      for (const item of items) {
        try {
          await enviarItem(item);
          eliminarDeCola(item.id);
          refrescarPendientes();
        } catch (e) {
          if (esErrorDeRed(e)) return; // sin señal: se reintenta después
          eliminarDeCola(item.id); // el servidor ya lo tiene (p. ej. dosis duplicada)
          refrescarPendientes();
        }
      }
    } finally {
      ocupado.current = false;
      setSincronizando(false);
    }
  }, [enviarItem, refrescarPendientes, verificarRed]);

  useEffect(() => {
    iniciarBase();
    void (async () => {
      setPendientes(pendientes().length);
      await verificarRed();
    })();

    const intervalo = setInterval(() => {
      void verificarRed();
      void sincronizar();
    }, 15000);

    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') {
        void verificarRed();
        void sincronizar();
      }
    });

    return () => {
      clearInterval(intervalo);
      suscripcion.remove();
    };
  }, [refrescarPendientes, sincronizar, verificarRed]);

  const valor = useMemo(
    () => ({
      enLinea,
      pendientes: pendientesCount,
      sincronizando,
      encolarRegistro: (tipo: TipoRegistro, payload: Record<string, unknown>) => {
        encolar(tipo, payload);
        refrescarPendientes();
      },
      sincronizar,
      verificarRed,
    }),
    [enLinea, pendientesCount, sincronizando, refrescarPendientes, sincronizar, verificarRed],
  );

  return <SyncContext.Provider value={valor}>{children}</SyncContext.Provider>;
}

export function useSync(): EstadoSync {
  return useContext(SyncContext);
}
