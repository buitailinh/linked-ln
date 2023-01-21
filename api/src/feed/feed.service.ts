import { User } from '../auth/models/user.class';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { FeedPost } from './dto/feed.interface';
import { FeedPostEntity } from './entities/feed.entity';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(FeedPostEntity)
        private readonly feedPostRepository: Repository<FeedPostEntity>
    ) { };

    createPost(feedPost: FeedPost, user: User): Observable<FeedPost> {
        feedPost.author = user;
        return from(this.feedPostRepository.save(feedPost));
    }

    updatePost(id: number, feedPost: FeedPost): Observable<UpdateResult> {
        return from(this.feedPostRepository.update(id, feedPost));
    }

    deletePost(id: number): Observable<DeleteResult> {
        return from(this.feedPostRepository.delete(id));
    }

    findAllPosts(): Observable<FeedPost[]> {
        return from(this.feedPostRepository.find());
    }

    // findPosts(take: number = 10, skip: number = 0): Observable<FeedPost[]> {
    //     return from(this.feedPostRepository.findAndCount({ take, skip }).then(([posts]) => {
    //         return <FeedPost[]>posts;
    //     }))
    // }

    findPosts(take: number = 10, skip: number = 0): Observable<FeedPost[]> {
        // this.feedPostRepository.find().then((posts) => {
        //     console.log(posts);
        // });

        return from(
            this.feedPostRepository
                .createQueryBuilder('post')
                .innerJoinAndSelect('post.author', 'author')
                .orderBy('post.createdAt', 'DESC')
                .take(take)
                .skip(skip)
                .getMany(),
        )
    }

    findPostById(id: number): Observable<FeedPost> {
        return from(this.feedPostRepository.findOne({
            where: { id },
            relations: ['author']
        }))
    }
}
