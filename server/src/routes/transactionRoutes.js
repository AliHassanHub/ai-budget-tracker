import { Router } from 'express';
import { createTransaction } from '../controllers/transactionController.js';

const router = Router();

router.post('/', createTransaction);

export default router;
