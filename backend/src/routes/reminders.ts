import { Router } from 'express';
import { getReminders, getReminder, markReminderRead } from '../controllers/reminderController';
import { authenticate } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);

router.get('/', getReminders);
router.get('/:id', getReminder);
router.patch('/:id/read', markReminderRead);

export default router;
