import { IsString } from 'class-validator';

export class UpdateNameDto {
    @IsString()
    readonly name: string;
}