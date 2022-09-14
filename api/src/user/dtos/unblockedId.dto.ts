import { IsInt } from 'class-validator';

export class UnblockedIdDto {
    @IsInt()
    readonly unblockedId: number;
}