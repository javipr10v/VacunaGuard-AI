import { Brigada } from '../../domain/entities/brigada.entity';
import { BrigadaNoEncontradaException, BrigadaYaExisteException } from '../../domain/exceptions/brigada.exceptions';
import type { ActualizarBrigadaDto } from '../dto/actualizar-brigada.dto';
import type { CrearBrigadaDto } from '../dto/crear-brigada.dto';
import type { BrigadaRepositoryPort } from '../ports/out/brigada.repository.port';
import type { IdGeneratorPort } from '../ports/out/id-generator.port';
import type { UsuarioRepositoryPort } from '../ports/out/usuario.repository.port';

export interface BrigadaResumen {
  id: string;
  clave: string;
  nombre: string;
}

function resumir(b: Brigada): BrigadaResumen {
  return { id: b.id, clave: b.clave, nombre: b.nombre };
}

export class CrearBrigadaUseCase {
  constructor(
    private readonly brigadas: BrigadaRepositoryPort,
    private readonly ids: IdGeneratorPort,
  ) {}

  async ejecutar(dto: CrearBrigadaDto): Promise<BrigadaResumen> {
    const clave = dto.clave.trim().toUpperCase();
    if (await this.brigadas.buscarPorClave(clave)) throw new BrigadaYaExisteException(clave);
    const brigada = new Brigada(this.ids.generar(), clave, dto.nombre.trim());
    await this.brigadas.guardar(brigada);
    return resumir(brigada);
  }
}

export class ListarBrigadasUseCase {
  constructor(private readonly brigadas: BrigadaRepositoryPort) {}

  async ejecutar(): Promise<BrigadaResumen[]> {
    const todas = await this.brigadas.listar();
    return todas.map(resumir);
  }
}

export class ActualizarBrigadaUseCase {
  constructor(private readonly brigadas: BrigadaRepositoryPort) {}

  async ejecutar(id: string, dto: ActualizarBrigadaDto): Promise<BrigadaResumen> {
    const brigada = await this.brigadas.buscarPorId(id);
    if (!brigada) throw new BrigadaNoEncontradaException();
    if (dto.nombre !== undefined) brigada.renombrar(dto.nombre);
    if (dto.clave !== undefined) {
      const nueva = dto.clave.trim().toUpperCase();
      if (nueva && nueva !== brigada.clave) {
        if (await this.brigadas.buscarPorClave(nueva)) throw new BrigadaYaExisteException(nueva);
        (brigada as { clave: string }).clave = nueva;
      }
    }
    await this.brigadas.guardar(brigada);
    return resumir(brigada);
  }
}

export class EliminarBrigadaUseCase {
  constructor(
    private readonly brigadas: BrigadaRepositoryPort,
    private readonly usuarios: UsuarioRepositoryPort,
  ) {}

  async ejecutar(id: string): Promise<{ eliminado: boolean }> {
    const brigada = await this.brigadas.buscarPorId(id);
    if (!brigada) throw new BrigadaNoEncontradaException();
    // Desasignar a los brigadistas de esa brigada antes de eliminarla
    const todos = await this.usuarios.listar();
    for (const u of todos) {
      if (u.brigadaId === brigada.clave) {
        u.quitarBrigada();
        await this.usuarios.guardar(u);
      }
    }
    await this.brigadas.eliminar(id);
    return { eliminado: true };
  }
}
