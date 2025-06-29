import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(4000, { cors: true })
export class WebsocketService {
  @SubscribeMessage('message')
  handlemessage(client: Socket, message) {
    console.log('Message received:', message);
    client.emit('message', 'this testing data form backend');
  }
}
