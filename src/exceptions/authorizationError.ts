/* eslint-disable import/prefer-default-export */
import { StatusCodes } from 'http-status-codes';
import { RESPONSE_MESSAGES } from '../constants/responseMessages';
import { RESPONSE_TYPES } from '../constants/responseTypes';

export class AuthorizationError extends Error {
  message: string;

  type: string;

  status: number;

  constructor() {
    super(RESPONSE_MESSAGES.FORBIDDEN);
    this.type = RESPONSE_TYPES.FORBIDDEN;
    this.message = RESPONSE_MESSAGES.FORBIDDEN;
    this.status = StatusCodes.FORBIDDEN;
  }
}
