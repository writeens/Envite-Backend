/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { capitalize } from 'lodash';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ValidationError } from '../exceptions';
import * as UserService from '../services/profile';
import { IUpdateProfileRequestBody } from '../interfaces/profile';

export const FetchUserProfile = async (req:Request, res:Response, next:NextFunction) => {
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

export const UpdateUserProfile = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { body, uid } = req;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      profileUrl: Joi.string().required(),
    });

    const validationResult = schema.validate(body);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      next(error);
    }

    const profileData:IUpdateProfileRequestBody = {
      firstName: capitalize(body.firstName),
      lastName: capitalize(body.lastName),
      profileUrl: body.profileUrl,
    };

    const user = await UserService.updateUser(uid, profileData);

    // RESPOND
    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const DeleteUserProfile = async (req:Request, res:Response, next:NextFunction) => {
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
