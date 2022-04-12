/* eslint-disable import/prefer-default-export */
import { StatusCodes } from 'http-status-codes';
import { RESPONSE_TYPES } from '../constants/responseTypes';

export class ClientError extends Error {
  message: string;

  type: string;

  status: number;

  constructor(message:string, type:string, status:number = StatusCodes.BAD_GATEWAY) {
    super(message);
    this.type = type ?? RESPONSE_TYPES.VALIDATION_ERROR;
    this.message = message;
    this.status = status;
  }
}
