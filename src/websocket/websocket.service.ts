import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4000, { cors: true })
export class WebsocketService {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  handlemessage(@MessageBody() message, @ConnectedSocket() client: Socket) {
    console.log('Client connected:', client.id);
    console.log('Message received:', message);
    client.to('123').emit('message', `${client.id} messaged: ${message}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket) {
    console.log('Client joined room:', client.id);
    client.join('123');
    client.to('123').emit('message', `${client.id} user joined the room`);
    client.emit('joinedRoom', `You have joined room: ${123}`);
  }

  private rooms: { [roomId: string]: string[] } = {};

  @SubscribeMessage('join')
  handleJoin(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.join(roomId);
    console.log(`[JOIN] Client ${client.id} joined room ${roomId}`);

    if (!this.rooms[roomId]) this.rooms[roomId] = [];

    // Notify new client about existing users
    this.rooms[roomId].forEach((id) => {
      console.log(
        `[JOIN] Notifying new client ${client.id} about existing user ${id}`,
      );
      client.emit('user-joined', id);
    });

    // Notify existing users about new client
    client.to(roomId).emit('user-joined', client.id);
    console.log(
      `[JOIN] Notified all existing users in room ${roomId} about new client ${client.id}`,
    );

    this.rooms[roomId].push(client.id);
    console.log(
      `[ROOM STATE] Room ${roomId} users: ${this.rooms[roomId].join(', ')}`,
    );
  }

  @SubscribeMessage('offer')
  handleOffer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { target, offer } = data;
    console.log(
      `[OFFER] From ${client.id} to ${target}:`,
      offer.sdp?.slice(0, 50) + '...',
    );
    this.server.to(target).emit('offer', { senderId: client.id, offer });
  }

  @SubscribeMessage('answer')
  handleAnswer(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { target, answer } = data;
    console.log(
      `[ANSWER] From ${client.id} to ${target}:`,
      answer.sdp?.slice(0, 50) + '...',
    );
    this.server.to(target).emit('answer', { senderId: client.id, answer });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { target, candidate } = data;
    console.log(`[ICE] From ${client.id} to ${target}:`, candidate.candidate);
    this.server
      .to(target)
      .emit('ice-candidate', { senderId: client.id, candidate });
  }

  // Optional: handle disconnect
  handleDisconnect(client: Socket) {
    console.log(`[DISCONNECT] Client ${client.id} disconnected`);

    // Remove from rooms
    for (const roomId in this.rooms) {
      this.rooms[roomId] = this.rooms[roomId].filter((id) => id !== client.id);
      client.to(roomId).emit('user-left', client.id);
      console.log(
        `[ROOM STATE] Room ${roomId} users after disconnect: ${this.rooms[roomId].join(', ')}`,
      );
    }
  }
}
