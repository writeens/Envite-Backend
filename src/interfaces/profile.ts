export interface IUpdateProfileRequestBody {
    firstName:string,
    lastName:string,
    email:string,
    q1:string,
    q2:string,
    filePath:string,
}

export interface IUpdateProfileComplete {
    firstName:string,
    lastName:string,
    profileUrl:string,
    email:string,
    q1:string,
    q2:string,
    createdAt:number,
    uid:string
}
