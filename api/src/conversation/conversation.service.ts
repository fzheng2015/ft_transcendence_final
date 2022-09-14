import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayContains, In, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Conversation } from './conversation.entity';
import { Message } from 'src/message/message.entity';
import { CreateConversationDto } from './create-conversation.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ConversationService {
	constructor(
		@InjectRepository(Conversation)
		private conversationRepository: Repository<Conversation>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
	) {}

	async create(body: CreateConversationDto): Promise<Conversation> {
		const conversation: Conversation = new Conversation();
		const owner: User = await this.userRepository.findOne({where: { id: body.ownerId }});
		conversation.users = [owner];
		conversation.userRegister = [body.ownerId];
		for (let id of body.otherIds) {
			let user: User = await this.userRepository.findOne({where: { id: id }});
			conversation.users.push(user);
			conversation.userRegister.push(user.id);
		}
		conversation.ownerId = body.ownerId;
		conversation.admins = [body.ownerId];
		conversation.mutedUsers = [];
		conversation.scope = 'private';
		conversation.name = 'new conversation';
		conversation.passwordHash = '';
		return await this.conversationRepository.save(conversation);
	}

	async checkPassword(convId: number, password: string): Promise<boolean> {
		const conversation: Conversation = await this.conversationRepository.findOne({where: {id: convId}});
		if (password == null)
			password = '';
		return await bcrypt.compare(password, conversation.passwordHash);
	}

	async findVisibleConversations(): Promise<Conversation[]> {
		return await this.conversationRepository.find({
			where: {
				scope: In(['public', 'protected']),
			}
		});
	}

	async findOneConversation(convId: number): Promise<Conversation[]> {
		return await this.conversationRepository.find({where: {id: convId}});
	}

	async findOpenConversations(userId: number): Promise<Conversation[]> {
		// here we're getting all conversations the user has been invited to
		let conversations: Conversation[] = await this.conversationRepository.find({
			relations: {
				users: true,
			},
			where: {
				userRegister: ArrayContains([userId])
			}
		});
		// here we need to reload the conversations or else we don't get the whole user list
		const convIds: number[] = [];
		conversations.forEach( conversation => convIds.push(conversation.id));
		conversations = await this.conversationRepository.find({
			relations: {
				users: true,
				messages: true,
			},
			where: {
				id: In(convIds),
			}
		});
		// filter messages from blocked users
		const user: User = await this.userRepository.findOne({where: {id: userId}});
		conversations.forEach( conversation => {
			conversation.messages = conversation.messages.filter( message => {
				return !user.blackList.includes(message.authorId)
			})
		});
		// add username in front of message, maybe not the best place to do this?
		conversations.forEach( conversation => conversation.messages.map( message => {
			let trailingName: string = conversation.users.find(user => user.id == message.authorId).name;
			message.content = trailingName + ' : ' + message.content;
		}));
		return conversations;
	}

	async remove(editorId:number, id: number): Promise<void> {
		const conv: Conversation | undefined = await this.conversationRepository.findOne({
			relations: {messages: true},
			where: {id: id}
		});
		let userIsOwner: boolean = editorId == conv.ownerId;
		if (!userIsOwner) {return}
		const messages: Message[] = conv.messages;
		messages.forEach( (message) => {
			this.messageRepository.delete(message.id);
		})
		await this.conversationRepository.delete(id);
  	}

	async editConversationUsers(editorId: number, convId: number, userId: number, mode: string) {
		const conversation: Conversation = (await this.conversationRepository.findOne({
			relations: {users: true},
			where: {id: convId},
		}));
		let userIsOwner: boolean = editorId == conversation.ownerId;
		let userIsAdmin: boolean = conversation.admins.includes(editorId);
		const user: User = (await this.userRepository.findOne({
			where: {id: userId}
		}));
		if (mode == 'addUser' && (userIsAdmin || userIsOwner || conversation.scope == 'public' || conversation.scope == 'protected')) {
			if (!conversation.userRegister.includes(user.id)) {
				conversation.users.push(user);
				conversation.userRegister.push(userId);
			}
		}
		else if (mode == 'removeUser' && (userIsAdmin || userIsOwner || editorId == userId)) {
			conversation.userRegister = conversation.userRegister.filter(
				tmp => tmp != user.id
			);
		}
		else if (mode == 'muteUser' && (userIsAdmin || userIsOwner)) {
			if (!conversation.mutedUsers.includes(userId)) {
				conversation.mutedUsers.push(userId);
			}
		}
		else if (mode == 'unmuteUser' && (userIsAdmin || userIsOwner)) {
			conversation.mutedUsers = conversation.mutedUsers.filter(
				tmp => tmp != userId
			);
		}
		return await this.conversationRepository.save(conversation);
	}

	async editConversationScope(editorId: number, convId: number, scope: string, password: string) {
		const conversation: Conversation = (await this.conversationRepository.findOne({
			where: {id: convId},
		}));
		let userIsOwner: boolean = editorId == conversation.ownerId;
		let userIsAdmin: boolean = conversation.admins.includes(editorId);
		if (!(userIsAdmin || userIsOwner)) {return}
		conversation.scope = scope;
		if (scope == 'protected') {
			const salt = await bcrypt.genSalt();
			conversation.passwordHash = await bcrypt.hash(password, salt);
		}
		return await this.conversationRepository.save(conversation);
	}

	async addAdmin(editorId:number, convId: number, userId: number) {
		const conversation: Conversation = (await this.conversationRepository.findOne({
			where: {id: convId},
		}));
		let userIsOwner: boolean = editorId == conversation.ownerId;
		let userIsAdmin: boolean = conversation.admins.includes(editorId);
		if (!(userIsAdmin || userIsOwner)) {return}
		if (!conversation.admins.includes(userId)) {
			conversation.admins.push(userId);
		}
		return await this.conversationRepository.save(conversation);
	}

	async removeAdmin(editorId:number, convId: number, userId: number) {
		const conversation: Conversation = (await this.conversationRepository.findOne({
			where: {id: convId},
		}));
		let userIsOwner: boolean = editorId == conversation.ownerId;
		let userIsAdmin: boolean = conversation.admins.includes(editorId);
		if (!(userIsAdmin || userIsOwner)) {return}
		conversation.admins = conversation.admins.filter( id => {
			return id != userId;
		});
		return await this.conversationRepository.save(conversation);
	}

	async changeConversationOwner(editorId:number, convId: number, userId: number) {
		const conversation: Conversation = (await this.conversationRepository.findOne({
			where: {id: convId},
		}));
		let userIsOwner: boolean = editorId == conversation.ownerId;
		if (!userIsOwner) {return}
		conversation.ownerId = userId;
		return await this.conversationRepository.save(conversation);
	}

}
