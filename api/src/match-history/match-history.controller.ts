import { Controller, Get, Param, Post, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { MatchHistoryService } from './match-history.service';
import { CreateMatchDto } from './match.dto';
import { Match } from './match.interface';
import JwtAuthGuard from 'src/auth/jwt-auth.guard';

@Controller('history')
export class MatchHistoryController {

    constructor(private matchHistory: MatchHistoryService) { }

    // Gets all matches given a user id
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getMatchHistory(@Param('id', ParseIntPipe) id: number) {
        return this.matchHistory.getMatchHistory(id);
    }

    @Get('stats/:id')
    @UseGuards(JwtAuthGuard)
    getStats(@Param('id', ParseIntPipe) id: number) {
        return this.matchHistory.getStats(id);
    }
}
