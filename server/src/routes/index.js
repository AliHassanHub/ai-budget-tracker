import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import budgetRuleRoutes from './budgetRuleRoutes.js';
import aiRoutes from './aiRoutes.js';
import transactionRoutes from './transactionRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/budget-rules', budgetRuleRoutes);
router.use('/ai', aiRoutes);
router.use('/transactions', transactionRoutes);

export default router;
