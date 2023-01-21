import { MessageEntity } from './message.entity';
import { UserEntity } from './../../auth/models/user.entity';
import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('conversation')
export class ChatEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => UserEntity)
    @JoinTable()
    users: UserEntity[];

    @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.conversation)
    messages: MessageEntity[];

    @UpdateDateColumn()
    lastUpdated: Date;
}
