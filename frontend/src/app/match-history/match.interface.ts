import { GameMode } from "../game/game.component";

export interface IMatch {
    id: number,
    player1Id: number,
    player2Id: number,
    winnerId: number,
    scorePlayer1: number,
    scorePlayer2: number,
    mode: GameMode
}