import { switchMap, map } from 'rxjs/operators';
import { User } from '../../auth/models/user.class';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { FeedService } from '../feed.service';
import { FeedPost } from '../dto/feed.interface';
import { UserService } from '../../auth/services/user.service';

@Injectable()
export class IsCreatorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private feedService: FeedService,
    private userService: UserService,
  ) { };
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    const { user, params }: { user: User, params: { id: number } } = request;

    if (!user || !params) return false;

    //allow admin to get make request
    if (user.role === 'admin') return true;

    const userId = user.id;
    const feedId = params.id;

    //Determine if logged-in user is the same as the user that created the feed post

    return this.userService.findUserById(userId)
      .pipe(
        switchMap((user: User) => this.feedService.findPostById(feedId)
          .pipe(
            map((feedPost: FeedPost) => {
              let isAuthor = user.id === feedPost.author.id;
              return isAuthor;
            })
          )
        ));
  }
}
