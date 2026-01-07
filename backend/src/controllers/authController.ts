import { Request, Response } from 'express';
import { signup as signupService, login as loginService, devLogin as devLoginService } from '../services/authService';
import { sendSuccess, sendError } from '../utils/response';
import { ApiError } from '../middleware/errorHandler';

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
  // In a real implementation, you'd invalidate the token
  // For now, we'll just return success
  sendSuccess(res, null, 200, 'Logged out successfully');
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, verify the token and issue a new one
    // For now, return the same token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError('Token required', 401, 'UNAUTHORIZED');
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    sendSuccess(res, {
      token,
      expires_at: expiresAt,
    });
  } catch (error: any) {
    if (error instanceof ApiError) {
      sendError(res, error.code, error.message, error.statusCode);
    } else {
      sendError(res, 'UNAUTHORIZED', 'Invalid token', 401);
    }
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  // Always return success to prevent email enumeration
  sendSuccess(res, null, 200, 'Password reset email sent if account exists');
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, new_password } = req.body;
    
    // TODO: Implement password reset logic
    // Verify token, update password, etc.
    
    sendSuccess(res, null, 200, 'Password reset successfully');
  } catch (error: any) {
    sendError(res, 'VALIDATION_ERROR', error.message || 'Invalid or expired token', 400);
  }
};

export const devLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Hard guard: never allow this in production
    if (process.env.NODE_ENV === 'production') {
      sendError(res, 'NOT_FOUND', 'Not found', 404);
      return;
    }

    // Optional flag to explicitly enable in dev/test
    if (process.env.ENABLE_DEV_LOGIN !== 'true') {
      sendError(res, 'FORBIDDEN', 'Dev login is disabled', 403);
      return;
    }

    const { email, name, language_preference } = req.body || {};
    const result = await devLoginService({
      email,
      name,
      languagePreference: language_preference,
    });

    sendSuccess(res, {
      user: result.user,
      token: result.token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error: any) {
    sendError(res, 'INTERNAL_ERROR', error.message || 'Dev login failed', 500);
  }
};
