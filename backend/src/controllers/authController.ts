import { Request, Response } from 'express';
import { signup as signupService, login as loginService, devLogin as devLoginService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, phone, language_preference } = req.body;
    const result = await signupService({
      email,
      password,
      name,
      phone,
      languagePreference: language_preference,
    });

    sendSuccess(
      res,
      {
        user: result.user,
        token: result.token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      201
    );
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      sendError(res, 'CONFLICT', error.message, 409);
    } else {
      sendError(res, 'VALIDATION_ERROR', error.message, 400);
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, remember_me } = req.body;
    const result = await loginService({ email, password });

    const expiresIn = remember_me ? 30 : 7; // days
    const expiresAt = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString();

    sendSuccess(res, {
      user: result.user,
      token: result.token,
      expires_at: expiresAt,
    });
  } catch (error: any) {
    sendError(res, 'UNAUTHORIZED', error.message, 401);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  sendSuccess(res, null, 200, 'Logged out successfully');
};

export const devLogin = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Do not expose this endpoint in production.
      sendError(res, 'NOT_FOUND', 'Not found', 404);
      return;
    }

    const result = await devLoginService();
    sendSuccess(res, {
      user: result.user,
      token: result.token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    sendError(res, 'INTERNAL_ERROR', error.message || 'Unable to dev login', 500);
  }
};
