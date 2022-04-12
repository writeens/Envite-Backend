/* eslint-disable import/no-unresolved */
import axios from 'axios';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { capitalize } from 'lodash';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions/clientError';
import { COLLECTIONS } from '../helpers/util';
import { ILoginUserComplete, IRegisterUserComplete, IRegisterUserRequestBody } from '../interfaces/user';
import { IUser } from '../models/user';

export const registerUser = async (user:IRegisterUserRequestBody)
:Promise<IRegisterUserComplete | undefined> => {
  try {
    // CREATE USER ON AUTHENTICATION DASHBOARD
    const userRecord = await getAuth().createUser({
      email: user.email,
      emailVerified: true,
      password: user.password,
      displayName: `${user.lastName} ${user.firstName}`,
      disabled: false,
    });

    // CREATE USER IN DATABASE
    const db = getFirestore();

    await db.collection(COLLECTIONS.USERS).doc(userRecord.uid).set({
      firstName: capitalize(user.firstName),
      lastName: user.lastName,
      email: user.email,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      uid: userRecord.uid,
    };
  } catch (error:any) {
    throw new ClientError(error.message, RESPONSE_TYPES.UNABLE_TO_CREATE_USER);
  }
};

export const loginUser = async ({ email, password }:{email:string, password:string}) => {
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`, { email, password });

    const userRecord = response.data as ILoginUserComplete;

    const db = getFirestore();

    const userRef = db.collection(COLLECTIONS.USERS).doc(userRecord.localId);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new ClientError(RESPONSE_MESSAGES.UNABLE_TO_LOGIN, RESPONSE_TYPES.UNABLE_TO_LOGIN);
    }

    const user:IUser = doc.data() as IUser;

    return user;
  } catch (error:any) {
    let message = '';
    if (error.response) {
      switch (error.response.data.error.message) {
        case 'EMAIL_NOT_FOUND':
          message = RESPONSE_MESSAGES.UNABLE_TO_FIND_EMAIL;
          break;
        case 'INVALID_PASSWORD':
          message = RESPONSE_MESSAGES.MISSING_EMAIL_OR_PASSWORD;
          break;
        default:
          message = RESPONSE_MESSAGES.UNABLE_TO_LOGIN;
      }
    }
    throw new ClientError(message, RESPONSE_TYPES.UNABLE_TO_LOGIN);
  }
};
