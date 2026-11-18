import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alerta, Avatar, Boton, Campo, Pildora, Tarjeta, Titulo } from '@/components/ui';
import { colores, fuentes } from '@/theme';
import { actualizarCiudadano, buscarCiudadano, eliminarCiudadano, listarLotes, registrarVacunacion, vacunacionesDe, type ConsultaCiudadanoResumen, type LoteResumen, type VacunacionResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { useSync } from '@/context/SyncContext';
import { guardarCache, leerCache } from '@/storage/cola';
import { useAuth } from '@/context/AuthContext';

export default function VacunarScreen() {
  const { encolarRegistro } = useSync();
  const { usuario } = useAuth();
  const [curp, setCurp] = useState('');
  const [ciudadano, setCiudadano] = useState<ConsultaCiudadanoResumen | null>(null);
  const [vacuna, setVacuna] = useState('');
  const [lote, setLote] = useState('');
  const [lotes, setLotes] = useState<LoteResumen[]>([]);
  const [menuLote, setMenuLote] = useState(false);
  const [dosis, setDosis] = useState('');
  const [historial, setHistorial] = useState<VacunacionResumen[]>([]);
  const [editandoCiudadano, setEditandoCiudadano] = useState(false);
  const [editNombre, setEditNombre] = useState('');
  const [editFecha, setEditFecha] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico' | 'advertencia'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const refrescarLotes = async () => {
    try {
      const ls = await listarLotes();
      setLotes(ls);
      guardarCache('lotes', JSON.stringify(ls));
    } catch {
      // sin conexión o servicio caído: usar el inventario guardado en caché
      const cache = leerCache('lotes');
      if (cache) {
        try { setLotes(JSON.parse(cache) as LoteResumen[]); } catch { /* caché dañada */ }
      }
    }
  };

  const buscar = async () => {
    setMensaje(null);
    setCargando(true);
    void refrescarLotes();
    try {
      const r = await buscarCiudadano(curp.trim().toUpperCase());
      if ('encontrado' in r && !r.encontrado) {
        setCiudadano(null);
        setMensaje({ tipo: 'critico', texto: 'No se encontró un ciudadano con esa CURP' });
      } else {
        const c = r as ConsultaCiudadanoResumen;
        setCiudadano(c);
        let h: VacunacionResumen[] = [];
        try {
          h = await vacunacionesDe(c.id);
        } catch {
          h = [];
        }
        setHistorial(h);
        guardarCache('ciudadano-' + c.curp, JSON.stringify({ ciudadano: c, historial: h }));
      }
    } catch (e) {
      const err = e instanceof ErrorApi ? e.message : 'Error al buscar';
      if (err.startsWith('No se pudo conectar') || err === 'Error al buscar') {
        const cache = leerCache('ciudadano-' + curp.trim().toUpperCase());
        if (cache) {
          try {
            const guardado = JSON.parse(cache) as { ciudadano: ConsultaCiudadanoResumen; historial: VacunacionResumen[] };
            setCiudadano(guardado.ciudadano);
            setHistorial(guardado.historial);
            setMensaje({ tipo: 'advertencia', texto: 'Datos del ciudadano en modo sin conexión' });
          } catch {
            setMensaje({ tipo: 'critico', texto: 'Sin conexión y sin datos guardados de este ciudadano' });
          }
        } else {
          setMensaje({ tipo: 'critico', texto: 'Sin conexión y sin datos guardados de este ciudadano' });
        }
      } else {
        setMensaje({ tipo: 'critico', texto: err });
      }
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

  const abrirEdicionCiudadano = () => {
    if (!ciudadano) return;
    setEditNombre(ciudadano.nombre);
    setEditFecha('');
    setEditandoCiudadano(true);
  };

  const guardarEdicionCiudadano = async () => {
    if (!ciudadano) return;
    try {
      const r = await actualizarCiudadano(ciudadano.id, {
        nombre: editNombre.trim(),
        ...(editFecha.trim() ? { fechaNacimiento: editFecha.trim() } : {}),
      });
      setCiudadano({ ...ciudadano, nombre: r.nombre, edadAnios: r.edadAnios });
      setEditandoCiudadano(false);
      setMensaje({ tipo: 'ok', texto: 'Ciudadano actualizado' });
    } catch (e) {
      setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo actualizar' });
    }
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
      void refrescarLotes();
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
              <TouchableOpacity onPress={abrirEdicionCiudadano}>
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmarEliminar}>
                <Text style={{ fontSize: 16 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </Tarjeta>
          <Tarjeta>
            <Text style={estilos.etiqueta}>Vacuna y lote a aplicar</Text>
            <TouchableOpacity style={estilos.campoLote} onPress={() => setMenuLote(true)}>
              <Text style={[estilos.campoLoteTexto, !lote ? { color: '#94a3b8' } : null]}>
                {lote ? '💉 ' + vacuna + ' · ' + lote + ' · quedan ' + (lotes.find((x) => x.numeroLote === lote)?.cantidad ?? '—') : 'Elige del inventario…'}
              </Text>
              <Text style={estilos.flecha}>▾</Text>
            </TouchableOpacity>
            <Campo etiqueta="Número de dosis" value={dosis} onChangeText={setDosis} keyboardType="number-pad" placeholder="2" />
            <Boton titulo="Aplicar y registrar" onPress={aplicar} cargando={cargando} deshabilitado={!vacuna.trim() || !lote.trim() || !dosis.trim()} />
          </Tarjeta>
          <Modal transparent visible={menuLote} animationType="fade" onRequestClose={() => setMenuLote(false)}>
            <TouchableOpacity style={estilos.fondoModal} activeOpacity={1} onPress={() => setMenuLote(false)}>
              <View style={estilos.menu}>
                <Text style={estilos.tituloMenu}>Inventario de la red de frío</Text>
                <ScrollView style={{ maxHeight: 320 }}>
                  {lotes
                    .filter((l) => !l.caducado && l.cantidad > 0)
                    .map((l) => (
                      <TouchableOpacity
                        key={l.id}
                        style={[estilos.opcion, l.numeroLote === lote ? estilos.opcionActiva : null]}
                        onPress={() => {
                          setVacuna(l.vacuna);
                          setLote(l.numeroLote);
                          setMenuLote(false);
                        }}
                      >
                        <Text style={estilos.opcionTexto}>💉 {l.vacuna} · {l.numeroLote} · {l.hieleraId ? '🧊 ' + l.hieleraId + ' · ' : ''}quedan {l.cantidad}</Text>
                      </TouchableOpacity>
                    ))}
                  {lotes.filter((l) => !l.caducado && l.cantidad > 0).length === 0 ? (
                    <Text style={estilos.vacio}>No hay lotes con stock disponible</Text>
                  ) : null}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
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
      <Modal transparent visible={editandoCiudadano} animationType="fade" onRequestClose={() => setEditandoCiudadano(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 26 }}>
          <View style={{ backgroundColor: colores.superficie, borderRadius: 16, padding: 14, gap: 10 }}>
            <Text style={estilos.nombre}>Editar datos del ciudadano</Text>
            <Campo etiqueta="Nombre completo" value={editNombre} onChangeText={setEditNombre} />
            <Campo etiqueta="Fecha de nacimiento (AAAA-MM-DD, opcional)" value={editFecha} onChangeText={setEditFecha} placeholder="2020-06-15" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Boton titulo="Cancelar" onPress={() => setEditandoCiudadano(false)} variante="fantasma" />
              </View>
              <View style={{ flex: 1 }}>
                <Boton titulo="Guardar" onPress={guardarEdicionCiudadano} deshabilitado={!editNombre.trim()} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11, width: '100%', maxWidth: 680, alignSelf: 'center' },
  nombre: { fontFamily: fuentes.medio, fontSize: 14, color: colores.texto },
  detalle: { fontFamily: fuentes.cuerpo, fontSize: 12, color: colores.mutado },
  etiqueta: { fontSize: 11, color: colores.mutado, marginBottom: 3, fontFamily: fuentes.medio },
  campoLote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 12 },
  campoLoteTexto: { fontSize: 13, color: colores.texto, fontFamily: fuentes.cuerpo, flex: 1 },
  flecha: { fontSize: 12, color: colores.mutado },
  fondoModal: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'center', padding: 26 },
  menu: { backgroundColor: colores.superficie, borderRadius: 16, padding: 10 },
  tituloMenu: { fontFamily: fuentes.medio, fontSize: 12, color: colores.mutado, marginBottom: 6, paddingHorizontal: 4 },
  opcion: { paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10 },
  opcionActiva: { backgroundColor: colores.celeste100 },
  opcionTexto: { fontSize: 13, fontFamily: fuentes.medio, color: colores.texto },
  vacio: { fontSize: 12, color: colores.mutado, padding: 10, fontFamily: fuentes.cuerpo },
});
