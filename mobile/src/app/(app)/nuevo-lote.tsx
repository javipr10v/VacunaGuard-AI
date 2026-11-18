import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alerta, Boton, Campo, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { crearLote } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { useSync } from '@/context/SyncContext';

export default function NuevoLoteScreen() {
  const { encolarRegistro } = useSync();
  const [vacuna, setVacuna] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [umbral, setUmbral] = useState('20');
  const [hielera, setHielera] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const enviar = async () => {
    setMensaje(null);
    setCargando(true);
    try {
      const r = await crearLote({
        vacuna: vacuna.trim(),
        numeroLote: numeroLote.trim(),
        cantidad: Number(cantidad),
        fechaCaducidad: fechaCaducidad.trim(),
        umbralStockBajo: Number(umbral) || 20,
        hieleraId: hielera || undefined,
      });
      setMensaje({ tipo: 'ok', texto: 'Lote ' + r.vacuna + ' · ' + r.numeroLote + ' dado de alta con ' + r.cantidad + ' dosis' + (r.hieleraId ? ' en ' + r.hieleraId : '') });
      setVacuna(''); setNumeroLote(''); setCantidad(''); setFechaCaducidad(''); setHielera('');
    } catch (e) {
      if (e instanceof ErrorApi && e.message.startsWith('No se pudo conectar')) {
        encolarRegistro('lote', {
          vacuna: vacuna.trim(),
          numeroLote: numeroLote.trim(),
          cantidad: Number(cantidad),
          fechaCaducidad: fechaCaducidad.trim(),
          umbralStockBajo: Number(umbral) || 20,
          hieleraId: hielera || undefined,
        });
        setMensaje({ tipo: 'ok', texto: 'Lote guardado en modo campo · se enviará al reconectar' });
        setVacuna(''); setNumeroLote(''); setCantidad(''); setFechaCaducidad(''); setHielera('');
      } else {
        setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo dar de alta el lote' });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Titulo texto="Nuevo lote" sub="Alta de vacunas en la red de frío" />
      <Tarjeta>
        <Campo etiqueta="Vacuna" value={vacuna} onChangeText={setVacuna} placeholder="SRP, Influenza, BCG…" />
        <Campo etiqueta="Número de lote" value={numeroLote} onChangeText={setNumeroLote} placeholder="L-2026-045" />
        <Campo etiqueta="Cantidad de dosis" value={cantidad} onChangeText={setCantidad} keyboardType="number-pad" placeholder="100" />
        <Campo etiqueta="Fecha de caducidad (AAAA-MM-DD)" value={fechaCaducidad} onChangeText={setFechaCaducidad} placeholder="2027-06-30" />
        <Campo etiqueta="Umbral de stock bajo" value={umbral} onChangeText={setUmbral} keyboardType="number-pad" placeholder="20" />
        <Text style={estilos.etiqueta}>¿En qué hielera se guarda?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
          {['H-01', 'H-02', 'H-03', 'H-04', 'H-05'].map((h) => (
            <TouchableOpacity
              key={h}
              style={[estilos.chip, hielera === h ? estilos.chipActivo : null]}
              onPress={() => setHielera(hielera === h ? '' : h)}
            >
              <Text style={[estilos.chipTexto, hielera === h ? { color: colores.primario700 } : null]}>🧊 {h}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Boton
          titulo="Dar de alta el lote"
          onPress={enviar}
          cargando={cargando}
          deshabilitado={!vacuna.trim() || !numeroLote.trim() || !cantidad.trim() || !fechaCaducidad.trim()}
        />
      </Tarjeta>
      {mensaje ? <Alerta tipo={mensaje.tipo} titulo={mensaje.texto} /> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11, width: '100%', maxWidth: 680, alignSelf: 'center' },
  etiqueta: { fontSize: 11, color: colores.mutado, marginBottom: 3, fontFamily: fuentes.medio },
  chip: { backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  chipActivo: { backgroundColor: colores.celeste100, borderColor: colores.primario600 },
  chipTexto: { fontFamily: fuentes.medio, fontSize: 12.5, color: colores.texto },
});
