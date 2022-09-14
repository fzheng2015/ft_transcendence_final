import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { PongService } from './pong/pong.service';
import { Subscription } from 'rxjs';

@WebSocketGateway({
  namespace: 'chat',
  transports: 'websocket',
  cors: {
    credentials: true,
    origin: /http:\/\/.+:4200/i,
  }
})
export class ChatboxGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

  inviteStatusChangeSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private pongService: PongService
  ) { }

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  @SubscribeMessage('notify')
  handleMessage(client: Socket, convId: number): void {
    this.server.emit('update');
  }

  afterInit(server: Server) {
    this.inviteStatusChangeSubscription = this.pongService.inviteStatusChange.subscribe(value => {
      this.server.emit('update');
    })
  }

  handleDisconnect(socket: Socket) {
    this.pongService.disconnect(socket.id);
    this.logger.log(socket.id + " disconnected");
  }

  async handleConnection(socket: Socket) {
    try {
      let cookies = socket.handshake.headers.cookie;
      let token = cookies.match(/(?<=Authentication=)([A-Za-z\d.\-_]*)/gi);
      const payload = this.authService.verify(token[0]);
      const user = await this.userService.findOne(payload.userId);
      if (!user) {
        socket.disconnect();
      } else {
        this.pongService.identification(user.id, socket.id);
        this.logger.log("User " + user.id + " (" + socket.id + ") connected");
      }
    } catch (err) {
      socket.disconnect();
    }
  }

}
