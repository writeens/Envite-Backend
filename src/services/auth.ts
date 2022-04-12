/* eslint-disable import/no-unresolved */
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { capitalize } from 'lodash';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions/clientError';
import { setDBEnv } from '../helpers/util';
import { IRegisterUserComplete, IRegisterUserRequestBody } from '../interfaces/user';

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

    await db.collection(setDBEnv('users')).doc(userRecord.uid).set({
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

export const loginUser = () => {

};
