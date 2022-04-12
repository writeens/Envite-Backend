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
    uid:string
}
