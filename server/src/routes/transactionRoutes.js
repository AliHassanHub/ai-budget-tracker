import { Router } from 'express';
import {
  createTransaction,
  listTransactions,
} from '../controllers/transactionController.js';

const router = Router();

router.get('/', listTransactions);
router.post('/', createTransaction);

export default router;
