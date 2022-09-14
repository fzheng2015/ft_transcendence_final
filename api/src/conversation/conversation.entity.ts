import { Message } from "src/message/message.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Conversation {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	ownerId: number;

	@Column("int", {array: true})
	admins: number[]

	@OneToMany(() => Message, (message) => message.conversation)
	messages: Message[]

	// users that have been in conversation at any point
	@ManyToMany(() => User)
	@JoinTable()
	users: User[]

	// users currently in conversation
	@Column("int", {array: true})
	userRegister: number[]

	@Column("int", {array: true})
	mutedUsers: number[]

	@Column()
	scope: string;

	@Column()
	name: string;

	@Column()
	passwordHash: string;
}