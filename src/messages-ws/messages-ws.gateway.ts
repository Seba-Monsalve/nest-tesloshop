import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from 'src/auth/interfaces';
@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly JwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;

    let payload: JWTPayload;
    try {
      payload = this.JwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      if (error) if (error.message == 'User already connected') return;
      client.disconnect();
    }
    this.wss.emit(
      'clients_updated',
      this.messagesWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(
      'clients_updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: NewMessageDto) {
    // emite a todos los clientes conectados

    const userFullName = this.messagesWsService.getFullName(client.id);
    this.wss.emit('message-from-server', {
      message: payload,
      fullName: userFullName,
    });

    // emite solo al cliente que lo envio
    //   client.emit('message-from-server', {
    //     message: payload,
    //     fullName: client.id,
    //   });
    // }

    // emite a todos los clientes conectados menos al que lo envio
    // client.broadcast.emit('message-from-server', {
    //   message: payload,
    //   fullName: client.id,
    // });
  }
}
