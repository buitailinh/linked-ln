import { AuthService } from 'src/app/auth/services/auth.service';
import { catchError, take, tap } from 'rxjs';
import { environment } from './../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Post } from './models/Post';
import { ErrorHandlerService } from 'src/app/core/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
  ) {

    this.authService.getUserImageName().pipe(
      take(1),
      tap(({ imageName }) => {

        const defaultImagePath = 'blank-profile-picture-973460__340.webp';
        this.authService.updateUserImagePath(imageName || defaultImagePath).subscribe();
      })
    ).subscribe();
  }

  private httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  getSelectedPosts(params: any) {
    return this.http.get<Post[]>(
      `${environment.baseApiUrl}/feed${params}`
    ).pipe(
      tap((posts: Post[]) => {
        if (posts.length === 0) throw new Error('No post to retrieve');
      }),
      catchError(
        this.errorHandlerService.handleError<Post[]>('getSelectedPosts', [])
      )
    );
  }

  createPost(body: string) {
    return this.http
      .post<Post>(`${environment.baseApiUrl}/feed`,
        { body },
        this.httpOptions)
      .pipe(take(1));
  };

  updatePost(postId: number, body: string) {
    return this.http
      .patch(`${environment.baseApiUrl}/feed/${postId}`,
        { body },
        this.httpOptions)
      .pipe(take(1));
  }

  deletePost(postId: number) {
    return this.http
      .delete(`${environment.baseApiUrl}/feed/${postId}`)
      .pipe(take(1));
  }
}
