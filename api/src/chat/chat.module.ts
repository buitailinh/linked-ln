import { AuthModule } from './../auth/auth.module';
import { MessageEntity } from './entities/message.entity';
import { ActiveConversationEntity } from './entities/active-conversation.entity';
import { ChatEntity } from './entities/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '././../auth/services/auth.service';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ChatEntity,
      ActiveConversationEntity,
      MessageEntity
    ])
  ],
  providers: [ChatGateway, ChatService]
})
export class ChatModule { }
