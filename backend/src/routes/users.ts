import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  exportData,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.put('/me/password', changePassword);
router.get('/me/export', exportData);
router.delete('/me', deleteAccount);

export default router;
