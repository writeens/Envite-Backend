/* eslint-disable import/no-unresolved */
import { Timestamp } from 'firebase-admin/firestore';

export interface IEnvite {
    title:string,
    location: string,
    placeId:string,
    price:number,
    notes:string,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    imageUrl: string,
    createdBy: string
}
