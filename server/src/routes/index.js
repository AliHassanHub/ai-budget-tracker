import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import budgetRuleRoutes from './budgetRuleRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/budget-rules', budgetRuleRoutes);
router.use('/ai', aiRoutes);

export default router;
