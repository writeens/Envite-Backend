/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
import {
  NextFunction, Request, Response,
} from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import formidable from 'formidable';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ValidationError } from '../exceptions';
import * as UserService from '../services/profile';
import { IUpdateProfileRequestBody } from '../interfaces/profile';

export const fetchUserProfile = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { uid } = req;

    // ACT
    const user = await UserService.fetchUser(uid);
    // RESPOND
    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserProfile = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { uid } = req;

    const user = await UserService.deleteUser(uid);

    // RESPOND
    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { uid } = req;
    const form = formidable({ keepExtensions: true });

    const getFormInfo = new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err);
        }
        resolve({ fields, files });
      });
    });

    const formData = await getFormInfo as {fields:IUpdateProfileRequestBody,
        files:formidable.Files};

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
    });

    const validationResult = schema.validate(formData.fields);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const image = formData.files.image as formidable.File;

    const data = await UserService.updateUser(uid, {
      firstName: formData.fields.firstName,
      lastName: formData.fields.lastName,
      filePath: image.filepath,
    });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    next(error);
  }
};
