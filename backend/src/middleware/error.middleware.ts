import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { config } from '../config/env';

/**
 * Global error handling middleware.
 * Catches all errors passed via next(err) or thrown in async handlers.
 * Maps known error types to user-friendly responses.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(err.message, { stack: err.stack });

  // ─── Known operational errors (AppError) ──────────────────────────────────
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // ─── Mongoose Validation Error ─────────────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    sendError(res, 'Validation error', 400, errors);
    return;
  }

  // ─── Mongoose Duplicate Key Error ─────────────────────────────────────────
  if ((err as NodeJS.ErrnoException).name === 'MongoServerError') {
    const mongoError = err as Error & { code?: number; keyValue?: Record<string, unknown> };
    if (mongoError.code === 11000) {
      const field = Object.keys(mongoError.keyValue || {})[0];
      sendError(res, `${field} already exists`, 409);
      return;
    }
  }

  // ─── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // ─── Mongoose CastError (invalid ObjectId) ────────────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    sendError(res, `Invalid ${err.path}: ${err.value}`, 400);
    return;
  }

  // ─── Unknown/Unexpected Errors ─────────────────────────────────────────────
  const message = config.env === 'production'
    ? 'Internal server error'
    : err.message;

  sendError(res, message, 500);
};

/**
 * Catches async route handler errors.
 * Wraps async functions so you don't need try/catch in every controller.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
