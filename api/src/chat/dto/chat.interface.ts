import { User } from "../../auth/models/user.class";

export interface Chat {
    id?: number;
    users?: User[];
    lastUpdated?: Date;
}