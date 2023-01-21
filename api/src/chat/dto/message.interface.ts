import { Chat } from './chat.interface';
import { User } from "../../auth/models/user.class";


export interface Message {
    id?: number;
    message?: string;
    user?: User;
    conversation?: Chat;
    lastUpdated?: Date;
}