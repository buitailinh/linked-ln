import { User } from "src/app/auth/models/user.model";
import { Conversation } from "./conversation";


export interface Message {
    id?: number;
    message?: string;
    user?: User;
    conversation?: Conversation;
    createdAt?: Date;
}