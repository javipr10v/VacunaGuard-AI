import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Alerta, Boton, Campo, Tarjeta, Titulo } from '@/components/ui';
import { colores } from '@/theme';
import { registrarCiudadano } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { useSync } from '@/context/SyncContext';

const PATRON_CURP = /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HMX](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d]\d$/;

export default function CiudadanoScreen() {
  const { encolarRegistro } = useSync();
  const [curp, setCurp] = useState('');
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'critico'; texto: string } | null>(null);
  const [cargando, setCargando] = useState(false);

  const curpValida = PATRON_CURP.test(curp.trim().toUpperCase());

  const enviar = async () => {
    setMensaje(null);
    setCargando(true);
    try {
      const r = await registrarCiudadano({ curp: curp.trim().toUpperCase(), nombre: nombre.trim(), fechaNacimiento: fecha });
      setMensaje({ tipo: 'ok', texto: (r.yaExistia ? 'El ciudadano ya estaba registrado · CURP ' : 'Ciudadano dado de alta · CURP ') + r.curp });
    } catch (e) {
      if (e instanceof ErrorApi && e.message.startsWith('No se pudo conectar')) {
        encolarRegistro('ciudadano', { curp: curp.trim().toUpperCase(), nombre: nombre.trim(), fechaNacimiento: fecha });
        setMensaje({ tipo: 'ok', texto: 'Guardado en modo campo · se enviará al volver la señal' });
        setCurp(''); setNombre(''); setFecha('');
      } else {
        setMensaje({ tipo: 'critico', texto: e instanceof ErrorApi ? e.message : 'No se pudo registrar' });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <ScrollView style={estilos.fondo} contentContainerStyle={estilos.contenido}>
      <Titulo texto="Nuevo ciudadano" sub="Registro en campo" />
      <Tarjeta>
        <Campo etiqueta="CURP" value={curp} onChangeText={setCurp} autoCapitalize="characters" maxLength={18} placeholder="GUMJ900515HCSZRV08" />
        {curp.length > 0 && !curpValida ? <Alerta tipo="critico" titulo="La CURP no es válida" /> : null}
        <Campo etiqueta="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Luis Gómez Pérez" />
        <Campo etiqueta="Fecha de nacimiento (AAAA-MM-DD)" value={fecha} onChangeText={setFecha} placeholder="2020-06-15" />
        <Boton titulo="Dar de alta" onPress={enviar} cargando={cargando} deshabilitado={!curpValida || !nombre.trim() || !fecha.trim()} />
      </Tarjeta>
      {mensaje ? <Alerta tipo={mensaje.tipo} titulo={mensaje.texto} /> : null}
    </ScrollView>
  );
};

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 18, gap: 11 },
});
