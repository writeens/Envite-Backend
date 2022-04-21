export interface IRegisterUserRequestBody {
    firstName:string,
    lastName:string,
    email:string,
    password:string
}

export interface IRegisterUserComplete {
    uid:string,
    firstName:string,
    lastName:string,
    email:string,
    token:string,
    createdAt:number,
    profileUrl:string,
    q1:'',
    q2:'',
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
    uid:string,
    createdAt:number,
    profileUrl:string,
    q1:string,
    q2:string
}
