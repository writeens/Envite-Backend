import { Timestamp } from 'firebase-admin/firestore';

export interface IUser {
    email:string,
    firstName:string,
    lastName:string,
    profileUrl:string,
    uid:string,
    createdAt: Timestamp,
    updatedAt: Timestamp
}
