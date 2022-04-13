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
    const { params } = req;

    const schema = Joi.object({
      uid: Joi.string().trim().required(),
    });

    const validationResult = schema.validate(params);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      next(error);
    }

    // ACT
    const user = await UserService.fetchUser(params.uid);
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
    const { body, params } = req;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      profileUrl: Joi.string().required(),
    });

    const paramSchema = Joi.object({
      uid: Joi.string().required(),
    });

    const validationResult = schema.validate(body);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      next(error);
    }

    const paramValidationResult = paramSchema.validate(params);

    if (paramValidationResult.error) {
      const error = new ValidationError(
        paramValidationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      next(error);
    }

    const profileData:IUpdateProfileRequestBody = {
      firstName: capitalize(body.firstName),
      lastName: capitalize(body.lastName),
      profileUrl: body.profileUrl,
    };

    const user = await UserService.updateUser(params.uid, profileData);

    // RESPOND
    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
