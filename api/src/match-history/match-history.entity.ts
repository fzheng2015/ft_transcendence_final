import { GameMode } from 'src/pong/pong.engine';
import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('match')
export class MatchEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    player1Id: number;

    @Column()
    player2Id: number;

    @Column()
    winnerId: number;

    @Column()
    scorePlayer1: number;

    @Column()
    scorePlayer2: number;

    @Column({
        type: 'enum',
        enum: GameMode,
        default: GameMode.NORMAL
      })
    mode: GameMode;
}
