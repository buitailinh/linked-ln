import { ChatEntity } from './../../chat/entities/chat.entity';
import { FriendRequestEntity } from './friend-request.entity';
import { FeedPostEntity } from './../../feed/entities/feed.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.enum";
import { MessageEntity } from 'src/chat/entities/message.entity';

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column({ nullable: true })
    imagePath: string;

    @Column({ type: 'enum', enum: Role, default: Role.USER })
    role: Role;

    @OneToMany(() => FeedPostEntity, (feedPostEntity) => feedPostEntity.author)
    feedPosts: FeedPostEntity[];

    @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.creator)
    sentFriendRequests: FriendRequestEntity[];

    @OneToMany(() => FriendRequestEntity, (friendRequestEntity) => friendRequestEntity.receiver)
    receivedFriendRequests: FriendRequestEntity[];

    @ManyToMany(() => ChatEntity, (chatentity) => chatentity.users)
    chats: ChatEntity[];

    @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.user)
    messages: MessageEntity[];
}