import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateConversationDto {

	@IsNumber()
	ownerId: number;

	@IsArray()
	otherIds: number[];
}

export class PostUserDto {
	@IsNumber()
	userId: number;
}

export class PostScopeDto {
	@IsString()
	scope: string;

	@IsString()
	password: string;
}

export class PostPasswordDto {
	@IsString()
	password: string;
}