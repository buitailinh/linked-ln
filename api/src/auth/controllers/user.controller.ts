import { FriendRequestStatus } from '../models/friend-request.interface';

import { map, switchMap } from 'rxjs/operators';
import { saveImageToStorage, isFileExtensionSafe, removeFile } from './../helpers/image-storage';
import { JwtGuard } from './../guards/jwt.guard';
import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors, Request, Get, Res, Param, Req, Put } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { of, Observable } from 'rxjs';
import { join } from 'path';
import { UpdateResult } from 'typeorm';
import { User } from '../models/user.class';
import { FriendRequest } from '../models/friend-request.interface';

@Controller('user')
export class UserController {

    constructor(
        private userService: UserService,
    ) { }

    @UseGuards(JwtGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', saveImageToStorage))
    uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Request() req,
    ): Observable<{ modifiedFileName: string } | { error: string }> {
        const fileName = file?.filename;

        if (!fileName) return of({ error: 'File must be a png, jpg/jpeg' });

        const imagesFolderPath = join(process.cwd(), 'images');
        const fullImagePath = join(imagesFolderPath + '/' + file.filename);

        return isFileExtensionSafe(fullImagePath).pipe(
            switchMap((isFileLegit: boolean) => {
                if (isFileLegit) {
                    const userId = req.user.id;
                    return this.userService.updateUserImageById(userId, fileName).pipe(
                        map(() => ({
                            modifiedFileName: file.filename,
                        })),
                    );
                }
                removeFile(fullImagePath);
                return of({ error: 'File content does not match extension!' });
            }),
        );
    }


    @UseGuards(JwtGuard)
    @Get('image')
    findImage(@Request() req, @Res() res): Observable<Object> {
        const userId = req.user.id;
        return this.userService.findImageNameByUserId(userId).pipe(
            switchMap((imageName: string) => {
                return of(res.sendFile(imageName, { root: './images' }))
            })
        )
    }

    @UseGuards(JwtGuard)
    @Get('image-name')
    findUserImageName(@Request() req): Observable<{ imageName: string }> {
        const userId = req.user.id;
        return this.userService.findImageNameByUserId(userId).pipe(
            switchMap((imageName: string) => {
                return of({ imageName });
            }),
        );
    }

    @UseGuards(JwtGuard)
    @Get(':userId')
    findUserById(@Param('userId') userStringId: string): Observable<User> {
        const userId = parseInt(userStringId);
        return this.userService.findUserById(userId);
    }

    @UseGuards(JwtGuard)
    @Post('/friend-request/send/:receiverId')
    sendFriendRequest(@Param('receiverId') receiverStringId: string, @Request() req): Observable<FriendRequest | { error: string }> {
        const receiverId = parseInt(receiverStringId);

        return this.userService.sendFriendRequest(receiverId, req.user);
    }

    @UseGuards(JwtGuard)
    @Get('friend-request/status/:receiverId')
    getFriendRequestStatus(@Param('receiverId') receiverStringId: string, @Request() req): Observable<FriendRequestStatus> {
        const receiverId = parseInt(receiverStringId);
        return this.userService.getFriendRequestStatus(receiverId, req.user);
    }

    // @UseGuards(JwtGuard)
    // @Get('friend-request/response/:friendRequestId')
    // respondToFriendRequestStatus(@Param('friendRequestId') friendRequestStringId: string, @Body() statusResponse: FriendRequestStatus): Observable<FriendRequestStatus> {
    //     const friendRequestaId = parseInt(friendRequestStringId);
    //     console.log(friendRequestaId);
    //     return this.userService.respondToFriendRequest(statusResponse.status, friendRequestaId);
    // }

    @UseGuards(JwtGuard)
    @Put('friend-request/response/:friendRequestId')
    respondToFriendRequest(
        @Param('friendRequestId') friendRequestStringId: string,
        @Body() statusResponse: FriendRequestStatus,
    ): Observable<FriendRequestStatus> {
        const friendRequestId = parseInt(friendRequestStringId);
        return this.userService.respondToFriendRequest(
            statusResponse.status,
            friendRequestId,
        );
    }

    @UseGuards(JwtGuard)
    @Get('friend-request/me/received-requests')
    getFriendRequestsFromRecipients(@Request() req): Observable<FriendRequestStatus[]> {

        return this.userService.getFriendRequestsFromRecipients(req.user);
    };

    @UseGuards(JwtGuard)
    @Get('friends/my')
    getFriends(@Request() req): Observable<User[]> {
        return this.userService.getFriends(req.user);
    }
}
