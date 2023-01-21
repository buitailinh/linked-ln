import { ActiveConversation } from './dto/active-conversation.interface';
import { Chat } from './dto/chat.interface';
import { Observable, from, map, mergeMap, of, switchMap, take } from 'rxjs';
import { MessageEntity } from './entities/message.entity';
import { ActiveConversationEntity } from './entities/active-conversation.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatEntity } from './entities/chat.entity';
import { DeleteResult, Repository } from 'typeorm';
import { User } from 'src/auth/models/user.class';
import { Message } from './dto/message.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,

    @InjectRepository(ActiveConversationEntity)
    private readonly activeConversationRepository: Repository<ActiveConversationEntity>,

    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) { }

  getConversation(creatorId: number, friendId: number): Observable<Chat | undefined> {
    return from(
      this.chatRepository.createQueryBuilder('conversation')
        .leftJoin('conversation.users', 'user')
        .where('user.id = :creatorId', { creatorId })
        .orWhere('user.id = :friendId', { friendId })
        .groupBy('conversation.id')
        .having('COUNT(*) > 1')
        .getOne()
    ).pipe(map((chat: Chat) => chat || undefined))
  }

  creatConversation(creator: User, friend: User): Observable<Chat> {
    return this.getConversation(creator.id, friend.id).pipe(
      switchMap((chat: Chat) => {
        const doesConversationExit = !!chat;
        if (!doesConversationExit) {
          const newConversation: Chat = {
            users: [creator, friend]
          }
          return from(this.chatRepository.save(newConversation));
        }
        return of(chat);
      }),
    );
  }

  getConversationForUser(userId: number): Observable<Chat[]> {
    return from(
      this.chatRepository.createQueryBuilder('conversation')
        .leftJoin('conversation.users', 'user')
        .where('user.id = :userId', { userId })
        .orderBy('conversation.lastUpdated', 'DESC')
        .getMany()
    )
  }

  getUsersInConversation(conversationId: number): Observable<Chat[]> {
    return from(
      this.chatRepository.createQueryBuilder('conversation')
        .innerJoinAndSelect('conversation.users', 'user')
        .where('conversation.id = :conversationId', { conversationId })
        .getMany(),
    )
  }

  getConversationsWithUsers(userId: number): Observable<Chat[]> {
    return this.getConversationForUser(userId).pipe(
      take(1),
      switchMap((chats: Chat[]) => chats),
      mergeMap((chat: Chat) => {
        return this.getUsersInConversation(chat.id);
      }),
    );
  }

  joinConversation(friendId: number, userId: number, socketId: string): Observable<ActiveConversation> {
    return this.getConversation(userId, friendId).pipe(
      switchMap((chat: Chat) => {
        if (!chat) {
          console.warn(`No conversation exists for userId: ${userId} and friendId: ${friendId}`);
          return of();
        }

        const conversationId = chat.id;
        return from(this.activeConversationRepository.findOne({ where: { userId } })).pipe(
          switchMap((activeConversation: ActiveConversation) => {
            if (activeConversation) {
              return from(
                this.activeConversationRepository.delete({ userId }),
              ).pipe(
                switchMap(() => {
                  return from(
                    this.activeConversationRepository.save({
                      socketId,
                      userId,
                      conversationId,
                    }),
                  );
                }),
              );
            } else {
              return from(
                this.activeConversationRepository.save({
                  socketId,
                  userId,
                  conversationId,
                }),
              );
            }
          }),
        );
      }),
    );
  }

  leaveConversation(socketId: string): Observable<DeleteResult> {
    return from(this.activeConversationRepository.delete({ socketId }));
  }

  getActiveUsers(conversationId: number): Observable<ActiveConversation[]> {
    return from(
      this.activeConversationRepository.find({
        where: [{ conversationId }],
      }),
    );
  }

  createMessage(message: Message): Observable<Message> {
    return from(this.messageRepository.save(message));
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return from(
      this.messageRepository
        .createQueryBuilder('message')
        .innerJoinAndSelect('message.user', 'user')
        .where('message.conversation.id = :conversationId', { conversationId })
        .orderBy('message.createdAt', 'ASC')
        .getMany(),
    );
  }

  // Note: Would remove below in production - helper methods
  removeActiveConversations() {
    return from(
      this.activeConversationRepository.createQueryBuilder().delete().execute(),
    );
  }

  removeMessages() {
    return from(this.messageRepository.createQueryBuilder().delete().execute());
  }

  removeConversations() {
    return from(
      this.chatRepository.createQueryBuilder().delete().execute(),
    );
  }
}
