import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateMessageDto } from "./create-message.dto";
import { Message } from "./message.entity";
import { Conversation } from "src/conversation/conversation.entity";

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private messageRepository: Repository<Message>,
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,
    ) { }

    async create(convId: number, body: CreateMessageDto): Promise<Message> {
        const message: Message = new Message();
        message.content = body.content;
        message.authorId = body.authorId;
        message.messageType = 'normal';
        message.gameMode = '';
        message.inviteId = '';
        message.inviteState = '';
        const conversation: Conversation = await this.conversationRepository.findOne({ where: { id: convId } });
        message.conversation = conversation;
        return await this.messageRepository.save(message);
    }

    async createInvite(convId: number, authorId: number, inviteId: string, mode: string) {
        const message: Message = new Message();
        message.content = "";
        message.authorId = authorId;
        message.messageType = 'invite';
        message.gameMode = mode;
        message.inviteId = inviteId;
        message.inviteState = 'waiting';
        const conversation: Conversation = await this.conversationRepository.findOne({ where: { id: convId } });
        message.conversation = conversation;
        return await this.messageRepository.save(message);
    }

    async updateInvite(inviteId: string, inviteState: string) {
        if (inviteId == '') { return; }
        let message = await this.messageRepository.findOne({ where: { inviteId: inviteId } });
        if (message) {
            message.inviteState = inviteState;
            await this.messageRepository.save(message)
        }
    }

}