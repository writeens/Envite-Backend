/* eslint-disable import/no-unresolved */
import axios from 'axios';
import dayjs from 'dayjs';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { capitalize } from 'lodash';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions/clientError';
import { COLLECTIONS } from '../helpers/util';
import {
  ILoginUserAPIResponse, ILoginUserComplete, IRegisterUserComplete, IRegisterUserRequestBody,
} from '../interfaces/user';
import { IUser } from '../models/user';

export const registerUser = async (user:IRegisterUserRequestBody)
:Promise<IRegisterUserComplete> => {
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
      createdAt: dayjs().unix(),
      updatedAt: dayjs().unix(),
      uid: userRecord.uid,
      profileUrl: 'https://res.cloudinary.com/dfnnhgvrs/image/upload/v1649772764/envite/placeholder/avatarA.png',
    });

    // CREATE TOKEN TO SEND TO CLIENT
    const customToken = await getAuth().createCustomToken(userRecord.uid);

    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token: customToken,
    };
  } catch (error:any) {
    throw new ClientError(error.message, RESPONSE_TYPES.UNABLE_TO_CREATE_USER);
  }
};

export const loginUser = async ({ email, password }:{email:string, password:string}) => {
  try {
    const response = await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FB_API_KEY}`, { email, password });

    const userRecord = response.data as ILoginUserAPIResponse;

    const db = getFirestore();

    const userRef = db.collection(COLLECTIONS.USERS).doc(userRecord.localId);
    const doc = await userRef.get();

    if (!doc.exists) {
      throw new ClientError(RESPONSE_MESSAGES.UNABLE_TO_LOGIN, RESPONSE_TYPES.UNABLE_TO_LOGIN);
    }

    const user = doc.data() as IUser;

    // CREATE TOKEN TO SEND TO CLIENT
    const customToken = await getAuth().createCustomToken(userRecord.localId);

    const userData:ILoginUserComplete = {
      firstName: user.firstName,
      lastName: user.lastName,
      token: customToken,
      email: user.email,
    };

    return userData;
  } catch (error:any) {
    if (error instanceof ClientError) {
      throw error;
    }
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
