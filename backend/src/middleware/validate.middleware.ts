import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response';

/**
 * Middleware to check express-validator results.
 * If errors exist, returns 422 with structured error messages.
 * Must be placed AFTER the validator array in route definitions.
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'unknown',
      message: err.msg,
    }));

    sendError(res, 'Validation failed', 422, formattedErrors);
    return;
  }

  next();
};
