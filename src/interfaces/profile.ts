export interface IUpdateProfileRequestBody {
    firstName:string,
    lastName:string,
    profileUrl:string,
}

export interface IUpdateProfileComplete {
    firstName:string,
    lastName:string,
    uid:string
}
