export interface IEnvite {
    id:string,
    title:string,
    location: string,
    placeId:string,
    price:number,
    note:string,
    createdAt: number,
    updatedAt: number,
    imageUrl: string,
    createdBy: string
}

export interface IEnviteRequest {
    id:string,
    eid:string,
    status:'PENDING' | 'ACCEPTED' | 'DECLINED'
    from:string,
    to:string,
    createdAt:number,
    updatedAt:number,
}
