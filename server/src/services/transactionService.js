import Transaction from '../models/Transaction.js';
import { AppError } from '../utils/AppError.js';
import { allocateIncome } from '../utils/allocateIncome.js';
import * as budgetRuleService from './budgetRuleService.js';
import {
  budgetRulesSchema,
} from '../validators/budgetRuleValidator.js';
import {
  createTransactionRequestSchema,
  getCreateTransactionValidationMessage,
} from '../validators/createTransactionValidator.js';

function toTransactionResponse(doc) {
  return {
    id: String(doc._id),
    originalSentence: doc.originalSentence,
    amount: doc.amount,
    direction: doc.direction,
    category: doc.category,
    date: doc.date,
    allocations: (doc.allocations ?? []).map((allocation) => ({
      category: allocation.category,
      percentage: allocation.percentage,
      amount: allocation.amount,
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toHistoryTransactionResponse(doc) {
  return {
    id: String(doc._id),
    originalSentence: doc.originalSentence,
    amount: doc.amount,
    direction: doc.direction,
    category: doc.category,
    date: doc.date,
    createdAt: doc.createdAt,
  };
}

function resolveExpenseCategory(requestedCategory, budgetCategories) {
  const matched = budgetCategories.find(
    (category) => category.name.toLowerCase() === requestedCategory.toLowerCase(),
  );

  if (!matched) {
    throw new AppError(
      'Expense category must match a configured budget category.',
      400,
    );
  }

  return matched.name;
}

function requireValidBudgetRules(budgetRules) {
  const parsed = budgetRulesSchema.safeParse(budgetRules);

  if (!parsed.success) {
    throw new AppError(
      'Budget Rules must be configured and total exactly 100% before recording income.',
      400,
    );
  }

  return parsed.data.categories;
}

export async function createTransaction(payload) {
  const parsedRequest = createTransactionRequestSchema.safeParse(payload);

  if (!parsedRequest.success) {
    throw new AppError(
      getCreateTransactionValidationMessage(parsedRequest.error),
      400,
    );
  }

  const {
    originalSentence,
    amount,
    direction,
    category,
    date,
  } = parsedRequest.data;

  const budgetRules = await budgetRuleService.getBudgetRules();
  let persistedCategory = category;
  let allocations = [];

  if (direction === 'income') {
    if (category.toLowerCase() !== 'income') {
      throw new AppError('Income transactions must use category "Income".', 400);
    }

    const ruleCategories = requireValidBudgetRules(budgetRules);

    try {
      allocations = allocateIncome(amount, ruleCategories);
    } catch {
      throw new AppError(
        'Unable to allocate income using the current Budget Rules.',
        400,
      );
    }

    persistedCategory = 'Income';
  } else {
    if (!budgetRules.categories || budgetRules.categories.length === 0) {
      throw new AppError(
        'Budget Rules must be configured before recording expenses.',
        400,
      );
    }

    persistedCategory = resolveExpenseCategory(category, budgetRules.categories);
    allocations = [];
  }

  const doc = await Transaction.create({
    originalSentence,
    amount,
    direction,
    category: persistedCategory,
    date,
    allocations,
  });

  return {
    transaction: toTransactionResponse(doc),
  };
}

/**
 * Read-only history listing. Newest transactions first by createdAt.
 */
export async function getTransactions() {
  const docs = await Transaction.find({})
    .sort({ createdAt: -1, _id: -1 })
    .select('originalSentence amount direction category date createdAt')
    .lean();

  return {
    transactions: docs.map(toHistoryTransactionResponse),
  };
}
