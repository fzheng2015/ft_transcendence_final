export interface IUser {
    id: number,
    name: string,
	blackList: number[],
    username42: string,
    friends: number[]
    avatar42Url: string,
    avatarId?: number
}