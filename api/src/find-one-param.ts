import { IsNumber, IsNumberString } from "class-validator";

export class FindConvIdParams {
    @IsNumberString()
    convId: number;
}

export class FindUserIdParams {
    @IsNumberString()
    userId: number;
}