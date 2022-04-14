/* eslint-disable import/prefer-default-export */
import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { isEmpty } from 'lodash';
import { AuthorizationError } from '../exceptions';

/** AUTHORIZATION MIDDLEWARE */
export const verifyToken = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { headers } = req;
    const bearerHeader = headers.authorization;

    if (!bearerHeader) {
      return next(new AuthorizationError());
    }

    const bearer = bearerHeader.split(' ');
    const idToken = bearer[1];
    const privateKey = (process.env.FB_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    const decodedToken = jwt.verify(idToken, privateKey, {
      algorithms: ['RS256'],
    }) as jwt.JwtPayload;

    if (isEmpty(decodedToken)) {
      return next(new AuthorizationError());
    }

    req.uid = decodedToken.uid;

    next();
  } catch (error) {
    return next(new AuthorizationError());
  }
};
