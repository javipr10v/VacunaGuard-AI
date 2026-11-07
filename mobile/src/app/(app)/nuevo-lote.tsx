import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Alerta, Boton, Campo, Tarjeta, Titulo } from '@/components/ui';
import { colores } from '@/theme';
import { crearLote } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';

export default function NuevoLoteScreen() {
  const [vacuna, setVacuna] = useState('');
  const [numeroLote, setNumeroLote] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaCaducidad, setFechaCaducidad] = useState('');
  const [umbral, setUmbral] = useState('20');
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
      });
      setMensaje({ tipo: 'ok', texto: 'Lote ' + r.vacuna + ' · ' + r.numeroLote + ' dado de alta con ' + r.cantidad + ' dosis' });
      setVacuna(''); setNumeroLote(''); setCantidad(''); setFechaCaducidad('');
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo dar de alta el lote' });
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
        <Boton
          titulo="Dar de alta el lote"
          onPress={enviar}
          cargando={cargando}
          deshabilitado={!vacuna.trim() || !numeroLote.trim() || !cantidad.trim() || !fechaCaducidad.trim()}
        />
      </Tarjeta>
      {mensaje ? <Alerta tipo={mensaje.tipo} titulo={mensaje.texto} /> : null}
      <Alerta tipo="ok" titulo="❄️ El lote quedará disponible para aplicar dosis" detalle="El stock se descuenta automáticamente con cada vacunación" />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
});
