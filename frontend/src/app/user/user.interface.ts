export interface IUser {
    id: number,
	blackList: number[],
    name: string,
    username42: string,
    friends: number[]
    avatar42Url: string,
    avatarId?: number,
    win?: number,
}