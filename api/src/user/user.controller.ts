import { HttpException, HttpStatus, Controller, Get, Post, Body, Param, Delete, MaxFileSizeValidator, FileTypeValidator, ParseFilePipe, ParseIntPipe, UseInterceptors, UploadedFile, UseGuards, Query, ParseArrayPipe, Req } from '@nestjs/common';
import { CreateUserDto } from './dtos/create_user.dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import JwtAuthGuard from 'src/auth/jwt-auth.guard';
import { UpdateNameDto } from './dtos/update_name.dto';
import { UserIsSelfGuard } from 'src/auth/user-is-self.guard';
import ReqWithUser from 'src/auth/reqWithUser.interface';
import { BlockedIdDto } from './dtos/blockedId.dto';
import { UnblockedIdDto } from './dtos/unblockedId.dto';

@Controller('user')
export class UserController {

    constructor(private userService: UserService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getUsers() {
        return await this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('name/:userId')
    async getNameById(@Param('userId', ParseIntPipe) userId: number) {
        return await this.userService.findUserNameById(userId);
    }

    // Get some users using an array of ids
    @Get('some')
    @UseGuards(JwtAuthGuard)
    async findSome(@Query('ids', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]) {
        return await this.userService.findSome(ids);
    }

    @Post('dummy')
    async create_dummies() {
        return await this.userService.createRandomUser();
    }
    
    @Get('ladderList')
    @UseGuards(JwtAuthGuard)
    async getLadderList() {
        return await this.userService.getLadderList();
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.findOne(id);
    }

    @Get(':id/friends')
    @UseGuards(JwtAuthGuard)
    async findFriends(@Param('id', ParseIntPipe) id: number) {
        return await this.userService.findFriends(id);
    }

    @Post(':id/friends/:friend_id')
    @UseGuards(UserIsSelfGuard)
    @UseGuards(JwtAuthGuard)
    async addFriend(@Param('id', ParseIntPipe) id: number, @Param('friend_id', ParseIntPipe) friendId: number) {
        await this.userService.addFriend(id, friendId);
    }

    @Delete(':id/friends/:friend_id')
    @UseGuards(UserIsSelfGuard)
    @UseGuards(JwtAuthGuard)
    async removeFriend(@Param('id', ParseIntPipe) id: number, @Param('friend_id', ParseIntPipe) friendId: number) {
        await this.userService.removeFriend(id, friendId);
    }

    @Post('block')
    @UseGuards(JwtAuthGuard)
    async blockUser(@Req() req: ReqWithUser, @Body() { blockedId }: BlockedIdDto) {
        await this.userService.blockUser(blockedId, req.user.id);
    }

    @Post('unblock')
    @UseGuards(JwtAuthGuard)
    async unBlockUser(@Req() req: ReqWithUser, @Body() { unblockedId }: UnblockedIdDto) {
        await this.userService.unblockUser(unblockedId, req.user.id);
    }

    @Post(':id/name')
    @UseGuards(UserIsSelfGuard)
    @UseGuards(JwtAuthGuard)
    async updateName(@Param('id', ParseIntPipe) id: number, @Body() updateNameDto: UpdateNameDto) {
        let result = await this.userService.updateName(id, updateNameDto);
        if (result) {
            return result
        } else {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }
    }

    @Post(':id/avatar')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async addAvatar(@Req() req: ReqWithUser, @UploadedFile(
        new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1_000_000 }),
                new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
            ]
        })
    ) file: Express.Multer.File) {
        return await this.userService.addAvatar(req.user.id, file.buffer, file.originalname);
    }

}
