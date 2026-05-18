import { Response } from 'express';
import { ApiSuccess, ApiError } from '../types';

/**
 * Sends a standardized success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<ApiSuccess<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Sends a standardized error response
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: Record<string, string>[]
): Response<ApiError> => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
