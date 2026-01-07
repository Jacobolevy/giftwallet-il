import { Router } from 'express';
import {
  createCard,
  getCards,
  getCard,
  updateCard,
  updateBalance,
  markAsUsed,
  deleteCard,
  getCardFullCode,
  getWalletStats,
} from '../controllers/cardController';
import { authenticate } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { validateCard, validateBalanceUpdate } from '../utils/validation';
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

router.get('/stats', getWalletStats);
router.get('/', getCards);
router.get('/:id', getCard);
router.get('/:id/full-code', getCardFullCode);
router.post('/', validateCard, handleValidationErrors, createCard);
router.put('/:id', updateCard);
router.patch('/:id/balance', validateBalanceUpdate, handleValidationErrors, updateBalance);
router.post('/:id/mark-used', markAsUsed);
router.delete('/:id', deleteCard);

export default router;
