import { HttpClient } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";
import { Observable, Subject, of } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { NotificationService } from "../notification/notification.service";
import { IUser } from "../user/user.interface";
import { UserService } from "../user/user.service";
import { SocketPong } from "./game.socket";
import { GameEndComponent } from './game-end.component';
import { MatDialog } from '@angular/material/dialog';
import { IMatch } from "../match-history/match.interface";
import { Subscription } from 'rxjs';
import { environment } from "src/environments/environment";
import { GameMode } from "./game.component";

const apiUrl = environment.BACKEND_URL_API + 'pong/'

export enum GameState {
    NONE,
    WAITING,
    PLAYING,
    SPECTATING,
    END
}

export interface StatusesDto {
    connected: Array<number>;
    playing: Array<number>;
}

export interface IRoomInfo {
    player1Id: number
    player2Id: number
}

@Injectable({
    providedIn: 'root'
})
export class GameService {

    public gameState: GameState;
    public room: string;
    updateChange = new Subject<any>();
    gameStateChange = new Subject<GameState>();
    roomChange = new Subject<string>();
    statusChange = new Subject<StatusesDto>();
    routeChange: Subscription;
    matchResult: IMatch = {
        id: 0,
        player1Id: 0,
        player2Id: 0,
        winnerId: 0,
        scorePlayer1: 0,
        scorePlayer2: 0,
        mode: GameMode.NORMAL
    };

    constructor(
        private authService: AuthService,
        private http: HttpClient,
        private router: Router,
        private matDialog: MatDialog,
        private notification: NotificationService,
        private userService: UserService,
        private socket: SocketPong
    ) {
        this.updateGameState(GameState.NONE);

        this.authService.logChange.subscribe((logChange) => {
            if (logChange.previous != -1 && logChange.next != logChange.previous) {
                this.socket.disconnect();
            }
            // console.log("Socket is connected : " + this.socket.disconnect().connected)
            if (logChange.next != -1) {
                this.socket.connect();
            }
        })

        this.routeChange = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (event.url !== '/game' && this.gameState === GameState.PLAYING) {
                    this.quitGame();
                    this.updateGameState(GameState.NONE);
                }
                if (event.url !== '/game' && this.gameState === GameState.SPECTATING) {
                    this.quitSpectate(this.room);
                    this.updateRoom('');
                    this.updateGameState(GameState.NONE);
                }
                if (event.url !== '/game' && this.gameState === GameState.WAITING) {
                    this.quitWaitlist();
                    this.updateRoom('');
                }
            }
        })

        this.socket.on('start-play', (start: any) => {
            if (this.gameState === GameState.WAITING) {
                this.updateGameState(GameState.PLAYING);
                this.updateRoom(start.room);
            } else {
                this.notification.notify("You can't start playing !");
            }
        });

        this.socket.on('update', (sharedGameState: any) => {
            this.updateChange.next(sharedGameState);
        });

        this.socket.on('double-connection', (res: any) => {
            this.notification.notify("Error: double connection to game is not allowed !");
            this.router.navigate(['/lobby']);
        })

        this.socket.on('end-play', (res: any) => {
            if (this.gameState === GameState.PLAYING || this.gameState === GameState.SPECTATING) {
                this.updateGameState(GameState.END);
                this.setMatchRes(res);
                this.matDialog.open(GameEndComponent);
                this.updateGameState(GameState.NONE);
            } else {
                this.notification.notify("You can't quit game");
            }
        });

        this.socket.on('status-change', (statuses: StatusesDto) => {
            this.statusChange.next(statuses);
        })

        this.socket.on('expired-game', () => {
            this.notification.notify('This game has expired.', '', '', 3000);
            this.updateGameState(GameState.NONE);
        });

        this.socket.on('force-spectate', (message: {room: string}) => {
            this.updateRoom(message.room);
            this.updateGameState(GameState.SPECTATING);
        })
    }

    quitGame() {
        this.socket.emit('quit-game', {});
    }

    setMatchRes(res: any) {
        this.matchResult.id = res.room;
        this.matchResult.player1Id = res.player1Id;
        this.matchResult.player2Id = res.player2Id;
        this.matchResult.scorePlayer1 = res.scorePlayer1;
        this.matchResult.scorePlayer2 = res.scorePlayer2;
        this.matchResult.mode = res.mode;
        if (res.scorePlayer1 > res.scorePlayer2) {
            this.matchResult.winnerId = this.matchResult.player1Id;
        }
        else {
            this.matchResult.winnerId = this.matchResult.player2Id;
        }
    }

    getFinalScore(): Observable<IMatch> {
        return of(this.matchResult);
    }

    joinWaitlist(mode: string) {
        if (this.gameState === GameState.NONE) {
            this.router.navigate(['/game']);
            this.updateGameState(GameState.WAITING);
            this.socket.emit('join-waitlist', { mode: mode });

        } else {
            this.notification.notify("You can't join the waitlist !");
        }
    }

    quitWaitlist() {
        if (this.gameState === GameState.WAITING) {
            this.socket.emit('quit-waitlist', {});
            this.updateGameState(GameState.NONE);
        } else {
            this.notification.notify("You can't quit the waitlist !");
        }
    }

    joinSpectate(room: string) {
        if (this.gameState === GameState.NONE) {
            this.router.navigate(['/game']);
            this.socket.emit('join-spectate', { room: room });
            this.updateGameState(GameState.SPECTATING);
            this.updateRoom(room);
        } else if (this.gameState === GameState.SPECTATING) {
            this.quitSpectate(this.room);
            this.router.navigate(['/game']);
            this.socket.emit('join-spectate', { room: room });
            this.updateGameState(GameState.SPECTATING);
            this.updateRoom(room);
        } else {
            this.notification.notify("You can't spectate !");
        }
    }

    quitSpectate(room: string) {
        if (this.gameState === GameState.SPECTATING) {
            this.socket.emit('quit-spectate', { room: room });
            this.updateGameState(GameState.NONE);
        } else {
            this.notification.notify("You can't quit spectating !");
        }
    }

    createInvite(convId: number, authorId: number, mode: string) {
        if (this.gameState === GameState.NONE) {
            this.router.navigate(['/game']);
            this.socket.emit('create-invite', { convId: convId, authorId: authorId, mode: mode });
            this.updateGameState(GameState.WAITING);
        } else {
            this.notification.notify("You can't create an invite !");
        }
    }

    joinInvite(inviteId: string) {
        if (this.gameState === GameState.NONE) {
            this.socket.emit('join-invite', { inviteId: inviteId });
            this.updateGameState(GameState.WAITING);
            this.router.navigate(['/game']);
        } else {
            this.notification.notify("You can't join an invite !")
        }
    }

    sendMovement(direction: string) {
        if (this.gameState === GameState.PLAYING) {
            this.socket.emit('move', direction);
        } else {
            this.notification.notify("You can't send your inputs !");
        }
    }

    updateGameState(gameState: GameState) {
        this.gameState = gameState;
        this.gameStateChange.next(this.gameState);
    }

    updateRoom(room: string) {
        this.room = room;
        this.roomChange.next(this.room);
    }

    getRoomById(userId: number): Observable<string> {
        return this.http.get(apiUrl + String(userId), { responseType: 'text' });
    }

    getRoomInfo(room: string) {
        return this.http.get<IRoomInfo>(apiUrl + 'game/' + room);
    }

    requestStatusChange() {
        this.socket.emit('status-change-request', {});
    }

}  