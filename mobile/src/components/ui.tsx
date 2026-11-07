import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View, type TextInputProps, type ViewStyle } from 'react-native';
import { colores, fuentes } from '@/theme';

interface BotonProps {
  titulo: string;
  onPress: () => void;
  cargando?: boolean;
  variante?: 'primario' | 'fantasma';
  deshabilitado?: boolean;
}

export function Boton({ titulo, onPress, cargando, variante = 'primario', deshabilitado }: BotonProps) {
  const primario = variante === 'primario';
  return (
    <TouchableOpacity
      style={[estilos.boton, primario ? estilos.botonPrimario : estilos.botonFantasma, (deshabilitado || cargando) ? { opacity: 0.55 } : null]}
      onPress={onPress}
      disabled={deshabilitado || cargando}
    >
      {cargando ? (
        <ActivityIndicator color={primario ? '#ffffff' : colores.primario700} />
      ) : (
        <Text style={primario ? estilos.botonTexto : estilos.botonTextoFantasma}>{titulo}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Campo({ etiqueta, ...props }: { etiqueta: string } & TextInputProps) {
  return (
    <View>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput style={estilos.campo} placeholderTextColor="#94a3b8" {...props} />
    </View>
  );
}

export function Tarjeta({ children, estilo }: { children: ReactNode; estilo?: ViewStyle }) {
  return <View style={[estilos.tarjeta, estilo]}>{children}</View>;
}

export function Titulo({ texto, sub }: { texto: string; sub?: string }) {
  return (
    <View style={{ marginBottom: 2 }}>
      {sub ? <Text style={estilos.subtitulo}>{sub}</Text> : null}
      <Text style={estilos.titulo}>{texto}</Text>
    </View>
  );
}

export function Alerta({ tipo, titulo, detalle }: { tipo: 'ok' | 'advertencia' | 'critico'; titulo: string; detalle?: string }) {
  const fondos = { ok: colores.okFondo, advertencia: colores.advertenciaFondo, critico: colores.criticoFondo };
  const bordes = { ok: '#bbf7d0', advertencia: '#fde68a', critico: '#fecaca' };
  return (
    <View style={[estilos.alerta, { backgroundColor: fondos[tipo], borderColor: bordes[tipo] }]}>
      <Text style={estilos.alertaTitulo}>{titulo}</Text>
      {detalle ? <Text style={estilos.alertaDetalle}>{detalle}</Text> : null}
    </View>
  );
}

export function Pildora({ estado }: { estado: 'NORMAL' | 'ADVERTENCIA' | 'CRITICA' | 'PENDIENTE' | 'OK' }) {
  const mapa = {
    NORMAL: { fondo: colores.okFondo, texto: colores.ok, etiqueta: '● NORMAL' },
    ADVERTENCIA: { fondo: colores.advertenciaFondo, texto: colores.advertencia, etiqueta: '● ADVERTENCIA' },
    CRITICA: { fondo: colores.criticoFondo, texto: colores.critico, etiqueta: '● CRÍTICA' },
    PENDIENTE: { fondo: '#e2e8f0', texto: '#475569', etiqueta: 'pendiente' },
    OK: { fondo: colores.okFondo, texto: colores.ok, etiqueta: '✓ aplicada' },
  } as const;
  const c = mapa[estado];
  return (
    <Text style={[estilos.pildora, { backgroundColor: c.fondo, color: c.texto }]}>{c.etiqueta}</Text>
  );
}

export function Avatar({ iniciales, color }: { iniciales: string; color?: string }) {
  return (
    <View style={[estilos.avatar, { backgroundColor: color ?? colores.primario600 }]}>
      <Text style={estilos.avatarTexto}>{iniciales}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  boton: { borderRadius: 13, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  botonPrimario: { backgroundColor: colores.primario600, shadowColor: colores.primario700, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  botonFantasma: { backgroundColor: colores.superficie, borderWidth: 1.5, borderColor: colores.celeste100 },
  botonTexto: { color: '#ffffff', fontFamily: fuentes.medio, fontSize: 14 },
  botonTextoFantasma: { color: colores.primario700, fontFamily: fuentes.medio, fontSize: 14 },
  etiqueta: { fontSize: 11, color: colores.mutado, marginBottom: 3, fontFamily: fuentes.medio },
  campo: { backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12, fontSize: 13.5, color: colores.texto, fontFamily: fuentes.cuerpo },
  tarjeta: { backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 14, padding: 12 },
  subtitulo: { fontSize: 11, color: colores.mutado, fontFamily: fuentes.medio, marginBottom: 1 },
  titulo: { fontSize: 20, fontFamily: fuentes.titulo, color: colores.texto },
  alerta: { borderRadius: 13, padding: 10, borderWidth: 1 },
  alertaTitulo: { fontFamily: fuentes.medio, fontSize: 12.5 },
  alertaDetalle: { fontFamily: fuentes.cuerpo, fontSize: 11, color: colores.mutado, marginTop: 1 },
  pildora: { fontFamily: fuentes.medio, fontSize: 10, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, overflow: 'hidden', alignSelf: 'flex-start' },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#ffffff', fontFamily: fuentes.medio, fontSize: 11 },
});
