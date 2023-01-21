import { IsCreatorGuard } from './guards/is-creator.guard';
import { JwtGuard } from './../auth/guards/jwt.guard';
import { FeedPost } from './dto/feed.interface';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Request, Res } from '@nestjs/common';
import { FeedService } from './feed.service';
import { Observable, take } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { Roles } from './../auth/decorators/roles.decorator';
import { Role } from './../auth/models/role.enum';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {
  };


  @Roles(Role.ADMIN, Role.PREMIUM)
  @UseGuards(JwtGuard, IsCreatorGuard)
  @Post()
  create(@Body() FeedPost: FeedPost, @Request() req): Observable<FeedPost> {
    return this.feedService.createPost(FeedPost, req.user);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Patch(':id')
  updatePost(@Body() FeedPost: FeedPost, @Param('id') id: number): Observable<UpdateResult> {
    return this.feedService.updatePost(id, FeedPost);
  }

  @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete(':id')
  deletePost(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }

  // @Get()
  // findAll(): Observable<FeedPost[]> {
  //   return this.feedService.findAllPosts();
  // }

  @Get()
  findSelected(@Query('take') take: number = 10, @Query('skip') skip: number = 0): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return this.feedService.findPosts(take, skip);
  }

  @Get('images/:fileName')
  findImageByName(@Param('fileName') fileName: string, @Res() res) {
    if (!fileName || ['null', '[null]'].includes(fileName)) return;
    return res.sendFile(fileName, { root: './images' });
  }



}
