import { Message } from './dto/message.interface';
import { ActiveConversation } from './dto/active-conversation.interface';
import { take, tap } from 'rxjs/operators';
import { JwtGuard } from './../auth/guards/jwt.guard';
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/services/auth.service';
import { User } from 'src/auth/models/user.class';
import { Subscription, of, pipe } from 'rxjs';

@WebSocketGateway({ cors: { origin: ['http://localhost:8100'] } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  [x: string]: any;
  constructor(
    private readonly chatService: ChatService,
    private authService: AuthService,
  ) { }


  // Note: Runs when server starts - Remove in production
  onModuleInit() {
    this.chatService.removeActiveConversations().pipe(
      take(1),
    ).subscribe();

    this.chatService.removeMessages().pipe(
      take(1),
    ).subscribe();

    this.chatService.removeConversations().pipe(
      take(1),
    ).subscribe();
  }

  @WebSocketServer()
  server: Server;


  @UseGuards(JwtGuard)
  handleConnection(socket: Socket) {
    console.log('Handle connection')

    const jwt = socket.handshake.headers.authorization || null;
    this.authService.getJwtUser(jwt).subscribe((user: User) => {
      if (!user) {
        console.log('No User')
        this.handleDisconnect(socket);
      }
      else {
        socket.data.user = user;
        this.getConversations(socket, user.id);
      }
    })
  }

  handleDisconnect(socket: Socket) {
    console.log('disconnection');
    this.chatService.leaveConversation(socket.id)
      .pipe(take(1))
      .subscribe();
  }

  @SubscribeMessage('createConversation')
  createConversation(socket: Socket, friend: User) {
    this.chatService.creatConversation(socket.data.user, friend)
      .pipe(take(1)).subscribe(() => {
        this.getConversations(socket, socket.data.user.id);
      })
  }

  @SubscribeMessage('sendMessage')
  handleMessage(socket: Socket, newmessage: Message) {

    if (!newmessage.conversation) return of(null);

    const { user } = socket.data;
    newmessage.user = user;

    if (newmessage.conversation.id) {
      this.chatService.createMessage(newmessage)
        .pipe(take(1)).subscribe((message: Message) => {
          newmessage.id = message.id;
          this.chatService.getActiveUsers(newmessage.conversation.id).pipe(
            take(1)).subscribe((activeConversations: ActiveConversation[]) => {
              activeConversations.forEach((activeConversation: ActiveConversation) => {
                this.server.to(activeConversation.socketId)
                  .emit('newMessage', newmessage);
              },);
            })
        })
    };
  }




  getConversations(socket: Socket, userId: number): Subscription {
    return this.chatService.getConversationsWithUsers(userId)
      .subscribe((conversations) => {
        this.server.to(socket.id).emit('conversations', conversations);

      })
  }

  @SubscribeMessage('joinConversation')
  joinConversation(socket: Socket, friendId: number) {
    this.chatService.joinConversation(friendId, socket.data.user.id, socket.id)
      .pipe(
        tap((activeConversation: ActiveConversation) => {
          this.chatService.getMessages(activeConversation.conversationId)
            .pipe(take(1))
            .subscribe((messages: Message[]) => {
              this.server.to(socket.id).emit('messages', messages);
            });
        }),
      )
      .pipe(take(1))
      .subscribe();
  }

  @SubscribeMessage('leaveConversation')
  leaveConversation(socket: Socket) {
    this.chatService.leaveConversation(socket.id)
      .pipe()
      .subscribe()
  }
}
