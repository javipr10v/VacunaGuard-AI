import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IniciarSesionDto } from '../../application/dto/iniciar-sesion.dto';
import { RegistrarUsuarioDto } from '../../application/dto/registrar-usuario.dto';
import { ActualizarUsuarioDto } from '../../application/dto/actualizar-usuario.dto';
import { ActualizarBrigadaDto } from '../../application/dto/actualizar-brigada.dto';
import { CrearBrigadaDto } from '../../application/dto/crear-brigada.dto';
import { ActualizarUsuarioUseCase, ListarUsuariosUseCase } from '../../application/use-cases/gestion-usuarios.use-case';
import { ActualizarBrigadaUseCase, CrearBrigadaUseCase, EliminarBrigadaUseCase, ListarBrigadasUseCase } from '../../application/use-cases/gestion-brigadas.use-case';
import { IniciarSesionUseCase } from '../../application/use-cases/iniciar-sesion.use-case';
import { RegistrarUsuarioUseCase } from '../../application/use-cases/registrar-usuario.use-case';
import { Rol } from '../../domain/value-objects/rol.vo';
import { JwtAuthGuard } from '../security/jwt-auth.guard';
import { Roles } from '../security/roles.decorator';
import { RolesGuard } from '../security/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly iniciarSesion: IniciarSesionUseCase,
    private readonly registrarUsuario: RegistrarUsuarioUseCase,
    private readonly listarUsuarios: ListarUsuariosUseCase,
    private readonly actualizarUsuario: ActualizarUsuarioUseCase,
    private readonly listarBrigadas: ListarBrigadasUseCase,
    private readonly crearBrigada: CrearBrigadaUseCase,
    private readonly actualizarBrigada: ActualizarBrigadaUseCase,
    private readonly eliminarBrigada: EliminarBrigadaUseCase,
  ) {}

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  login(@Body() dto: IniciarSesionDto) {
    return this.iniciarSesion.ejecutar(dto);
  }

  @Post('registro')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR)
  registro(@Body() dto: RegistrarUsuarioDto) {
    return this.registrarUsuario.ejecutar(dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  perfil(@Req() req: { usuario: unknown }) {
    return req.usuario;
  }

  @Get('usuarios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  usuarios(@Req() req: { usuario: { rol: string } }) {
    return this.listarUsuarios.ejecutar(req.usuario.rol);
  }

  @Patch('usuarios/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  usuario(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto, @Req() req: { usuario: { rol: string } }) {
    return this.actualizarUsuario.ejecutar(id, dto, req.usuario.rol);
  }

  @Get('brigadas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  brigadas() {
    return this.listarBrigadas.ejecutar();
  }

  @Post('brigadas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  brigadaAlta(@Body() dto: CrearBrigadaDto) {
    return this.crearBrigada.ejecutar(dto);
  }

  @Patch('brigadas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  brigadaEditar(@Param('id') id: string, @Body() dto: ActualizarBrigadaDto) {
    return this.actualizarBrigada.ejecutar(id, dto);
  }

  @Delete('brigadas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMINISTRADOR, Rol.COORDINADOR)
  brigadaBaja(@Param('id') id: string) {
    return this.eliminarBrigada.ejecutar(id);
  }
}
