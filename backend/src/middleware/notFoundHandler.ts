import { Request, Response } from 'express';
import { sendError } from '../utils/response';

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(
    res,
    'NOT_FOUND',
    'Route not found',
    404,
    {
      path: req.path,
      method: req.method,
    }
  );
};
