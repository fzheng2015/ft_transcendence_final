import { IUser } from "../user.interface";

export class CreateUserDto implements Omit <IUser, 'id'>{
    readonly name: string;
	readonly blackList: number[] = [];
    readonly username42: string;
    readonly friends: number[] = [];
    readonly avatar42Url: string;
    readonly email: string;
    readonly avatarId?: number;
}
