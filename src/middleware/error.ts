/* eslint-disable consistent-return */
/* eslint-disable import/prefer-default-export */
import { Response, Request, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ClientError, ValidationError, AuthorizationError } from '../exceptions';

export const clientErrorMiddlware = (err:Error, req:Request, res:Response, next:NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(err.status).json({
      status: 'fail',
      message: err.message,
      type: err.type,
    });
  }
  if (err instanceof ClientError) {
    return res.status(err.status).json({
      status: 'fail',
      message: err.message,
      type: err.type,
    });
  }

  if (err instanceof AuthorizationError) {
    return res.status(err.status).json({
      status: 'fail',
      message: err.message,
      type: err.type,
    });
  }

  if (err instanceof Error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'fail',
      message: err.message,
      type: RESPONSE_TYPES.SERVER_ERROR,
    });
  }

  next(err);
};
