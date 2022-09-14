import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { GameInputs } from 'game-inputs'
import { GameService, GameState, IRoomInfo } from './game.service';
import { Subscription } from 'rxjs';
import { IUser } from '../user/user.interface';
import { UserService } from '../user/user.service';
import { Router, NavigationStart, NavigationEnd } from "@angular/router";

export enum GameMode {
	NORMAL,
	EASY,
	HARDCORE,
	DUAL
}

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {

	@ViewChild("game")
	private gameCanvas: ElementRef;
	private gameStateChange: Subscription;
	private lastState = GameState.NONE;
	private updateChange: Subscription;
	private roomChange: Subscription;
	private context: any;
	private gameInputs: GameInputs;
	private inputTimer: any;
	private goingUp: boolean = false;
	private goingDown: boolean = false;
	private mode = GameMode.NORMAL;
	roomInfo: { player1Id: number, player2Id: number } | null = null;
	player1: IUser | null = null;
	player2: IUser | null = null;

	// IMPORTANT : THIS MUST BE MATCHED WITH WHAT IS ON THE SERVER !
	private serverState = {
		paddle_height: 50,
		paddle_half_height: 25, // Update this too !
		paddle_width: 10,
		paddle1_pos_x: 40,
		paddle2_pos_x: 600,
		paddle_speed: 6,
		board_width: 640,
		board_height: 480,
		ball_speed: 6,
		ball_velocity_x: 0,
		ball_velocity_y: 0,
		ball2_velocity_x: 0,
		ball2_velocity_y: 0,
		ball1_active: true,
		ball2_active: false,
		ball_width: 10
	}

	constructor(
		private gameService: GameService,
		private authService: AuthService,
		private userService: UserService,
		private router: Router,
	) { }

	ngOnInit(): void { }

	ngAfterViewInit() {
		this.context = this.gameCanvas.nativeElement.getContext("2d");
		this.changeGameState(this.gameService.gameState)
		this.gameStateChange = this.gameService.gameStateChange.subscribe(gameState => {
			this.changeGameState(gameState)
		});
		this.updateRoomInfo(this.gameService.room);
		this.roomChange = this.gameService.roomChange.subscribe(room => {
			this.updateRoomInfo(room);

		});

		// Init inputs 
		this.gameInputs = new GameInputs(this.gameCanvas.nativeElement as HTMLElement, {
			preventDefaults: true,
			allowContextMenu: false,
			stopPropagation: false,
			disabled: false
		});
		this.gameInputs.bind('move-up', 'ArrowUp');
		this.gameInputs.bind('move-down', 'ArrowDown');

		this.gameInputs.down.on('move-up', () => { this.goingUp = true; });
		this.gameInputs.up.on('move-up', () => { this.goingUp = false; });
		this.gameInputs.down.on('move-down', () => { this.goingDown = true; });
		this.gameInputs.up.on('move-down', () => { this.goingDown = false; });
	};

	updateMode(mode: GameMode) {
		// IMPORTANT : THIS MUST BE MATCHED WITH WHAT IS ON THE SERVER !
		if (mode !== this.mode) {
			if (mode === GameMode.NORMAL) {
				this.serverState.paddle_height = 50;
				this.serverState.paddle_half_height = 25;
				this.serverState.ball_width = 10;
				this.serverState.ball2_active = false;
				this.serverState.ball_speed = 6;
			} else if (mode === GameMode.EASY) {
				this.serverState.paddle_height = 80;
				this.serverState.paddle_half_height = 40;
				this.serverState.ball_width = 20;
				this.serverState.ball2_active = false;
				this.serverState.ball_speed = 6;
			} else if (mode === GameMode.HARDCORE) {
				this.serverState.paddle_height = 30;
				this.serverState.paddle_half_height = 15;
				this.serverState.ball_width = 10;
				this.serverState.ball2_active = false;
				this.serverState.ball_speed = 8;
			} else if (mode === GameMode.DUAL) {
				this.serverState.paddle_height = 50;
				this.serverState.paddle_half_height = 25;
				this.serverState.ball_width = 10;
				this.serverState.ball2_active = true;
				this.serverState.ball_speed = 6;
			}
			this.mode = mode;
		}
	}

	changeGameState(gameState: GameState) {
		// Conditionnal states
		if (gameState === GameState.NONE) {
			this.stopListeningUpdates();
			this.stopInputStreaming();
			this.clearRoomInfo();
			this.drawNoGame();
		} else if (gameState === GameState.WAITING) {
			this.stopInputStreaming();
			this.drawWait();
		} else if (gameState === GameState.PLAYING) {
			this.startListeningUpdates();
			this.startInputStreaming();
		} else if (gameState === GameState.SPECTATING) {
			this.updateRoomInfo(this.gameService.room);
			this.startListeningUpdates();
			this.stopInputStreaming();
		} else if (gameState === GameState.END) {
			this.stopListeningUpdates();
			this.stopInputStreaming();
			this.clearRoomInfo();
		}
		// Transitions
		if (this.lastState === GameState.WAITING && gameState === GameState.PLAYING) {
			setTimeout(() => { this.drawCountdown(3); }, 100);
			setTimeout(() => { this.drawCountdown(2); }, 1000);
			setTimeout(() => { this.drawCountdown(1); }, 2000);
			setTimeout(() => { this.startInputStreaming(); }, 2800);
		}
		this.lastState = gameState;
	}

	drawNames() {
		if (this.player1 && this.player2) {
			this.context.fillStyle = "white";
			this.context.textAlign = "center";
			this.context.font = '20px mono';
			this.context.fillText(this.player1?.name, 100, 50);
			this.context.fillText(this.player2?.name, this.gameCanvas.nativeElement.width - 100, 50);
		}
	}

	drawScene(sharedGameState: any, mode: GameMode) {
		this.updateMode(mode);
		this.context.clearRect(
			0,
			0,
			this.gameCanvas.nativeElement.width,
			this.gameCanvas.nativeElement.height
		)
		this.context.fillStyle = "white";

		// draw Board
		this.context.strokeStyle = "white";
		this.context.lineWidth = 2;
		this.context.strokeRect(
			10, 10, this.gameCanvas.nativeElement.width - 20, this.gameCanvas.nativeElement.height - 20
		);
		for (let i = 0; i + 30 <= this.gameCanvas.nativeElement.height; i += 15) {
			this.context.fillRect(this.gameCanvas.nativeElement.width / 2 - 1, i + 10, 2, 10);
		}
		this.context.textAlign = "center";
		this.context.font = '20px mono';
		this.context.fillText(sharedGameState.paddle1_score, this.gameCanvas.nativeElement.width / 3, 50);
		this.context.fillText(sharedGameState.paddle2_score, this.gameCanvas.nativeElement.width * 2 / 3, 50);
		this.drawNames();
		// paddles
		this.context.fillRect(
			this.serverState.paddle1_pos_x - this.serverState.paddle_width / 2,
			sharedGameState.paddle1_pos_y - this.serverState.paddle_half_height,
			this.serverState.paddle_width,
			this.serverState.paddle_height);
		this.context.fillRect(
			this.serverState.paddle2_pos_x - this.serverState.paddle_width / 2,
			sharedGameState.paddle2_pos_y - this.serverState.paddle_half_height,
			this.serverState.paddle_width,
			this.serverState.paddle_height);
		// ball
		this.context.fillRect(
			sharedGameState.ball_pos_x - this.serverState.ball_width / 2,
			sharedGameState.ball_pos_y - this.serverState.ball_width / 2,
			this.serverState.ball_width,
			this.serverState.ball_width);
		if (mode === GameMode.DUAL) {
			this.context.fillRect(
				sharedGameState.ball2_pos_x - this.serverState.ball_width / 2,
				sharedGameState.ball2_pos_y - this.serverState.ball_width / 2,
				this.serverState.ball_width,
				this.serverState.ball_width);
		}
	}

	drawWait() {
		this.context.clearRect(
			0,
			0,
			this.gameCanvas.nativeElement.width,
			this.gameCanvas.nativeElement.height
		)
		this.context.fillStyle = "white";
		this.context.textAlign = "center";
		this.context.font = '32px mono';
		this.context.fillText('Waiting for opponent...', this.gameCanvas.nativeElement.width / 2, this.gameCanvas.nativeElement.height / 2 - 32);
		this.context.fillText("Don't quit !", this.gameCanvas.nativeElement.width / 2, this.gameCanvas.nativeElement.height / 2 + 32);
	}

	drawCountdown(n: number) {
		this.context.fillStyle = "white";
		this.context.beginPath();
		this.context.arc(this.gameCanvas.nativeElement.width / 2, this.gameCanvas.nativeElement.height / 2, 20, 0, 2 * Math.PI)
		this.context.fill();
		this.context.fillStyle = "black";
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.font = '30px mono';
		this.context.fillText(String(n), this.gameCanvas.nativeElement.width / 2, this.gameCanvas.nativeElement.height / 2);
	}

	drawNoGame() {
		this.context.clearRect(
			0,
			0,
			this.gameCanvas.nativeElement.width,
			this.gameCanvas.nativeElement.height
		)
		this.context.fillStyle = "white";
		this.context.textAlign = "center";
		this.context.font = '32px mono';
		this.context.fillText('No game playing !', this.gameCanvas.nativeElement.width / 2, this.gameCanvas.nativeElement.height / 2 - 32);
		this.context.fillText("Go to lobby !", this.gameCanvas.nativeElement.width / 2, this.gameCanvas.nativeElement.height / 2 + 32);
	}

	startListeningUpdates() {
		this.stopListeningUpdates();
		this.updateChange = this.gameService.updateChange.subscribe(sharedGameState => {
			this.drawScene(sharedGameState.state, sharedGameState.mode);
		});
	}

	stopListeningUpdates() {
		if (this.updateChange) {
			this.updateChange.unsubscribe();
		}
	}

	startInputStreaming() {
		this.stopInputStreaming();
		this.inputTimer = setInterval(() => {
			if (this.goingUp) { this.gameService.sendMovement('up') };
			if (this.goingDown) { this.gameService.sendMovement('down') };
		}, 1000 / 50);
	}

	stopInputStreaming() {
		this.goingUp = false;
		this.goingDown = false;
		if (this.inputTimer) {
			clearInterval(this.inputTimer);
		}
	}

	updateRoomInfo(room: string) {
		if (room) {
			this.gameService.getRoomInfo(room).subscribe((roomInfo: IRoomInfo) => {
				if (roomInfo) {
					this.userService.getUser(roomInfo?.player1Id).subscribe(user1 => {
						this.player1 = user1;
						this.userService.getUser(roomInfo?.player2Id).subscribe(user2 => {
							this.player2 = user2;
							this.drawNames();
						})
					});
				}
			});
		}
	}

	clearRoomInfo() {
		this.player1 = null;
		this.player2 = null;
	}

	ngOnDestroy(): void {
		if (this.gameStateChange) { this.gameStateChange.unsubscribe(); }
		if (this.updateChange) { this.updateChange.unsubscribe() };
		if (this.roomChange) { this.roomChange.unsubscribe() };
	}
}
