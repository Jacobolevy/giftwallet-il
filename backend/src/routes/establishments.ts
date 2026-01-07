import { Router } from 'express';
import {
  searchEstablishments,
  getMyCardsForEstablishment,
} from '../controllers/establishmentController';
import { authenticate } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);

// GET /establishments/search?q=<query>
router.get('/search', searchEstablishments);

// GET /establishments/:id/my-cards - Get user's cards usable at this establishment
router.get('/:id/my-cards', getMyCardsForEstablishment);

export default router;

