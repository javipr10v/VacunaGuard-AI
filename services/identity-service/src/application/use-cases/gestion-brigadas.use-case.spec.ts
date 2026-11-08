import { Brigada } from '../../domain/entities/brigada.entity';
import { BrigadaNoEncontradaException, BrigadaYaExisteException } from '../../domain/exceptions/brigada.exceptions';
import { IdsFalso } from '../testing/fakes';
import type { BrigadaRepositoryPort } from '../ports/out/brigada.repository.port';
import {
  ActualizarBrigadaUseCase,
  CrearBrigadaUseCase,
  EliminarBrigadaUseCase,
  ListarBrigadasUseCase,
} from './gestion-brigadas.use-case';
import { RepoMemoria } from '../testing/fakes';
import { Usuario } from '../../domain/entities/usuario.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Rol } from '../../domain/value-objects/rol.vo';

class BrigadasMemoria implements BrigadaRepositoryPort {
  items = new Map<string, Brigada>();
  async guardar(b: Brigada) { this.items.set(b.id, b); }
  async listar() { return [...this.items.values()]; }
  async buscarPorId(id: string) { return this.items.get(id) ?? null; }
  async buscarPorClave(clave: string) {
    return [...this.items.values()].find((b) => b.clave === clave) ?? null;
  }
  async eliminar(id: string) { return this.items.delete(id) ? 1 : 0; }
}

describe('Gestión de brigadas', () => {
  it('crea brigadas con clave normalizada y evita duplicados', async () => {
    const repo = new BrigadasMemoria();
    const useCase = new CrearBrigadaUseCase(repo, new IdsFalso());
    const b = await useCase.ejecutar({ clave: 'b-12', nombre: 'Brigada Centro' });
    expect(b).toMatchObject({ clave: 'B-12', nombre: 'Brigada Centro' });
    await expect(useCase.ejecutar({ clave: 'B-12', nombre: 'Otra' })).rejects.toBeInstanceOf(BrigadaYaExisteException);
  });

  it('lista y renombra brigadas', async () => {
    const repo = new BrigadasMemoria();
    repo.items.set('b1', new Brigada('b1', 'B-12', 'Centro'));
    expect(await new ListarBrigadasUseCase(repo).ejecutar()).toHaveLength(1);
    const r = await new ActualizarBrigadaUseCase(repo).ejecutar('b1', { nombre: 'Brigada Centro Norte' });
    expect(r.nombre).toBe('Brigada Centro Norte');
    await expect(new ActualizarBrigadaUseCase(repo).ejecutar('no', { nombre: 'X' })).rejects.toBeInstanceOf(BrigadaNoEncontradaException);
  });

  it('elimina la brigada y desasigna a sus brigadistas', async () => {
    const brigadas = new BrigadasMemoria();
    brigadas.items.set('b1', new Brigada('b1', 'B-12', 'Centro'));
    const usuarios = new RepoMemoria();
    usuarios.items.set('u1', new Usuario('u1', 'Ana', Email.crear('ana@salud.gob.mx'), 'h', Rol.BRIGADISTA, true, 'B-12'));
    const r = await new EliminarBrigadaUseCase(brigadas, usuarios).ejecutar('b1');
    expect(r.eliminado).toBe(true);
    expect(brigadas.items.size).toBe(0);
    expect(usuarios.items.get('u1')!.brigadaId).toBeNull();
  });
});
