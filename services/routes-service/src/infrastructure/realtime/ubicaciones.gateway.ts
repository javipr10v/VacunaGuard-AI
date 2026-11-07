import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type {
  NotificadorUbicacionesPort,
  UbicacionResumen,
} from '../../application/ports/out/notificador-ubicaciones.port';

/**
 * Canal en tiempo real para que el coordinador vea las brigadas en el mapa.
 * Cada POST /ubicaciones emite un evento 'ubicacion' a todos los clientes conectados.
 */
@Injectable()
@WebSocketGateway({ path: '/socket.io' })
export class UbicacionesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, NotificadorUbicacionesPort
{
  private readonly logger = new Logger(UbicacionesGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    this.logger.log('Cliente conectado al canal de ubicaciones: ' + client.id);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log('Cliente desconectado: ' + client.id);
  }

  ubicacionActualizada(resumen: UbicacionResumen): void {
    this.server?.emit('ubicacion', resumen);
  }
}
