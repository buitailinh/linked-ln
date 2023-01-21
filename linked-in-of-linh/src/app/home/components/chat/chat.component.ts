
import { NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { User } from 'src/app/auth/models/user.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { ChatSocketService } from 'src/app/core/chat-socket.service';
import { Conversation } from '../../services/models/conversation';
import { Message } from '../../services/models/message';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  @ViewChild('form') form: NgForm;

  userFullImagePath: string;
  userId: number;

  conversations: Conversation[] = [];
  conversations$: Observable<Conversation[]>;

  conversation: Conversation;
  private userImagePathSubscription: Subscription;
  private userIdSubscription: Subscription;
  private friendsSubscription: Subscription;
  private friendSubscription: Subscription;
  private conversationSubscription: Subscription;
  private newMessageSubscription: Subscription;
  private messageSubscription: Subscription;

  newMessage$: Observable<Message>;
  messages: Message[] = [];
  friends: User[] = [];
  friend: User;
  friend$: BehaviorSubject<User> = new BehaviorSubject<User>({});

  selectedConversationIndex: number = 0;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private chatSocketService: ChatSocketService,
  ) { }

  ionViewDidEnter() {
    // TODO: refactor - unsubscribe

    this.userImagePathSubscription = this.authService.userFullImagePath.subscribe((fullImagePath: string) => {
      this.userFullImagePath = fullImagePath;
    })

    this.userIdSubscription = this.authService.userId.subscribe((userId: number) => {
      this.userId = userId;
    })

    this.conversationSubscription = this.chatService.getConversations().subscribe((conversations: Conversation[]) => {
      this.conversations.push(conversations[0])   // from  mergemap stream
    })

    this.messageSubscription = this.chatService
      .getConversationMessages()
      .subscribe((messages: Message[]) => {
        messages.forEach((message: Message) => {
          const allMessageIds = this.messages.map(
            (message: Message) => message.id
          );
          if (!allMessageIds.includes(message.id)) {
            this.messages.push(message);
          }
        });
      });

    this.newMessageSubscription = this.chatService
      .getNewMessage()
      .subscribe((message: Message) => {
        message.createdAt = new Date();
        const allMessageIds = this.messages.map(
          (message: Message) => message.id
        );
        if (!allMessageIds.includes(message.id)) {
          this.messages.push(message);
        }
      });

    this.friendSubscription = this.friend$.subscribe((friend: any) => {
      if (JSON.stringify(friend) !== '{}') {
        this.chatService.joinConversation(this.friend.id);
      }
    });

    this.friendsSubscription = this.chatService.getFriends().subscribe((friends: User[]) => {
      this.friends = friends;
      if (friends.length > 0) {
        this.friend = this.friends[0];
        this.friend$.next(this.friend);

        friends.forEach((friend: User) => {
          this.chatService.createConversation(friend);
        });
        this.chatService.joinConversation(this.friend.id);
      }
    });
  }

  openConversation(friend: User, index: number): void {
    this.selectedConversationIndex = index;
    this.chatService.leaveConversation();
    this.friend = friend;
    this.friend$.next(this.friend);
    this.messages = [];
  }

  onSubmit() {
    const { message } = this.form.value;
    if (!message) return;
    let conversationUserIds = [this.userId, this.friend.id].sort();

    this.conversations.forEach((conversation: Conversation) => {
      let userIds = conversation.users.map((user: User) => user.id).sort();

      if (JSON.stringify(conversationUserIds) === JSON.stringify(userIds)) {
        this.conversation = conversation;
      }
    });
    this.chatService.sendMessage(message, this.conversation);
    this.form.reset();
  }

  deriveFullImagePath(user: User): string {
    let url = 'http://localhost:3000/api/v1/feed/images/';

    if (user.id === this.userId) {
      return this.userFullImagePath;
    } else if (user.imagePath) {
      return url + user.imagePath;
    } else if (this.friend.imagePath) {
      return url + this.friend.imagePath;
    } else {
      return url + 'blank-profile-picture-973460__340.webp';
    }
  }

  ionViewDidLeave(): void {
    this.userImagePathSubscription.unsubscribe();
    this.messageSubscription.unsubscribe();
    this.friendsSubscription.unsubscribe();
    this.userIdSubscription.unsubscribe();
    this.conversationSubscription.unsubscribe();
    this.newMessageSubscription.unsubscribe();
    this.friendSubscription.unsubscribe();
    this.chatService.leaveConversation();
  }
}
