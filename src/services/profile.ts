/* eslint-disable import/no-unresolved */
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions';
import { COLLECTIONS } from '../helpers/util';
import { IUpdateProfileComplete, IUpdateProfileRequestBody } from '../interfaces/profile';

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
    throw new ClientError(RESPONSE_MESSAGES.UNABLE_TO_FETCH_USER, RESPONSE_TYPES.UNABLE_TO_LOGIN);
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

    // UPDATE USER IN DATABASE
    const db = getFirestore();

    const docRef = db.collection(COLLECTIONS.USERS).doc(userRecord.uid);

    await docRef.update({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      profileUrl: profileData.profileUrl,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      uid: userRecord.uid,
    };
  } catch (error) {
    console.log(error);
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_UPDATE_PROFILE,
      RESPONSE_TYPES.UNABLE_TO_CREATE_USER,
    );
  }
};
