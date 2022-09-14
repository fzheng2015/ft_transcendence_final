import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GameMode } from 'src/pong/pong.engine';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { MatchEntity } from './match-history.entity';
import { CreateMatchDto } from './match.dto';
import { Match } from './match.interface';
import { IStats } from './stats.interface';

@Injectable()
export class MatchHistoryService {

    constructor(
        @InjectRepository(MatchEntity)
        private matchRepository: Repository<MatchEntity>,
        private userService: UserService,
    ) { }

    async addMatch(matchDto: CreateMatchDto) {
        const match = new MatchEntity();
        match.player1Id = matchDto.player1Id;
        match.player2Id = matchDto.player2Id;
        match.winnerId = matchDto.winnerId;
        match.scorePlayer1 = matchDto.scorePlayer1;
        match.scorePlayer2 = matchDto.scorePlayer2;
        match.mode = matchDto.mode;
        this.userService.updateWin(match.winnerId);
        return await this.matchRepository.save(match);
    }

    async getMatchHistory(id: number): Promise<MatchEntity[]> {
        return await this.matchRepository.find({
            where: [{ player1Id: id }, { player2Id: id }],
            order: { id: "DESC" }
        });
    }

    async getStats(id: number): Promise<IStats[]> {
        const matches = await this.matchRepository.find({ where: [{ player1Id: id }, { player2Id: id }] });
        let allStats = new Array<IStats>();
        for (let i=0; i < 4; i++) {
            let stats = new IStats();
            let matchMode = matches.filter(match => match.mode == i);
            stats.wins = matchMode.filter(match => match.winnerId == id).length;
            stats.losses = matchMode.length - stats.wins;
            stats.mode = i;
            allStats.push(stats);
        }
        return allStats;
    }
}
