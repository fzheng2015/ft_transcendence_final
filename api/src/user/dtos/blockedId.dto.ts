import { IsInt } from 'class-validator';

export class BlockedIdDto {
    @IsInt()
    readonly blockedId: number;
}