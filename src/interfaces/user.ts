import { boolean } from 'joi';

export interface IRegisterUserRequestBody {
    firstName:string,
    lastName:string,
    email:string,
    password:string
}

export interface IRegisterUserComplete {
    firstName:string,
    lastName:string,
    email:string,
    token:string,
}

export interface ILoginUserAPIResponse {
    idToken:string,
    email:string,
    refreshToken:string,
    expiresIn:string,
    localId:string,
    registered: boolean
}

export interface ILoginUserComplete {
    firstName:string,
    lastName:string,
    email:string,
    token:string
}
