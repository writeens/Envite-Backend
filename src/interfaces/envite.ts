import { IEnvite, IEnviteRequest } from '../models/envite';
import { IUser } from '../models/user';

export interface ICreateEnviteRequestBody {
    title:string,
    location: string,
    placeId:string,
    price:string,
    note:string,
    imageSource:string
}

export interface IFetchMyEnviteResponse extends IEnvite {
    createdByImageUrl:string,
}

export interface IFetchReceivedRequestResponse {
    request:IEnviteRequest,
    requestedBy:IUser,
    envite:IEnvite
}

export interface IFetchSentRequestResponse {
    request:IEnviteRequest,
    requestedTo:IUser,
    envite:IEnvite
}

export interface IFetchEnvitesResponse {
    envite:IEnvite,
    createdByUser:IUser,
    status:string,
}
