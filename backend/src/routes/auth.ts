import { Router } from 'express';
import { signup, login, logout } from '../controllers/authController';
import { validateSignup, validateLogin } from '../utils/validation';
import { validationResult } from 'express-validator';
import { authRateLimiter, signupRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array().reduce((acc: any, err: any) => {
          acc[err.param] = err.msg;
          return acc;
        }, {}),
      },
    });
  }
  next();
};

router.post('/signup', signupRateLimiter, validateSignup, handleValidationErrors, signup);
router.post('/login', authRateLimiter, validateLogin, handleValidationErrors, login);
router.post('/logout', authenticate, logout);

export default router;
