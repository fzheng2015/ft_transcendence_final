import { Controller, Get, Param, Body, Post, Delete, UseGuards, Req } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto, PostPasswordDto, PostScopeDto, PostUserDto } from './create-conversation.dto';
import { FindConvIdParams, FindUserIdParams } from 'src/find-one-param';
import JwtAuthGuard from 'src/auth/jwt-auth.guard';
import { UserIsSelfGuard } from 'src/auth/user-is-self.guard';
import ReqWithUser from 'src/auth/reqWithUser.interface';

@Controller('conversation')
export class ConversationController {
	constructor (private conversationService: ConversationService) {}

	@UseGuards(JwtAuthGuard)
	@Get('visible')
	async getVisibleConversations() {
		return this.conversationService.findVisibleConversations();
	}
	
    @UseGuards(JwtAuthGuard)
	@Get('open')
	async getOpenConversations(@Req() req: ReqWithUser) {
		return this.conversationService.findOpenConversations(req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get(':convId')
	async getOneConversation(@Param() params: FindConvIdParams) {
		return this.conversationService.findOneConversation(params.convId);
	}
	
    @UseGuards(JwtAuthGuard)
	@Post()
	async createConversation(@Body() createConversationDto: CreateConversationDto) {
		return this.conversationService.create(createConversationDto);
	}

    @UseGuards(JwtAuthGuard)
	@Post(':convId')
	async addUserToConversation(@Req() req: ReqWithUser, @Body() data: PostUserDto, @Param() params: FindConvIdParams) {
		return this.conversationService.editConversationUsers(req.user.id, params.convId, data.userId, 'addUser');
	}

    @UseGuards(JwtAuthGuard)
	@Post('kick/:convId')
	async kickUserFromConversation(@Req() req: ReqWithUser, @Body() data: PostUserDto, @Param() params: FindConvIdParams) {
		return this.conversationService.editConversationUsers(req.user.id, params.convId, data.userId, 'removeUser');
	}

    @UseGuards(JwtAuthGuard)
	@Post('mute/:convId')
	async muteUserInConversation(@Req() req: ReqWithUser, @Body() data: PostUserDto, @Param() params: FindConvIdParams) {
		return this.conversationService.editConversationUsers(req.user.id, params.convId, data.userId, 'muteUser');
	}

    @UseGuards(JwtAuthGuard)
	@Post('unmute/:convId')
	async unmuteUserInConversation(@Req() req: ReqWithUser, @Body() data: PostUserDto, @Param() params: FindConvIdParams) {
		return this.conversationService.editConversationUsers(req.user.id, params.convId, data.userId, 'unmuteUser');
	}

    @UseGuards(JwtAuthGuard)
	@Post('scope/:convId')
	async editScope(@Req() req: ReqWithUser, @Body() data: PostScopeDto, @Param() params: FindConvIdParams) {
		return this.conversationService.editConversationScope(req.user.id, params.convId, data.scope, data.password);
	}

    @UseGuards(JwtAuthGuard)
	@Post('admin/:convId')
	async addAdmin(@Req() req: ReqWithUser, @Body() data: PostUserDto, @Param() params: FindConvIdParams) {
		return this.conversationService.addAdmin(req.user.id, params.convId, data.userId);
	}

    @UseGuards(JwtAuthGuard)
	@Post('unadmin/:convId')
	async removeAdmin(@Req() req: ReqWithUser, @Body() data: PostUserDto, @Param() params: FindConvIdParams) {
		return this.conversationService.removeAdmin(req.user.id, params.convId, data.userId);
	}

    @UseGuards(JwtAuthGuard)
	@Post('owner/:convId')
	async changeConversationOwner(@Req() req: ReqWithUser, @Body() data: PostUserDto, @Param() params: FindConvIdParams) {
		return this.conversationService.changeConversationOwner(req.user.id, params.convId, data.userId);
	}

    @UseGuards(JwtAuthGuard)
	@Post('check/:convId')
	async checkPassword(@Body() data: PostPasswordDto, @Param() params: FindConvIdParams) {
		return this.conversationService.checkPassword(params.convId, data.password);
	}

    @UseGuards(JwtAuthGuard)
	@Delete(':id')
	async remove(@Req() req: ReqWithUser, @Param('id') id: number) {
		return this.conversationService.remove(req.user.id, id);
	}

}
