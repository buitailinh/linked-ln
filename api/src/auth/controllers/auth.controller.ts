import { Observable, from, fromEvent, map } from 'rxjs';
import { Body, Controller, HttpCode, Post, HttpStatus } from '@nestjs/common';
import { User } from '../models/user.class';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    register(@Body() user: User): Observable<User> {

        return from(this.authService.registerAccount(user));
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() user: User): Observable<{ token: string }> {
        return from(this.authService.login(user)
            .pipe(map((jwt: string) => ({ token: jwt }))));
    }
}
