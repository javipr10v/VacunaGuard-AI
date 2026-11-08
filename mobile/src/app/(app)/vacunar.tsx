import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alerta, Avatar, Boton, Campo, Pildora, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { buscarCiudadano, eliminarCiudadano, registrarVacunacion, vacunacionesDe, type ConsultaCiudadanoResumen, type VacunacionResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { useSync } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';

export default function VacunarScreen() {
  const { encolarRegistro } = useSync();
  const { usuario } = useAuth();
  const [curp, setCurp] = useState('');
  const [ciudadano, setCiudadano] = useState<ConsultaCiudadanoResumen | null>(null);
  const [vacuna, setVacuna] = useState('');
  const [lote, setLote] = useState('');
  const [dosis, setDosis] = useState('');
  const [historial, setHistorial] = useState<VacunacionResumen[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    setMensaje(null);
    setCargando(true);
    try {
      const r = await buscarCiudadano(curp.trim().toUpperCase());
      if ('encontrado' in r && !r.encontrado) {
        setCiudadano(null);
        setMensaje({ tipo: 'critico', texto: 'No se encontró un ciudadano con esa CURP' });
      } else {
        const c = r as ConsultaCiudadanoResumen;
        setCiudadano(c);
        const h = await vacunacionesDe(c.id);
        setHistorial(h);
      }
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'Error al buscar' });
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = () => {
    if (!ciudadano) return;
    Alert.alert('Eliminar ciudadano', '¿Seguro que quieres eliminar a ' + ciudadano.nombre + '? Se borrarán también sus dosis registradas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminarCiudadano(ciudadano.id)
            .then(() => {
              setMensaje({ tipo: 'ok', texto: 'Ciudadano eliminado' });
              setCiudadano(null);
              setHistorial([]);
            })
            .catch((e: unknown) => setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo eliminar' }));
        },
      },
    ]);
  };

  const aplicar = async () => {
    if (!ciudadano) return;
    setMensaje(null);
    setCargando(true);
    try {
      await registrarVacunacion({ ciudadanoId: ciudadano.id, vacuna: vacuna.trim(), lote: lote.trim(), numeroDosis: Number(dosis) });
      setMensaje({ tipo: 'ok', texto: 'Dosis registrada · el stock del lote se actualizó' });
      const h = await vacunacionesDe(ciudadano.id);
      setHistorial(h);
    } catch (e) {
      if (e instanceof ErrorApi && e.message.startsWith('No se pudo conectar') && ciudadano) {
        encolarRegistro('vacunacion', { ciudadanoId: ciudadano.id, vacuna: vacuna.trim(), lote: lote.trim(), numeroDosis: Number(dosis) });
        setMensaje({ tipo: 'ok', texto: 'Dosis guardada en modo campo · se enviará al reconectar' });
      } else {
        setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo registrar la dosis' });
      }
    } finally {
      setCargando(false);
    }
  };

  if (usuario?.rol !== 'BRIGADISTA') {
    return (
      <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
        <Alerta tipo="advertencia" titulo="Solo los brigadistas aplican vacunas" detalle={'Tu rol es ' + (usuario?.rol ?? '') + '. Contacta a tu coordinador.'} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Titulo texto="Aplicar vacuna" sub="Búsqueda por CURP" />
      <Tarjeta>
        <Campo etiqueta="CURP del ciudadano" value={curp} onChangeText={setCurp} autoCapitalize="characters" maxLength={18} placeholder="GUMJ900515HCSZRV08" />
        <Boton titulo="Buscar ciudadano" onPress={buscar} cargando={cargando} deshabilitado={curp.trim().length !== 18} />
      </Tarjeta>
      {ciudadano ? (
        <>
          <Tarjeta>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar iniciales={ciudadano.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()} />
              <View style={{ flex: 1 }}>
                <Text style={estilos.nombre}>{ciudadano.nombre}</Text>
                <Text style={estilos.detalle}>{ciudadano.edadAnios} años · CURP {ciudadano.curp}</Text>
              </View>
              <TouchableOpacity onPress={confirmarEliminar}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </Tarjeta>
          <Tarjeta>
            <Campo etiqueta="Vacuna" value={vacuna} onChangeText={setVacuna} placeholder="SRP" />
            <Campo etiqueta="Lote" value={lote} onChangeText={setLote} placeholder="L-DEMO-22" />
            <Campo etiqueta="Número de dosis" value={dosis} onChangeText={setDosis} keyboardType="number-pad" placeholder="2" />
            <Boton titulo="Aplicar y registrar" onPress={aplicar} cargando={cargando} deshabilitado={!vacuna.trim() || !lote.trim() || !dosis.trim()} />
          </Tarjeta>
          <Tarjeta>
            <Text style={estilos.nombre}>Historial de dosis</Text>
            {historial.length === 0 ? (
              <Text style={estilos.detalle}>Sin dosis registradas</Text>
            ) : (
              historial.map((h) => (
                <View key={h.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 }}>
                  <Text style={estilos.detalle}>{h.vacuna} · dosis {h.numeroDosis} · {h.fechaAplicacion.slice(0, 10)}</Text>
                  <Pildora estado="OK" />
                </View>
              ))
            )}
          </Tarjeta>
        </>
      ) : null}
      {mensaje ? <Alerta tipo={mensaje.tipo} titulo={mensaje.texto} /> : null}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  nombre: { fontFamily: fuentes.medio, fontSize: 14, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 12, color: colores.mutado },
});
