/* eslint-disable import/no-unresolved */
/* eslint-disable import/prefer-default-export */
import dayjs from 'dayjs';
import { getFirestore } from 'firebase-admin/firestore';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions';
import { COLLECTIONS } from '../helpers/util';
import { ICreateEnviteRequestBody } from '../interfaces/envite';
import { IEnvite, IEnviteRequest } from '../models/envite';
import { IUser } from '../models/user';
import * as MediaService from './cloudinary';

export const createEnvite = async (uid:string, data:ICreateEnviteRequestBody) => {
  try {
    // CREATE ENVITE IN DB
    const db = getFirestore();

    const createdRef = await db.collection(COLLECTIONS.ENVITES).add({
      title: data.title,
      price: data.price,
      placeId: data.placeId,
      location: data.location,
      notes: data.notes,
      createdAt: dayjs().unix(),
      updatedAt: dayjs().unix(),
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

    // UPDATE DB WITH NEW IMAGE

    const docRef = db.collection(COLLECTIONS.ENVITES).doc(createdRef.id);

    await docRef.update({
      imageUrl: upload.uploadUrl,
      id: createdRef.id,
      updatedAt: dayjs().unix(),
    });

    return {
      id: createdRef.id,
      imageUrl: upload.uploadUrl,
      title: data.title,
      price: data.price,
      placeId: data.placeId,
      location: data.location,
      notes: data.notes,
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

    const createdBy = userSnapshot.docs[0].data() as IUser;

    const requestSnapshot = await db.collection(COLLECTIONS.REQUESTS).where('eid', '==', envite.id).get();

    const request = requestSnapshot.docs[0].data() as IEnviteRequest;

    return { ...envite, createdBy, request };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITE,
    );
  }
};

export const fetchEnvites = async (limit:number = 2, startAfter:number = 0) => {
  try {
    const db = getFirestore();

    const enviteRef = db.collection(COLLECTIONS.ENVITES);

    const snapshot = await enviteRef.orderBy('createdAt', 'asc').limit(limit).startAfter(startAfter).get();

    const items:IEnvite[] = [];
    snapshot.forEach((result) => {
      const item = result.data() as IEnvite;
      items.push(item);
    });

    return {
      items,
      startAfter: items[items.length - 1]?.createdAt || null,
    };
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

    const newRequest:IEnviteRequest = {
      id: '0',
      eid,
      from: uid,
      to: envite.createdBy,
      createdAt: dayjs().unix(),
      updatedAt: dayjs().unix(),
      status: 'PENDING',
    };

    const requestRef = await db.collection(COLLECTIONS.REQUESTS).add(newRequest);

    await requestRef.update({
      id: requestRef.id,
      updatedAt: dayjs().unix(),
    });

    return {
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

export const acceptEnvite = async (uid:string, eid:string) => {
  try {
    const db = getFirestore();

    // CHECK THAT ENVITE HAS NOT BEEN ACCEPTED
    const requestSnapshot = await db.collection(COLLECTIONS.REQUESTS).where('eid', '==', eid).get();

    const enviteRequest:IEnviteRequest = requestSnapshot.docs[0].data() as IEnviteRequest;

    if (enviteRequest.status === 'ACCEPTED') {
      throw new ClientError(
        RESPONSE_MESSAGES.ENVITE_ALREADY_ACCEPTED,
        RESPONSE_TYPES.ENVITE_ALREADY_ACCEPTED,
      );
    }

    if (enviteRequest.status !== 'PENDING') {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_ACCEPT_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_ACCEPT_ENVITE,
      );
    }

    // MAKE SURE IT IS THE CREATOR ACCEPTING
    if (enviteRequest.to !== uid) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_ACCEPT_ENVITE,
        RESPONSE_TYPES.UNAUTHORIZED,
      );
    }

    const requestRef = db.collection(COLLECTIONS.REQUESTS).doc(enviteRequest.id);

    await requestRef.update({
      status: 'ACCEPTED',
      updatedAt: dayjs().unix(),
    });

    return {
      requestId: requestRef.id,
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

export const declineEnvite = async (uid:string, eid:string) => {
  try {
    const db = getFirestore();

    const requestSnapshot = await db.collection(COLLECTIONS.REQUESTS).where('eid', '==', eid).get();

    const enviteRequest:IEnviteRequest = requestSnapshot.docs[0].data() as IEnviteRequest;

    // CHECK THAT ENVITE HAS NOT BEEN DECLINED
    if (enviteRequest.status === 'DECLINED') {
      throw new ClientError(
        RESPONSE_MESSAGES.ENVITE_ALREADY_DECLINED,
        RESPONSE_TYPES.ENVITE_ALREADY_DECLINED,
      );
    }

    // CHECK THAT ENVITE IS CURRENTLY PENDING
    if (enviteRequest.status !== 'PENDING') {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_DECLINE_ENVITE,
        RESPONSE_TYPES.UNABLE_TO_DECLINE_ENVITE,
      );
    }

    // MAKE SURE IT IS THE CREATOR DECLINING
    if (enviteRequest.to !== uid) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_DECLINE_ENVITE,
        RESPONSE_TYPES.UNAUTHORIZED,
      );
    }

    const requestRef = db.collection(COLLECTIONS.REQUESTS).doc(enviteRequest.id);

    await requestRef.update({
      status: 'DECLINED',
      updatedAt: dayjs().unix(),
    });

    return {
      requestId: requestRef.id,
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

export const fetchSentEnvites = async (
  uid:string,
  startAfter:number | undefined,
  limit:number = 2,
) => {
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

    const items:Array<any> = await Promise.all(requestSnapshot.docs.map(async (d) => {
      const request = d.data() as IEnviteRequest;
      const enviteRef = await db.collection(COLLECTIONS.ENVITES).doc(request.eid).get();
      const envite = enviteRef.data() as IEnvite;
      const createdByRef = await db.collection(COLLECTIONS.USERS).doc(envite.createdBy).get();
      const createdBy = createdByRef.data() as IUser;
      return { ...envite, createdBy, request };
    }));

    return {
      items,
      startAfter: items[items.length - 1]?.createdAt || null,
    };
  } catch (error) {
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITES,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITES,
    );
  }
};

export const fetchReceivedEnvites = async (
  uid:string,
  startAfter:number | undefined,
  limit:number = 2,
) => {
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

    const items:Array<any> = await Promise.all(requestSnapshot.docs.map(async (d) => {
      const request = d.data() as IEnviteRequest;
      const enviteRef = await db.collection(COLLECTIONS.ENVITES).doc(request.eid).get();
      const envite = enviteRef.data() as IEnvite;
      const createdByRef = await db.collection(COLLECTIONS.USERS).doc(envite.createdBy).get();
      const createdBy = createdByRef.data() as IUser;
      return { ...envite, createdBy, request };
    }));

    return {
      items,
      startAfter: items[items.length - 1]?.createdAt || null,
    };
  } catch (error) {
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_ENVITES,
      RESPONSE_TYPES.UNABLE_TO_FETCH_ENVITES,
    );
  }
};
