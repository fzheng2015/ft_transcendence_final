import { Conversation } from "src/conversation/conversation.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 256})
    content: string;

    @Column()
    authorId: number;

	@ManyToOne(() => Conversation, (conversation) => conversation.messages)
	conversation: Conversation

    @Column()
    messageType: string;

    @Column()
    gameMode: string;

    @Column()
    inviteId: string;

    @Column()
    inviteState: string;
}