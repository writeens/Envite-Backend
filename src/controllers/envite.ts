import { NextFunction, Request, Response } from 'express';
import formidable from 'formidable';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';
import { RESPONSE_TYPES } from '../constants/responseTypes';
import { ValidationError } from '../exceptions';
import { ICreateEnviteRequestBody } from '../interfaces/envite';
import * as EnviteService from '../services/envite';

export const createEnvite = async (req:Request, res:Response, next:NextFunction) => {
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

    const formData = await getFormInfo as {fields:ICreateEnviteRequestBody,
      files:formidable.Files};

    const schema = Joi.object({
      title: Joi.string().required(),
      location: Joi.string().required(),
      placeId: Joi.string().required(),
      note: Joi.string().required(),
      price: Joi.number().required(),
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

    const data = await EnviteService.createEnvite(uid, {
      ...formData.fields,
      imageSource: image.filepath,
    });

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteEnvite = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { params, uid } = req;

    const schema = Joi.object({
      eid: Joi.string().required(),
    });

    const validationResult = schema.validate(params);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    // DELETE
    const response = await EnviteService.deleteEnvite(uid, params.eid);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: {
        id: response.eid,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchAnEnvite = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { params } = req;

    const schema = Joi.object({
      eid: Joi.string().required(),
    });

    const validationResult = schema.validate(params);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const response = await EnviteService.fetchEnvite(params.eid);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchHomeEnvites = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { uid } = req;
    const query = {
      limit: Number(req.query.limit) || undefined,
      startAfter: Number(req.query.startAfter) || undefined,
    };

    const schema = Joi.object({
      limit: Joi.number().optional(),
      startAfter: Joi.number().optional(),
    });

    const validationResult = schema.validate(query);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const response = await EnviteService.fetchHomeEnvites(uid, query.limit, query.startAfter);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchMyEnvites = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { uid } = req;
    const query = {
      limit: Number(req.query.limit) || undefined,
      startAfter: Number(req.query.startAfter) || undefined,
    };

    const schema = Joi.object({
      limit: Joi.number().optional(),
      startAfter: Joi.number().optional(),
    });

    const validationResult = schema.validate(query);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const response = await EnviteService.fetchMyEnvites(uid, query.limit, query.startAfter);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

export const requestEnvite = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { params, uid } = req;
    const schema = Joi.object({
      eid: Joi.string().required().valid(),
    });

    const validationResult = schema.validate(params);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    // TODO - HANDLE WHAT HAPPENS WHEN A REQUEST IS MADE
    const data = await EnviteService.requestEnvite(uid, params.eid);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const acceptRequest = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { params, uid } = req;
    const schema = Joi.object({
      requestId: Joi.string().required(),
    });

    const validationResult = schema.validate(params);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const data = await EnviteService.acceptRequest(uid, params.requestId);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const declineRequest = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { params, uid } = req;
    const schema = Joi.object({
      requestId: Joi.string().required(),
    });

    const validationResult = schema.validate(params);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const data = await EnviteService.declineRequest(uid, params.requestId);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchSentRequests = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { uid } = req;
    const query = {
      limit: Number(req.query.limit) || undefined,
      startAfter: Number(req.query.startAfter) || undefined,
    };

    const schema = Joi.object({
      limit: Joi.number().optional(),
      startAfter: Joi.number().optional(),
    });

    const validationResult = schema.validate(query);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const response = await EnviteService.fetchSentRequests(uid, query.limit, query.startAfter);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};

export const fetchReceivedRequests = async (req:Request, res:Response, next:NextFunction) => {
  try {
    const { uid } = req;
    const query = {
      limit: Number(req.query.limit) || undefined,
      startAfter: Number(req.query.startAfter) || undefined,
    };

    const schema = Joi.object({
      limit: Joi.number().optional(),
      startAfter: Joi.number().optional(),
    });

    const validationResult = schema.validate(query);

    if (validationResult.error) {
      const error = new ValidationError(
        validationResult.error.details[0].message,
        RESPONSE_TYPES.VALIDATION_ERROR,
      );
      return next(error);
    }

    const response = await EnviteService.fetchReceivedRequests(uid, query.limit, query.startAfter);

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    return next(error);
  }
};
