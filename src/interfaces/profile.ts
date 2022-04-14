export interface IUpdateProfileRequestBody {
    firstName:string,
    lastName:string,
    filePath:string,
}

export interface IUpdateProfileComplete {
    firstName:string,
    lastName:string,
    profileUrl:string
}
