import { Router } from 'express';
import { getAllIssuers } from '../controllers/issuerController';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(apiRateLimiter);

router.get('/', getAllIssuers);

export default router;
