import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

// O decorator @WebSocketGateway habilita o WebSocket.
// O cors: { origin: '*' } é CRUCIAL para a TV conseguir conectar sem bloqueio.
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TvGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('TvGateway');

  // 1. No afterInit, remova o server completamente
  afterInit() {
    this.logger.log('📡 WebSocket Gateway Inicializado!');
  }

  // 1. Mudamos para um objeto que obrigatoriamente tem um 'id' string
  handleConnection(client: { id: string }) {
    this.logger.log(`📺 Dispositivo conectado: ${client.id}`);
  }

  // 2. Mesma coisa no disconnect
  handleDisconnect(client: { id: string }) {
    this.logger.log(`❌ Dispositivo desconectado: ${client.id}`);
  }
}
