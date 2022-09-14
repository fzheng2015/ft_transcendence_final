import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from 'src/auth/auth.module';
import { Message } from 'src/message/message.entity';
import { User } from 'src/user/entities/user.entity';
import { ConversationController } from './conversation.controller';
import { Conversation } from './conversation.entity';
import { ConversationService } from './conversation.service';

@Module({
    imports: [TypeOrmModule.forFeature([Message, User, Conversation]), AuthModule],
    providers: [ConversationService],
    controllers: [ConversationController],
})
export class ConversationModule {}
