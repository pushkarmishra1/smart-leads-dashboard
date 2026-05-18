/**
 * Custom error class for application-level errors.
 * Use this to throw known errors with HTTP status codes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from unexpected programming errors

    // Captures proper stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
  }
}
