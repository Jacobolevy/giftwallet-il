import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export class ApiError extends Error {
  statusCode: number;
  code: string;
  details?: any;

  constructor(
    message: string,
    statusCode: number = 400,
    code: string = 'ERROR',
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle validation errors
  if ((err as any).errors) {
    sendError(
      res,
      'VALIDATION_ERROR',
      'Invalid input data',
      400,
      (err as any).errors
    );
    return;
  }

  // Default error
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    err.message || 'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined
  );
};
