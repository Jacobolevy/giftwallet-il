import { Router } from 'express';
import {
  createCard,
  getCards,
  getCard,
  markAsUsed,
  deleteCard,
  getCardFullCode,
  getCardEstablishments,
} from '../controllers/cardController';
import { authenticate } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { validateCard } from '../utils/validation';
import { validationResult } from 'express-validator';

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

// All routes require authentication
router.use(authenticate);
router.use(apiRateLimiter);

router.get('/', getCards);
router.get('/:id/full-code', getCardFullCode);
router.get('/:id/establishments', getCardEstablishments);
router.get('/:id', getCard);
router.post('/', validateCard, handleValidationErrors, createCard);
router.post('/:id/mark-used', markAsUsed);
router.delete('/:id', deleteCard);

export default router;
