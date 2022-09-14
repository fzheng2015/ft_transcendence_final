import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { PongService } from './pong/pong.service';
import { Subscription } from 'rxjs';
import { sources } from 'webpack';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';

@WebSocketGateway({
	namespace: 'pong',
	transports: 'websocket',
	cors: {
		credentials: true,
		origin: /http:\/\/.+:4200/i,
	  }	
})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('pongGateway');
	private updateSubscription: Subscription;
	private startSubscription: Subscription;
	private endSubscription: Subscription;
	private doubleConnectionSubscription: Subscription;
	private statusChangeSubscription: Subscription;
	private inviteExistsChangeSubscription: Subscription;

	constructor(
		private pongService: PongService,
		private userService: UserService,
		private authService: AuthService
	) { }

	afterInit() {
		this.updateSubscription = this.pongService.updateChange.subscribe(update => {
			this.server.to(update.room).emit('update', update);
		})
		this.startSubscription = this.pongService.startChange.subscribe(start => {
			this.startGame(start.room, start.socket1, start.socket2, start.player1Id, start.player2Id);
		});
		this.endSubscription = this.pongService.endChange.subscribe(end => {
			this.endGame(end.room, end.player1Id, end.player2Id, end.scorePlayer1, end.scorePlayer2);
		})
		this.doubleConnectionSubscription = this.pongService.doubleConnectionGame.subscribe((data: {socketId1: string, socketId2: string}) => {
			this.server.to(data.socketId1).to(data.socketId2).emit('double-connection', {});
		})
		this.statusChangeSubscription = this.pongService.statusChange.subscribe((statuses) => {
			this.server.emit('status-change', statuses);
		})
		this.inviteExistsChangeSubscription = this.pongService.inviteExistsChange.subscribe((inviteExists) => {
			this.server.in(inviteExists.socketId).socketsJoin(inviteExists.room);
			this.server.to(inviteExists.socketId).emit('force-spectate', {room: inviteExists.room});
		})
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

	handleDisconnect(socket: Socket) {
		this.pongService.disconnect(socket.id);
		this.logger.log(socket.id + " disconnected");
	}

	@SubscribeMessage('quit-game')
	handleQuitGame(@ConnectedSocket() socket: Socket) {
		this.pongService.quitGames(socket.id);
	}

	@SubscribeMessage('join-waitlist')
	handleJoinWaitlist(@ConnectedSocket() socket: Socket, @MessageBody() gameParams: any) {
		this.pongService.joinWaitList(socket.id, gameParams);
	}

	@SubscribeMessage('quit-waitlist')
	handleQuitWaitList(@ConnectedSocket() socket: Socket) {
		this.pongService.quitWaitList(socket.id);
	}

	@SubscribeMessage('join-spectate')
	async handleJoinSpectate(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
		if (this.pongService.getRoomInfo(message.room) != null) {
			socket.join([message.room]);
		} else {
			socket.emit('expired-game', {});
		}
	}

	@SubscribeMessage('quit-spectate')
	handleQuitSpectate(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
		socket.leave(message.room);
	}

	@SubscribeMessage('create-invite')
	handleCreateInvite(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
		this.pongService.createInvite(socket.id, message.convId, message.authorId, message.mode);
	}

	@SubscribeMessage('join-invite')
	handleJoinInvite(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
		if (this.pongService.inviteExists(message.inviteId)) {
			this.pongService.joinInvite(socket.id, message.inviteId);
		} else {
			socket.emit('expired-game', {});
		}
	}

	@SubscribeMessage('move')
	handleMove(
		@MessageBody() direction: string,
		@ConnectedSocket() socket: Socket,
	) {
		this.pongService.receiveMovement(direction, socket.id);
	}

	@SubscribeMessage('status-change-request')
	handleStatusChangeRequest(
		@ConnectedSocket() socket: Socket
	) {
		socket.emit('status-change', this.pongService.getStatuses())
	}

	startGame(room: string, socket1: string, socket2: string, player1Id: number, player2Id: number) {
		this.server.in(socket1).socketsJoin(room);
		this.server.in(socket2).socketsJoin(room);
		this.server.to(room).emit('start-play', { room: room });
	}

	endGame(room: string, player1Id: number, player2Id: number, scorePlayer1: number, scorePlayer2: number) {
		this.server.to(room).emit('end-play', {
			room: room,
			player1Id: player1Id,
			player2Id: player2Id,
			scorePlayer1: scorePlayer1,
			scorePlayer2: scorePlayer2,
		});
	}
}
