import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { actualizarBrigada, crearBrigada, eliminarBrigada, listarBrigadas, type BrigadaResumen } from '@/api/vacunaguard';
import { ErrorApi } from '@/api/client';
import { Alerta, Boton, Campo, Tarjeta, Titulo } from '@/components/ui';
import { Fondo } from '@/components/Fondo';
import { colores, fuentes } from '@/theme';

export default function BrigadasScreen() {
  const [brigadas, setBrigadas] = useState<BrigadaResumen[]>([]);
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);
  const [clave, setClave] = useState('');
  const [nombre, setNombre] = useState('');

  const cargar = useCallback(() => {
    listarBrigadas()
      .then(setBrigadas)
      .catch((e: unknown) => setError(e instanceof ErrorApi ? e.message : 'No se pudieron cargar las brigadas'));
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const guardarNueva = async () => {
    setError('');
    try {
      const b = await crearBrigada(clave.trim(), nombre.trim());
      setBrigadas((prev) => [...prev, b]);
      setClave('');
      setNombre('');
      setCreando(false);
    } catch (e) {
      setError(e instanceof ErrorApi ? e.message : 'No se pudo crear la brigada');
    }
  };

  const confirmarEliminar = (b: BrigadaResumen) => {
    Alert.alert('Eliminar brigada', '¿Eliminar ' + b.clave + ' · ' + b.nombre + '? Los brigadistas asignados quedarán sin brigada.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminarBrigada(b.id)
            .then(() => setBrigadas((prev) => prev.filter((x) => x.id !== b.id)))
            .catch((e: unknown) => setError(e instanceof ErrorApi ? e.message : 'No se pudo eliminar'));
        },
      },
    ]);
  };

  const renombrar = (b: BrigadaResumen) => {
    Alert.prompt(
      'Renombrar brigada',
      'Nuevo nombre para ' + b.clave,
      (texto) => {
        if (texto && texto.trim()) {
          actualizarBrigada(b.id, { nombre: texto.trim() })
            .then(() => cargar())
            .catch((e: unknown) => setError(e instanceof ErrorApi ? e.message : 'No se pudo renombrar'));
        }
      },
      'plain-text',
      b.nombre,
    );
  };

  return (
    <Fondo>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <Titulo texto="Brigadas" sub="Crea y administra las brigadas de vacunación" />

      <Boton titulo={creando ? 'Ocultar formulario' : '+ Nueva brigada'} onPress={() => setCreando(!creando)} variante={creando ? 'fantasma' : 'primario'} />
      {creando ? (
        <Tarjeta>
          <Campo etiqueta="Clave (ej. B-03)" value={clave} onChangeText={setClave} placeholder="B-03" />
          <Campo etiqueta="Nombre (ej. Brigada Costa)" value={nombre} onChangeText={setNombre} placeholder="Brigada Costa" />
          <Boton titulo="Guardar brigada" onPress={guardarNueva} deshabilitado={!clave.trim() || !nombre.trim()} />
        </Tarjeta>
      ) : null}

      {error ? <Alerta tipo="critico" titulo={error} /> : null}

      {brigadas.map((b) => (
        <Tarjeta key={b.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>🚑</Text>
            <View style={{ flex: 1 }}>
              <Text style={estilos.clave}>{b.clave}</Text>
              <Text style={estilos.nombre}>{b.nombre}</Text>
            </View>
            <TouchableOpacity onPress={() => renombrar(b)}>
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmarEliminar(b)}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </Tarjeta>
      ))}
      {brigadas.length === 0 && !error ? <Alerta tipo="ok" titulo="Aún no hay brigadas. Crea la primera con el botón de arriba." /> : null}
    </ScrollView>
    </Fondo>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: 18, gap: 11 },
  clave: { fontFamily: fuentes.titulo, fontSize: 14, color: colores.primario700 },
  nombre: { fontFamily: fuentes.cuerpo, fontSize: 12, color: colores.mutado },
});
