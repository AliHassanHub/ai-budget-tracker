import { Router } from 'express';
import { parseTransaction } from '../controllers/aiController.js';

const router = Router();

router.post('/parse-transaction', parseTransaction);

export default router;
