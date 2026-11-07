import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Alerta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { consultarProtocolo, type ResultadoConsulta } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';

interface Mensaje {
  rol: 'user' | 'ai';
  texto: string;
  citas?: { documento: string; anio: number; pagina: number }[];
}

const SUGERENCIAS = ['¿Esquema de la SRP?', '¿Contraindicaciones de la BCG?', 'Temperatura de la red de frío'];

export default function ProtocolosScreen() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [pregunta, setPregunta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const preguntar = async (texto: string) => {
    const q = texto.trim();
    if (!q || cargando) return;
    setPregunta('');
    setError('');
    setMensajes((prev) => [...prev, { rol: 'user', texto: q }]);
    setCargando(true);
    try {
      const r: ResultadoConsulta = await consultarProtocolo(q);
      setMensajes((prev) => [...prev, { rol: 'ai', texto: r.respuesta, citas: r.citas }]);
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'El consultor no está disponible');
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={estilos.fondo}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={estilos.contenido}>
        <Titulo texto="Consultor de protocolos" sub="Protocolos oficiales de vacunación" />
        {error ? <Alerta tipo="critico" titulo={error} /> : null}
        {mensajes.length === 0 ? (
          <Alerta tipo="ok" titulo="Pregúntame sobre esquemas, dosis o contraindicaciones" detalle="Las respuestas citan los documentos oficiales" />
        ) : null}
        {mensajes.map((m, i) => (
          <View key={i} style={[estilos.burbuja, m.rol === 'user' ? estilos.usuario : estilos.ai]}>
            <Text style={m.rol === 'user' ? estilos.textoUsuario : estilos.textoAi}>{m.texto}</Text>
            {m.citas && m.citas.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                {m.citas.map((c, j) => (
                  <Text key={j} style={estilos.cita}>📖 {c.documento} ({c.anio}), p. {c.pagina}</Text>
                ))}
              </View>
            ) : null}
          </View>
        ))}
        {cargando ? <Text style={estilos.pensando}>Consultando los documentos…</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SUGERENCIAS.map((s) => (
            <TouchableOpacity key={s} onPress={() => preguntar(s)}>
              <Text style={estilos.sugerencia}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={estilos.entrada}>
        <TextInput
          style={estilos.campo}
          value={pregunta}
          onChangeText={setPregunta}
          placeholder="Escribe tu pregunta…"
          placeholderTextColor="#94a3b8"
          onSubmitEditing={() => preguntar(pregunta)}
        />
        <TouchableOpacity style={estilos.enviar} onPress={() => preguntar(pregunta)} disabled={cargando || !pregunta.trim()}>
          <Text style={{ color: '#fff' }}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 10, paddingBottom: 90 },
  burbuja: { maxWidth: '88%', borderRadius: 14, padding: 10 },
  usuario: { alignSelf: 'flex-end', backgroundColor: colores.primario600, borderBottomRightRadius: 4 },
  ai: { alignSelf: 'flex-start', backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderBottomLeftRadius: 4 },
  textoUsuario: { color: '#ffffff', fontSize: 13, fontFamily: fuentes.cuerpo },
  textoAi: { color: colores.texto, fontSize: 13, fontFamily: fuentes.cuerpo },
  cita: { fontSize: 10, fontFamily: fuentes.medio, color: colores.primario700, backgroundColor: colores.celeste100, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 999, overflow: 'hidden' },
  pensando: { fontSize: 11.5, color: colores.mutado, fontFamily: fuentes.cuerpo, fontStyle: 'italic' },
  sugerencia: { fontSize: 11, fontFamily: fuentes.medio, color: '#475569', backgroundColor: '#f1f5f9', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, overflow: 'hidden' },
  entrada: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 8, padding: 12, backgroundColor: colores.superficie, borderTopWidth: 1, borderTopColor: colores.linea, alignItems: 'center' },
  campo: { flex: 1, backgroundColor: colores.fondo, borderWidth: 1, borderColor: colores.linea, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, fontSize: 13, color: colores.texto, fontFamily: fuentes.cuerpo },
  enviar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colores.primario600, alignItems: 'center', justifyContent: 'center' },
});
