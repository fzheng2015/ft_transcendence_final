import { IsInt, IsString } from 'class-validator';

export class CreateMessageDto {

    @IsString()
    content: string;

    @IsInt()
	authorId: number;
}