import { Router } from 'express';
import { getAllIssuers, getIssuer } from '../controllers/issuerController';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(apiRateLimiter);

// Issuers can be accessed without auth, but stats require auth
router.get('/', getAllIssuers);
router.get('/:id', authenticate, getIssuer);

export default router;
