import * as budgetRuleService from '../services/budgetRuleService.js';

export async function getBudgetRules(_req, res, next) {
  try {
    const data = await budgetRuleService.getBudgetRules();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function replaceBudgetRules(req, res, next) {
  try {
    const data = await budgetRuleService.replaceBudgetRules(req.body);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
