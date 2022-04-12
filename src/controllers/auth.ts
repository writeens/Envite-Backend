/* eslint-disable consistent-return */
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { capitalize } from 'lodash';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ValidationError } from '../exceptions';
import { IRegisterUserRequestBody } from '../interfaces/user';
import * as AuthService from '../services';

/** REGISTER A USER */
export const Register = async (req:Request, res:Response, next:NextFunction) => {
  try {
    // VALIDATE
    const { body } = req;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        )
        .required()
        .messages({
          'string.pattern.base': 'password should include at least one uppercase letter, one number and one special character',
        }),
    });

    const validationResult = schema.validate(body);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      next(error);
    }

    const userFromBody:IRegisterUserRequestBody = {
      email: `${body.email}`.toLowerCase(),
      firstName: capitalize(body.firstName),
      lastName: capitalize(body.lastName),
      password: body.password,
    };

    // ACT
    const user = await AuthService.registerUser(userFromBody);

    // RESPOND
    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/** LOGIN A USER */
export const Login = async (req:Request, res:Response, next:NextFunction) => {
  try {
    // VALIDATE
    const { body } = req;

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const validationResult = schema.validate(body);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      next(error);
    }

    // ACT
    const user = await AuthService.loginUser({
      email: `${body.email}`.toLowerCase(),
      password: body.password,
    });

    // RESPOND
    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
