
import { FeedPost } from "../../feed/dto/feed.interface";
import { Role } from "./role.enum";
import { IsEmail, IsString } from "class-validator"

export class User {
    id?: number;
    firstName?: string;
    lastName?: string;

    @IsEmail()
    email?: string;

    @IsString()
    password?: string;
    imagePath?: string;
    role?: Role;
    posts?: FeedPost[];
}