/* eslint-disable import/no-unresolved */
/* eslint-disable import/prefer-default-export */
import dayjs from 'dayjs';
import { getFirestore } from 'firebase-admin/firestore';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions';
import { COLLECTIONS } from '../helpers/util';
import {
  ICreateEnviteRequestBody, ICreateEnviteResponse, IFetchEnvitesResponse, IFetchMyEnviteResponse,
  IFetchReceivedRequestResponse, IFetchSentRequestResponse,
} from '../interfaces/envite';
import { IEnvite, IEnviteRequest } from '../models/envite';
import { IUser } from '../models/user';
import * as MediaService from './cloudinary';

// FETCH MY ENVITES
export const fetchMyEnvites = async (
  uid:string,
  limit:number = 4,
  startAfter:number|undefined = undefined,
):Promise<IFetchMyEnviteResponse[]> => {
  try {
    const db = getFirestore();

    const enviteRef = db.collection(COLLECTIONS.ENVITES);

    let snapshot = null;

    if (startAfter) {
      snapshot = await enviteRef
        .where('createdBy', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit).startAfter(startAfter)
        .get();
    } else {
      snapshot = await enviteRef
        .where('createdBy', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    }

    const userRef = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    const user = userRef.data() as IUser;

    const items:IFetchMyEnviteResponse[] = await Promise.all(snapshot.docs.map((result) => {
      const item = result.data() as IEnvite;
      return {
        ...item,
        createdByImageUrl: user.profileUrl,
      };
    }));

    return items;
  } catch (error) {
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITES,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITES,
    );
  }
};

export const fetchReceivedRequests = async (
  uid:string,
  limit:number = 2,
  startAfter:number | undefined = undefined,
):Promise<IFetchReceivedRequestResponse[]> => {
  try {
    const db = getFirestore();

    const requestRef = db.collection(COLLECTIONS.REQUESTS);

    let requestSnapshot = null;

    if (startAfter) {
      requestSnapshot = await requestRef
        .where('to', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit).startAfter(startAfter)
        .get();
    } else {
      requestSnapshot = await requestRef
        .where('to', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    }

    const items:IFetchReceivedRequestResponse[] = await Promise.all(
      requestSnapshot.docs.map(async (d) => {
        const request = d.data() as IEnviteRequest;
        const enviteRef = await db.collection(COLLECTIONS.ENVITES).doc(request.eid).get();
        const envite = enviteRef.data() as IEnvite;
        const fromRef = await db.collection(COLLECTIONS.USERS).doc(request.from).get();
        const requestedBy = fromRef.data() as IUser;
        return {
          envite, requestedBy, request,
        };
      }),
    );

    return items;
  } catch (error) {
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITES,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITES,
    );
  }
};

export const fetchSentRequests = async (
  uid:string,
  limit:number = 2,
  startAfter:number | undefined = undefined,
):Promise<IFetchSentRequestResponse[]> => {
  try {
    const db = getFirestore();

    const requestRef = db.collection(COLLECTIONS.REQUESTS);

    let requestSnapshot = null;

    if (startAfter) {
      requestSnapshot = await requestRef
        .where('from', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit).startAfter(startAfter)
        .get();
    } else {
      requestSnapshot = await requestRef
        .where('from', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
    }

    const items:IFetchSentRequestResponse[] = await Promise.all(
      requestSnapshot.docs.map(async (d) => {
        const request = d.data() as IEnviteRequest;
        const enviteRef = await db.collection(COLLECTIONS.ENVITES).doc(request.eid).get();
        const envite = enviteRef.data() as IEnvite;
        const toRef = await db.collection(COLLECTIONS.USERS).doc(request.to).get();
        const requestedTo = toRef.data() as IUser;
        return {
          envite, requestedTo, request,
        };
      }),
    );

    return items;
  } catch (error) {
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITES,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITES,
    );
  }
};

export const acceptRequest = async (uid:string, requestId:string) => {
  try {
    const db = getFirestore();

    // CHECK THAT REQUEST HAS NOT BEEN ACCEPTED
    const requestRef = db.collection(COLLECTIONS.REQUESTS).doc(requestId);

    const requestSnapshot = await requestRef.get();

    const request = requestSnapshot.data() as IEnviteRequest;

    if (request.status === 'ACCEPTED') {
      throw new ClientError(
        RESPONSE_MESSAGES.ENVITE_ALREADY_ACCEPTED,
        RESPONSE_TYPES.ENVITE_ALREADY_ACCEPTED,
      );
    }

    if (request.status !== 'PENDING') {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_ACCEPT_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_ACCEPT_ENVITE,
      );
    }

    // MAKE SURE IT IS THE CREATOR ACCEPTING
    if (request.to !== uid) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_ACCEPT_ENVITE,
        RESPONSE_TYPES.UNAUTHORIZED,
      );
    }
    const timestamp = dayjs().unix();
    await requestRef.update({
      status: 'ACCEPTED',
      updatedAt: timestamp,
    });
    return {
      requestId: requestRef.id,
      requestStatus: 'ACCEPTED',
      updatedAt: timestamp,
    };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_ACCEPT_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_ACCEPT_ENVITE,
    );
  }
};

export const declineRequest = async (uid:string, requestId:string) => {
  try {
    const db = getFirestore();

    const requestRef = db.collection(COLLECTIONS.REQUESTS).doc(requestId);

    const requestSnapshot = await requestRef.get();

    const request = requestSnapshot.data() as IEnviteRequest;

    // CHECK THAT ENVITE HAS NOT BEEN DECLINED
    if (request.status === 'DECLINED') {
      throw new ClientError(
        RESPONSE_MESSAGES.ENVITE_ALREADY_DECLINED,
        RESPONSE_TYPES.ENVITE_ALREADY_DECLINED,
      );
    }

    // CHECK THAT ENVITE IS CURRENTLY PENDING
    if (request.status !== 'PENDING') {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_DECLINE_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_DECLINE_ENVITE,
      );
    }

    // MAKE SURE IT IS THE CREATOR DECLINING
    if (request.to !== uid) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_DECLINE_ENVITE,
        RESPONSE_TYPES.UNAUTHORIZED,
      );
    }

    const timestamp = dayjs().unix();

    await requestRef.update({
      status: 'DECLINED',
      updatedAt: timestamp,
    });

    return {
      requestId: requestRef.id,
      requestStatus: 'DECLINED',
      updatedAt: timestamp,
    };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_DECLINE_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_DECLINE_ENVITE,
    );
  }
};

export const fetchHomeEnvites = async (
  uid:string,
  limit:number = 3,
  startAfter:number|undefined = undefined,
):Promise<IFetchEnvitesResponse[]> => {
  try {
    const db = getFirestore();

    const enviteRef = db.collection(COLLECTIONS.ENVITES);
    const userRef = db.collection(COLLECTIONS.USERS);
    const requestRef = db.collection(COLLECTIONS.REQUESTS);

    let snapshot = null;

    if (startAfter) {
      snapshot = await enviteRef.orderBy('createdAt', 'asc').limit(limit).startAfter(startAfter).get();
    } else {
      snapshot = await enviteRef.orderBy('createdAt', 'asc').limit(limit).get();
    }

    const items:IFetchEnvitesResponse[] = await Promise.all(
      snapshot.docs.map(async (result) => {
        const envite = result.data() as IEnvite;
        const createdByUserSnapshot = await userRef.doc(envite.createdBy).get();
        const createdByUser = createdByUserSnapshot.data() as IUser;
        const requestSnapshot = await requestRef.where('eid', '==', envite.id).where('from', '==', uid).get();
        let status = 'IDLE';
        if (!requestSnapshot.empty) {
          const request = requestSnapshot.docs[0].data() as IEnviteRequest;
          status = request.status;
        }
        return { envite, createdByUser, status };
      }),
    );

    return items;
  } catch (error) {
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITES,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITES,
    );
  }
};

export const requestEnvite = async (uid:string, eid:string) => {
  try {
    const db = getFirestore();

    const enviteRef = db.collection(COLLECTIONS.ENVITES).doc(eid);
    const doc = await enviteRef.get();
    if (!doc.exists) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITE,
      );
    }
    const envite = doc.data() as IEnvite;

    // CHECK THAT IT IS NOT A CREATOR REQUESTING
    if (envite.createdBy === uid) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_REQUEST_OWN_ENVITE,
        RESPONSE_TYPES.UNAUTHORIZED,
      );
    }

    // CHECK THAT SUCH A REQUEST DOESN'T ALREADY EXIST
    const requestSnapshot = await db.collection(COLLECTIONS.REQUESTS).where('createdBy', '==', uid).get();

    if (requestSnapshot.size > 0) {
      throw new ClientError(
        RESPONSE_MESSAGES.ENVITE_ALREADY_REQUESTED,
        RESPONSE_TYPES.ENVITE_ALREADY_REQUESTED,
      );
    }

    const timestamp = dayjs().unix();
    const newRequest:IEnviteRequest = {
      id: '0',
      eid,
      from: uid,
      to: envite.createdBy,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'PENDING',
    };

    const requestRef = await db.collection(COLLECTIONS.REQUESTS).add(newRequest);

    await requestRef.update({
      id: requestRef.id,
      updatedAt: timestamp,
    });

    return {
      updatedAt: timestamp,
      requestStatus: 'PENDING',
      requestId: requestRef.id,
    };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_REQUEST_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_REQUEST_ENVITE,
    );
  }
};

export const createEnvite = async (
  uid:string,
  data:ICreateEnviteRequestBody,
):Promise<ICreateEnviteResponse> => {
  try {
    // CREATE ENVITE IN DB
    const db = getFirestore();

    const timestamp = dayjs().unix();
    const createdRef = await db.collection(COLLECTIONS.ENVITES).add({
      title: data.title,
      price: data.price,
      placeId: data.placeId,
      location: data.location,
      note: data.note,
      createdAt: timestamp,
      updatedAt: timestamp,
      imageUrl: '',
      createdBy: uid,
    });

    // UPLOAD ENVITE IMAGE
    const upload = await MediaService.uploadImage(createdRef.id, data.imageSource, 'envite/envites');

    if (!upload) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_CREATE_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_UPLOAD_ENVITE_IMAGE,
      );
    }

    const docRef = db.collection(COLLECTIONS.ENVITES).doc(createdRef.id);

    const timestamp2 = dayjs().unix();
    await docRef.update({
      imageUrl: upload.uploadUrl,
      id: createdRef.id,
      updatedAt: timestamp2,
    });

    const userRef = await db.collection(COLLECTIONS.USERS).doc(uid).get();

    const createdByUser = userRef.data() as IUser;

    return {
      envite: {
        id: createdRef.id,
        imageUrl: upload.uploadUrl,
        title: data.title,
        price: Number(data.price),
        placeId: data.placeId,
        location: data.location,
        note: data.note,
        createdAt: timestamp,
        updatedAt: timestamp2,
        createdBy: uid,
      },
      createdByUser,
      status: 'IDLE',
    };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_CREATE_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_CREATE_ENVITE,
    );
  }
};

export const deleteEnvite = async (uid:string, eid:string) => {
  try {
    const db = getFirestore();

    const enviteRef = db.collection(COLLECTIONS.ENVITES).doc(eid);
    const doc = await enviteRef.get();

    if (!doc.exists) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_DELETE_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_DELETE_ENVITE,
      );
    }

    const envite = doc.data() as IEnvite;

    if (envite.createdBy !== uid) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNAUTHORIZED,
        RESPONSE_TYPES.UNAUTHORIZED,
      );
    }
    // UPLOAD IMAGE
    const deleteSuccessful = await MediaService.deleteImage(eid, 'envite/envites');

    if (!deleteSuccessful) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_DELETE_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_DELETE_ENVITE_CLOUDINARY,
      );
    }

    await enviteRef.delete();

    return {
      eid,
    };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_DELETE_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_DELETE_ENVITE,
    );
  }
};

export const fetchEnvite = async (eid:string) => {
  try {
    const db = getFirestore();

    const enviteRef = db.collection(COLLECTIONS.ENVITES).doc(eid);
    const doc = await enviteRef.get();

    if (!doc.exists) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITE,
      );
    }

    const envite = doc.data() as IEnvite;

    const userSnapshot = await db.collection(COLLECTIONS.USERS).where('uid', '==', envite.createdBy).get();

    let createdBy = null;
    if (!userSnapshot.empty) {
      createdBy = userSnapshot.docs[0].data() as IUser;
    }
    const requestSnapshot = await db.collection(COLLECTIONS.REQUESTS).where('eid', '==', envite.id).get();

    let request = null;
    if (!requestSnapshot.empty) {
      request = requestSnapshot.docs[0].data() as IEnviteRequest;
    }

    return { ...envite, createdByUser: createdBy, request };
  } catch (error:any) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITE,
    );
  }
};
