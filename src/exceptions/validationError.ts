/* eslint-disable import/prefer-default-export */
import { StatusCodes } from 'http-status-codes';
import { RESPONSE_TYPES } from '../constants/responseTypes';

export class ValidationError extends Error {
  message: string;

  type: string;

  status = StatusCodes.BAD_REQUEST;

  constructor(message:string, type:string) {
    super(message);
    this.type = type ?? RESPONSE_TYPES.VALIDATION_ERROR;
    this.message = message;
  }
}
