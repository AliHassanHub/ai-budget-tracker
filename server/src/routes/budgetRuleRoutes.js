import { Router } from 'express';
import {
  getBudgetRules,
  replaceBudgetRules,
} from '../controllers/budgetRuleController.js';

const router = Router();

router.get('/', getBudgetRules);
router.put('/', replaceBudgetRules);

export default router;
