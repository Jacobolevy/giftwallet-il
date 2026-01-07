import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };
  if (message) {
    response.message = message;
  }
  res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
  res.status(statusCode).json(response);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  }
): void => {
  const response: ApiResponse<{ items: T[] }> = {
    success: true,
    data: { items: data } as any,
    pagination: {
      ...pagination,
      has_next: pagination.current_page < pagination.total_pages,
      has_previous: pagination.current_page > 1,
      next_page: pagination.current_page < pagination.total_pages ? pagination.current_page + 1 : null,
      previous_page: pagination.current_page > 1 ? pagination.current_page - 1 : null,
    },
  };
  res.json(response);
};

