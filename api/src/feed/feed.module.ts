import { IsCreatorGuard } from './guards/is-creator.guard';
import { AuthModule } from './../auth/auth.module';
import { FeedPostEntity } from './entities/feed.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([FeedPostEntity])
  ],
  controllers: [FeedController],
  providers: [FeedService, IsCreatorGuard]
})
export class FeedModule { }
