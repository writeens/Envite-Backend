/* eslint-disable import/no-unresolved */
import { getFirestore } from 'firebase-admin/firestore';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions';
import { COLLECTIONS } from '../helpers/util';

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

export const updateUser = async () => {

};
