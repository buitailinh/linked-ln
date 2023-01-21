import { ChatEntity } from './chat.entity';
import { UserEntity } from './../../auth/models/user.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @ManyToOne(() => UserEntity, (userEntity) => userEntity.messages)
    user: UserEntity;

    @ManyToOne(() => ChatEntity, (chatEntity) => chatEntity.messages)
    conversation: ChatEntity;

    @CreateDateColumn()
    createdAt: Date;
}
