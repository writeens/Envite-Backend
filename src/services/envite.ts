/* eslint-disable import/no-unresolved */
/* eslint-disable import/prefer-default-export */
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError } from '../exceptions';
import { COLLECTIONS } from '../helpers/util';
import { ICreateEnviteRequestBody } from '../interfaces/envite';
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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
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
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      enviteId: createdRef.id,
      imageUrl: upload.uploadUrl,
      title: data.title,
      price: data.price,
      placeId: data.placeId,
      location: data.location,
      notes: data.notes,
    };
  } catch (error) {
    throw new ClientError(
      RESPONSE_MESSAGES.UNABLE_TO_CREATE_ENVITE,
      RESPONSE_TYPES.UNABLE_TO_CREATE_ENVITE,
    );
  }
};

// export const deleteEnvite = async (uid:string) => {
//   try {
//     // UPLOAD IMAGE
//     const upload = await MediaService.deleteImage(uid, 'envite/envites');
//   } catch (error) {

//   }
// };
