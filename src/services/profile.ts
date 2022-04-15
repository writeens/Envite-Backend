/* eslint-disable import/no-unresolved */
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions';
import { COLLECTIONS } from '../helpers/util';
import { IUpdateProfileComplete, IUpdateProfileRequestBody } from '../interfaces/profile';
import { IUser } from '../models/user';
import * as MediaService from './cloudinary';

export const fetchUser = async (uid:string) => {
  try {
    const db = getFirestore();

    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_FETCH_USER,
        RESPONSE_TYPES.UNABLE_TO_FETCH_USER,
      );
    }

    const user = doc.data();

    return user;
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_FETCH_USER,
      RESPONSE_TYPES.UNABLE_TO_FETCH_USER,
    );
  }
};

export const updateUser = async (
  uid:string,
  profileData:IUpdateProfileRequestBody,
):Promise<IUpdateProfileComplete> => {
  try {
    // UPDATE USER ON AUTHENTICATION DASHBOARD
    const userRecord = await getAuth().updateUser(uid, {
      displayName: `${profileData.firstName} ${profileData.lastName}`,

    });

    // GET USER INFORMATION
    const db = getFirestore();

    const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_UPDATE_PROFILE,
        RESPONSE_TYPES.UNABLE_TO_UPDATE_PROFILE,
      );
    }

    const user = doc.data() as IUser;

    const URLArray = user.profileUrl.split('/');
    const publicId = URLArray[URLArray.length - 1].split('.')[0];

    // REMOVE EXISTING IMAGE IF IT EXISTS
    if (publicId === uid) {
      await MediaService.deleteImage(publicId, 'envite/avatar');
    }

    // UPLOAD NEW IMAGE
    const response = await MediaService.uploadImage(uid, profileData.filePath, 'envite/avatar');

    if (!response) {
      throw new ClientError(
        RESPONSE_MESSAGES.UNABLE_TO_UPLOAD_AVATAR,
        RESPONSE_TYPES.UNABLE_TO_UPLOAD_AVATAR,
      );
    }

    // UPDATE USER IN DATABASE

    const docRef = db.collection(COLLECTIONS.USERS).doc(userRecord.uid);

    await docRef.update({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      profileUrl: response.uploadUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      profileUrl: response.uploadUrl,
    };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_UPDATE_PROFILE,
      RESPONSE_TYPES.UNABLE_TO_UPDATE_PROFILE,
    );
  }
};

export const deleteUser = async (uid:string) => {
  try {
    // DELETE USER ON AUTHENTICATION DASHBOARD
    await getAuth().deleteUser(uid);

    // DELETE USER ON DB
    const db = getFirestore();

    await db.collection(COLLECTIONS.USERS).doc(uid).delete();

    // DELETE USER AVATAR
    await MediaService.deleteImage(uid, 'envite/avatar');

    return {
      uid,
    };
  } catch (error) {
    if (error instanceof ClientError) {
      throw error;
    }
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_DELETE_USER,
      RESPONSE_TYPES.UNABLE_TO_DELETE_USER,
    );
  }
};
