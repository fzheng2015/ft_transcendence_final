import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import JwtAuthGuard from 'src/auth/jwt-auth.guard';
import { UserService } from 'src/user/user.service';
import { PongService, StatusesDto } from './pong.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('pong')
@Controller('pong')
export class PongController {

    constructor(
        private pongService: PongService,
        private userService: UserService
    ) { }

    // Returns the room name of an id if this user is playing, else an empty string
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    getRoomById(@Param('id', ParseIntPipe) id: number) {
        return this.pongService.getRoomById(id);
    }

    // Returns info on a given game room
    @Get('game/:room')
    @UseGuards(JwtAuthGuard)
    getUsers(@Param('room') room: string) {
        return this.pongService.getRoomInfo(room);
    }
}
