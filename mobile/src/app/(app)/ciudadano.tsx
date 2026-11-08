import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Alerta, Boton, Campo, Tarjeta, Titulo } from '@/components/ui';
import { SelectorEstado } from '@/components/SelectorEstado';
import { generarCurp } from '@/utils/curp';
import { colores, fuentes } from '@/theme';
import { registrarCiudadano } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { useSync } from '@/context/SyncContext';

const PATRON_CURP = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

export default function CiudadanoScreen() {
  const { encolarRegistro } = useSync();
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [sexo, setSexo] = useState<'H' | 'M' | ''>('');
  const [estado, setEstado] = useState('');
  const [curpManual, setCurpManual] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && !Number.isNaN(new Date(fecha + 'T00:00:00').getTime());

  const curpGenerada = useMemo(() => {
    if (!apellidoPaterno.trim() || !nombre.trim() || !fechaValida || !sexo || !estado) return '';
    try {
      return generarCurp({
        apellidoPaterno,
        apellidoMaterno,
        nombre,
        fechaNacimiento: new Date(fecha + 'T00:00:00'),
        sexo,
        estado,
      });
    } catch {
      return '';
    }
  }, [apellidoPaterno, apellidoMaterno, nombre, fecha, fechaValida, sexo, estado]);

  const curp = (curpManual || curpGenerada).toUpperCase();
  const curpValida = PATRON_CURP.test(curp);
  const nombreCompleto = (nombre.trim() + ' ' + apellidoPaterno.trim() + ' ' + apellidoMaterno.trim()).trim();

  const enviar = async () => {
    setMensaje(null);
    setCargando(true);
    try {
      const r = await registrarCiudadano({ curp, nombre: nombreCompleto, fechaNacimiento: fecha });
      setMensaje({ tipo: 'ok', texto: (r.yaExistia ? 'El ciudadano ya estaba registrado · CURP ' : 'Ciudadano dado de alta · CURP ') + r.curp });
      setApellidoPaterno(''); setApellidoMaterno(''); setNombre(''); setFecha(''); setSexo(''); setEstado(''); setCurpManual('');
    } catch (e) {
      if (e instanceof ErrorApi && e.message.startsWith('No se pudo conectar')) {
        encolarRegistro('ciudadano', { curp, nombre: nombreCompleto, fechaNacimiento: fecha });
        setMensaje({ tipo: 'ok', texto: 'Guardado en modo campo · se enviará al volver la señal' });
        setApellidoPaterno(''); setApellidoMaterno(''); setNombre(''); setFecha(''); setSexo(''); setEstado(''); setCurpManual('');
      } else {
        setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo registrar' });
      }
    } finally {
      setCargando(false);
    }
  };

  const completo = curpValida && nombreCompleto.length > 3 && fechaValida;

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto="Nuevo ciudadano" sub="Captura sus datos y la CURP se genera sola" />
      <Tarjeta>
        <Text style={estilos.seccion}>Datos personales</Text>
        <Campo etiqueta="Apellido paterno" value={apellidoPaterno} onChangeText={setApellidoPaterno} placeholder="Gómez" />
        <Campo etiqueta="Apellido materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} placeholder="Pérez" />
        <Campo etiqueta="Nombre(s)" value={nombre} onChangeText={setNombre} placeholder="Luis Alberto" />
        <Campo etiqueta="Fecha de nacimiento (AAAA-MM-DD)" value={fecha} onChangeText={setFecha} placeholder="2020-06-15" />
        {fecha.length > 0 && !fechaValida ? <Alerta tipo="critico" titulo="La fecha no es válida" /> : null}

        <Text style={estilos.etiqueta}>Sexo</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['M', 'H'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[estilos.chip, sexo === s ? estilos.chipActivo : null]}
              onPress={() => setSexo(s)}
            >
              <Text style={[estilos.chipTexto, sexo === s ? { color: colores.primario700 } : null]}>
                {s === 'M' ? '👩 Mujer' : '👨 Hombre'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SelectorEstado valor={estado} alCambiar={setEstado} />

        <Text style={estilos.seccion}>CURP</Text>
        <Campo etiqueta="CURP (generada automáticamente)" value={curp} onChangeText={setCurpManual} autoCapitalize="characters" maxLength={18} placeholder="Se genera con los datos de arriba" />
        {curpGenerada && !curpManual ? (
          <Alerta tipo="ok" titulo={'✨ CURP generada: ' + curpGenerada} />
        ) : null}
        {curp.length > 0 && !curpValida ? <Alerta tipo="critico" titulo="La CURP no es válida" /> : null}

        <Boton titulo="Dar de alta" onPress={enviar} cargando={cargando} deshabilitado={!completo} />
      </Tarjeta>
      {mensaje ? <Alerta tipo={mensaje.tipo} titulo={mensaje.texto} /> : null}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
  seccion: { fontFamily: fuentes.medio, fontSize: 12, color: colores.mutado, textTransform: 'uppercase', letterSpacing: 0.5 },
  etiqueta: { fontSize: 11, color: colores.mutado, marginBottom: 3, fontFamily: fuentes.medio },
  chip: { flex: 1, backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.linea, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  chipActivo: { backgroundColor: colores.celeste100, borderColor: colores.primario600 },
  chipTexto: { fontFamily: fuentes.medio, fontSize: 13, color: colores.texto },
});
