import { Router } from 'express';
import {
  searchEstablishments,
  getEstablishment,
  getMyCardsForEstablishment,
} from '../controllers/establishmentController';
import { authenticate } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);

// GET /establishments?search=<search_query>
router.get('/', searchEstablishments);

// GET /establishments/:id
router.get('/:id', getEstablishment);

// GET /establishments/:id/my-cards - Get user's cards usable at this establishment
router.get('/:id/my-cards', getMyCardsForEstablishment);

export default router;

