import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import budgetRuleRoutes from './budgetRuleRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/budget-rules', budgetRuleRoutes);

export default router;
