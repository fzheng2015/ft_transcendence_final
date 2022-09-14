import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { Subject } from 'rxjs';
import { MessageService } from 'src/message/message.service';
import { GameMode, PongEngine } from './pong.engine';
import { v4 } from 'uuid';
import { MatchHistoryService } from 'src/match-history/match-history.service';
import { CreateMatchDto } from 'src/match-history/match.dto';

const gameModeMap = new Map<string, GameMode>([
    ['normal', GameMode.NORMAL],
    ['easy', GameMode.EASY],
    ['hardcore', GameMode.HARDCORE],
    ['dual', GameMode.DUAL]]);

export class StatusesDto {
    connected = new Array<number>();
    playing = new Array<number>();
}

class PongGame {
    engine: PongEngine
    hasEnded: boolean
    room: string
    running: boolean
    player1Id: number
    player2Id: number
    player1SocketId: string
    player2SocketId: string

    constructor(player1Id: number, player2Id: number, player1SocketId: string, player2SocketId: string, mode: string) {
        this.engine = new PongEngine(gameModeMap.get(mode));
        this.hasEnded = false;
        this.room = v4();
        this.player1Id = player1Id;
        this.player2Id = player2Id;
        this.player1SocketId = player1SocketId;
        this.player2SocketId = player2SocketId;
        this.running = false;
    }
}

export class Invite {
    inviteId: string;
    hostSocketId: string;
    mode: string;
    hasRoom: string | undefined;

    constructor(hostSocketId: string, mode: string) {
        this.inviteId = v4();
        this.hostSocketId = hostSocketId;
        this.mode = mode;
        this.hasRoom = undefined;
    }
}

// Pong service has the job of running all games and managing waitlists and invites

@Injectable()
export class PongService {


    private usersMap: Map<string, number> = new Map; // Maps sockets ids to user ids
    private waitLists: Map<string, Set<string>> = new Map([
        ['normal', new Set()],
        ['easy', new Set()],
        ['hardcore', new Set()],
        ['dual', new Set()]]);
    private inviteList: Array<Invite> = new Array(); // Maps invite game id to socketId of host
    games: Array<PongGame> = [];
    updateChange: Subject<any> = new Subject<any>();
    startChange: Subject<any> = new Subject<any>();
    endChange: Subject<any> = new Subject<any>();
    doubleConnectionGame: Subject<any> = new Subject<any>();
    statusChange: Subject<any> = new Subject<any>();
    inviteExistsChange: Subject<any> = new Subject<any>();
    inviteStatusChange: Subject<any> = new Subject<any>();
    pointsToWin: number = 3;

    constructor(
        private matchHistory: MatchHistoryService,
        private messageService: MessageService,
    ) { }

    @Interval(1000 / 60)
    updateGames() {
        for (let game of this.games) {
            if (game.running) {
                game.engine.update();
                let sharedState = game.engine.getSharedState();
                if (sharedState.paddle1_score >= this.pointsToWin
                    || sharedState.paddle2_score >= this.pointsToWin) {
                    if (game.engine.mode !== GameMode.DUAL) {
                        game.hasEnded = true;
                    } else if (game.engine.mode === GameMode.DUAL
                        && Math.abs(sharedState.paddle1_score - sharedState.paddle2_score) > 1) {
                        game.hasEnded = true;
                    }
                }
                this.updateChange.next({ state: game.engine.getSharedState(), room: game.room, mode: game.engine.mode });
            }
        }
        this.endGames();
    }

    endGames() {
        for (let gameToEnd of this.games) {
            if (gameToEnd.hasEnded) {
                this.endChange.next({
                    room: gameToEnd.room,
                    player1Id: gameToEnd.player1Id,
                    player2Id: gameToEnd.player2Id,
                    scorePlayer1: gameToEnd.engine.getSharedState().paddle1_score,
                    scorePlayer2: gameToEnd.engine.getSharedState().paddle2_score,
                });
                this.addToMatchHistory(gameToEnd)
                this.sendStatusChange();
                let invite = this.inviteList.find(invite => { return invite.hasRoom == gameToEnd.room });
                if (invite) {
                    this.updateInviteStatus(invite.inviteId, "expired")
                    this.inviteList = this.inviteList.filter(invite => { return invite.hasRoom != gameToEnd.room });
                }
            }
        }
        this.games = this.games.filter(game => { return game.hasEnded === false });
    }

    quitGames(socketId: string) {
        for (let gameToEnd of this.games) {
            if (gameToEnd.player1SocketId === socketId || gameToEnd.player2SocketId === socketId) {
                gameToEnd.hasEnded = true;
                this.endChange.next({
                    room: gameToEnd.room,
                    player1Id: gameToEnd.player1Id,
                    player2Id: gameToEnd.player2Id,
                    scorePlayer1: (socketId === gameToEnd.player1SocketId ? 0 : this.pointsToWin),
                    scorePlayer2: (socketId === gameToEnd.player2SocketId ? 0 : this.pointsToWin),
                });
                if (gameToEnd.player1SocketId == socketId) {
                    gameToEnd.engine.sharedState.paddle1_score = 0;
                    gameToEnd.engine.sharedState.paddle2_score = this.pointsToWin;
                } else {
                    gameToEnd.engine.sharedState.paddle1_score = this.pointsToWin;
                    gameToEnd.engine.sharedState.paddle2_score = 0;
                }
                this.addToMatchHistory(gameToEnd);
                let invite = this.inviteList.find(invite => { return invite.hasRoom == gameToEnd.room });
                if (invite) {
                    this.updateInviteStatus(invite.inviteId, "expired")
                    this.inviteList = this.inviteList.filter(invite => { return invite.hasRoom != gameToEnd.room });
                }
            }
        }
        this.games = this.games.filter(game => { return game.hasEnded === false });
        this.sendStatusChange();
    }

    receiveMovement(direction: string, socketId: string) {
        let game = this.games.find(game => { return game.player1SocketId === socketId || game.player2SocketId === socketId });
        if (game) {
            let playerNumber = game.player1SocketId == socketId ? 1 : 2;
            game.engine.receiveMovement(direction, playerNumber);
        }
    }

    connect(socketId: string) {
        this.usersMap.set(socketId, -1);
    }

    disconnect(socketId: string) {
        let gameToEnd = this.isInGame(socketId);
        if (gameToEnd) {
            this.endChange.next({
                room: gameToEnd.room,
                player1Id: gameToEnd.player1Id,
                player2Id: gameToEnd.player2Id,
                scorePlayer1: (socketId === gameToEnd.player1SocketId ? 0 : this.pointsToWin),
                scorePlayer2: (socketId === gameToEnd.player2SocketId ? 0 : this.pointsToWin),
            });
            if (gameToEnd.player1SocketId == socketId) {
                gameToEnd.engine.sharedState.paddle1_score = 0;
                gameToEnd.engine.sharedState.paddle2_score = this.pointsToWin;
            } else {
                gameToEnd.engine.sharedState.paddle1_score = this.pointsToWin;
                gameToEnd.engine.sharedState.paddle2_score = 0;
            }
            let invite = this.inviteList.find(invite => { return invite.hasRoom == gameToEnd.room });
            if (invite) {
                this.updateInviteStatus(invite.inviteId, "expired")
                this.inviteList = this.inviteList.filter(invite => { return invite.hasRoom != gameToEnd.room });
            }
            this.addToMatchHistory(gameToEnd);
            this.games = this.games.filter(game => { return game !== gameToEnd });
        }
        this.quitWaitList(socketId);
        this.quitInvite(socketId);
        this.usersMap.delete(socketId);
    }

    identification(userId: number, socketId: string) {
        this.usersMap.set(socketId, userId);
        this.sendStatusChange();
    }

    joinWaitList(socketId: string, gameParams: any) {
        if (!this.isInWaitList(socketId)) {
            this.waitLists.get(gameParams.mode).add(socketId);
            this.checkForNewGames();
        }
    }

    quitWaitList(socketId: string) {
        for (let waitlist of this.waitLists.values()) {
            if (waitlist.has(socketId)) {
                waitlist.delete(socketId);
                break;
            }
        }
        let inviteToClose = this.inviteList.find(invite => { return invite.hostSocketId == socketId });
        if (inviteToClose) {
            this.updateInviteStatus(inviteToClose.inviteId, 'expired')
            this.inviteList = this.inviteList.filter(invite => { return invite.inviteId != inviteToClose.inviteId });
        }
    }

    createInvite(socketId: string, convId: number, authorId: number, mode: string) {
        if (!this.isInGame(socketId) && !this.isInWaitList(socketId) && !this.isInInviteList(socketId)) {
            let invite = new Invite(socketId, mode);
            this.inviteList.push(invite);
            this.messageService.createInvite(convId, authorId, invite.inviteId, mode);
        }
    }

    joinInvite(socketId: string, inviteId: string) {
        let invite = this.inviteList.find(invite => { return invite.inviteId == inviteId });
        if (invite != undefined) {
            // If the invite is waiting
            if (invite.hasRoom != undefined) {
                this.inviteExistsChange.next({ room: invite.hasRoom, socketId: socketId });
                return;
            }
            if (this.usersMap.get(socketId) == this.usersMap.get(invite.hostSocketId)) {
                this.updateInviteStatus(invite.inviteId, "expired")
                this.inviteList = this.inviteList.filter(anInvite => { return anInvite.hostSocketId != invite.hostSocketId });
                this.doubleConnectionGame.next({ socketId: socketId, socketId2: invite.hostSocketId });
                return
            }
            let player1SocketId = invite.hostSocketId;
            let player2SocketId = socketId;
            let player1Id = this.usersMap.get(player1SocketId);
            let player2Id = this.usersMap.get(player2SocketId);
            let room = this.createNewGame(player1SocketId, player2SocketId, player1Id, player2Id, invite.mode);
            invite.hasRoom = room;
            this.updateInviteStatus(invite.inviteId, "playing")
        }
    }

    quitInvite(socketId: string) {
        let invite = this.inviteList.find(invite => { return invite.hostSocketId == socketId });
        if (invite) {
            this.updateInviteStatus(invite.inviteId, "expired")
            this.inviteList = this.inviteList.filter(invite => { return invite.hostSocketId != socketId });
        }
    }

    checkForNewGames() {
        for (let waitlistKeyValue of this.waitLists) {
            let mode = waitlistKeyValue[0];
            let waitlist = waitlistKeyValue[1];
            while (waitlist.size > 1 && waitlist.size % 2 === 0) {
                let [socketId1] = waitlist;
                waitlist.delete(socketId1);
                let [socketId2] = waitlist;
                waitlist.delete(socketId2);
                let userId1 = this.usersMap.get(socketId1);
                let userId2 = this.usersMap.get(socketId2);
                if (userId1 === userId2) {
                    this.doubleConnectionGame.next({ socketId1: socketId1, socketId2: socketId2 });
                    continue;
                }
                this.createNewGame(socketId1, socketId2, userId1, userId2, mode);
            }
        }
    }

    createNewGame(socketId1: string, socketId2: string, userId1: number, userId2: number, mode: string) {
        let game = new PongGame(userId1, userId2, socketId1, socketId2, mode);
        this.games.push(game);
        game.engine.reset(); // To start by resetting settings for consistency
        this.startChange.next({ socket1: socketId1, socket2: socketId2, room: game.room, player1Id: game.player1Id, player2Id: game.player2Id });
        this.updateChange.next({ state: game.engine.getSharedState(), room: game.room, mode: game.engine.mode });
        setTimeout(() => {
            game.running = true;
        }, 3000)
        this.sendStatusChange()
        return game.room;
    }

    isInGame(socketId: string) {
        return this.games.find((game) => { return game.player1SocketId === socketId || game.player2SocketId === socketId });
    }

    isPlaying(socketId: string) {
        return this.isInGame(socketId) !== undefined;
    }

    isInWaitList(socketId: string) {
        for (let waitlist of this.waitLists.values()) {
            if (waitlist.has(socketId)) {
                return true;
            }
        }
        return false;
    }

    isInInviteList(socketId: string) {
        return this.inviteList.find(invite => { return invite.hostSocketId === socketId }) !== undefined;
    }

    inviteExists(inviteId: string) {
        let invite = this.inviteList.find(invite => { return invite.inviteId = inviteId });
        if (invite) {
            return true;
        } else {
            return false;
        }
    }

    updateInviteStatus(inviteId: string, inviteStatus: string) {
        this.messageService.updateInvite(inviteId, inviteStatus);
        this.inviteStatusChange.next(true);
    }

    sendStatusChange() {
        let connected = [... this.usersMap.values()];
        let playing: Array<number> = [];
        for (let game of this.games) {
            playing.push(game.player1Id);
            playing.push(game.player2Id);
        }
        this.statusChange.next({ connected: connected, playing: playing })
    }

    getRoomById(id: number) {
        let game = this.games.find(game => { return game.player1Id === id || game.player2Id === id });
        if (game) {
            return game.room;
        } else {
            return '';
        }
    }

    getRoomInfo(room: string) {
        let game = this.games.find(game => { return game.room === room });
        if (game) {
            return { player1Id: game.player1Id, player2Id: game.player2Id };
        }
        return null;
    }

    getStatuses() {
        let connected = [... this.usersMap.values()];
        let playing: Array<number> = [];
        for (let game of this.games) {
            playing.push(game.player1Id);
            playing.push(game.player2Id);
        }
        return { connected: connected, playing: playing };
    }

    addToMatchHistory(game: PongGame) {
        let matchDto: CreateMatchDto;
        matchDto = {
            player1Id: game.player1Id,
            player2Id: game.player2Id,
            scorePlayer1: game.engine.sharedState.paddle1_score,
            scorePlayer2: game.engine.sharedState.paddle2_score,
            winnerId: game.engine.sharedState.paddle1_score > game.engine.sharedState.paddle2_score ? game.player1Id : game.player2Id,
            mode: game.engine.mode
        };
        this.matchHistory.addMatch(matchDto);
    }
}
