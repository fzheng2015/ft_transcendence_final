import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Conversation } from "src/conversation/conversation.entity";
import { User } from "src/user/entities/user.entity";
import { MessageController } from "./message.controller";
import { Message } from "./message.entity";
import { MessageService } from "./message.service";

@Module({
    imports: [TypeOrmModule.forFeature([Message, User, Conversation])],
    providers: [MessageService],
    exports: [MessageService],
    controllers: [MessageController],
})
export class MessageModule {}