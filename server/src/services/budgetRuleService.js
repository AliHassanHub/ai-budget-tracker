import BudgetRule from '../models/BudgetRule.js';
import { AppError } from '../utils/AppError.js';
import {
  budgetRulesSchema,
  getBudgetRulesValidationMessage,
} from '../validators/budgetRuleValidator.js';

function toResponse(doc) {
  return {
    categories: (doc?.categories ?? []).map((category) => ({
      name: category.name,
      percentage: category.percentage,
    })),
  };
}

export async function getBudgetRules() {
  const doc = await BudgetRule.findOne().lean();
  return toResponse(doc);
}

export async function replaceBudgetRules(payload) {
  const parsed = budgetRulesSchema.safeParse(payload);

  if (!parsed.success) {
    throw new AppError(getBudgetRulesValidationMessage(parsed.error), 400);
  }

  const doc = await BudgetRule.findOneAndUpdate(
    {},
    { $set: { categories: parsed.data.categories } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  ).lean();

  return toResponse(doc);
}
