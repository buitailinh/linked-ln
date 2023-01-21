import { Conversation } from './models/conversation';
import { User } from 'src/app/auth/models/user.model';
import { Observable, fromEvent } from 'rxjs';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ChatSocketService } from 'src/app/core/chat-socket.service';
import { Message } from './models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private socket: ChatSocketService,
    private http: HttpClient,

  ) { }

  sendMessage(message: string, conversation: Conversation): void {
    const newMessage: Message = {
      message,
      conversation,
    }
    this.socket.emit('sendMessage', newMessage);
  }

  getNewMessage(): Observable<Message> {
    return this.socket.fromEvent<Message>('newMessage');
  }

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.baseApiUrl}/user/friends/my`)
  }

  createConversation(friend: User): void {
    this.socket.emit('createConversation', friend)
  }

  joinConversation(friendId: number): void {
    this.socket.emit('joinConversation', friendId);
  }

  leaveConversation(): void {
    this.socket.emit('leaveConversation');
  }

  getConversationMessages(): Observable<Message[]> {
    return this.socket.fromEvent<Message[]>('messages');
  }

  getConversations(): Observable<Conversation[]> {
    return this.socket.fromEvent<Conversation[]>('conversations');
  }
}
