import { GameMode } from "src/pong/pong.engine";

export class CreateMatchDto {
    readonly player1Id: number;
    readonly player2Id: number;
    readonly winnerId: number;
    readonly scorePlayer1: number;
    readonly scorePlayer2: number;
    readonly mode: GameMode;
}
