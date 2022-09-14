import { Body, Controller, UseGuards, Param, Post } from "@nestjs/common";
import { CreateMessageDto } from "./create-message.dto";
import { MessageService } from "./message.service";
import { FindConvIdParams } from "src/find-one-param";
import JwtAuthGuard from "src/auth/jwt-auth.guard";

@Controller('message')
export class MessageController {
    constructor (private messageService: MessageService) {}

    @UseGuards(JwtAuthGuard)
    @Post(':convId')
    async create(@Param() params: FindConvIdParams, @Body() createMessageDto: CreateMessageDto) {
        return await this.messageService.create(params.convId, createMessageDto);
    }

}