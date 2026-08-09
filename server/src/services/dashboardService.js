import Transaction from '../models/Transaction.js';
import * as budgetRuleService from './budgetRuleService.js';
import {
  getApplicationDate,
  getApplicationMonthRange,
} from '../utils/applicationDate.js';
import {
  calculateCategoryStatus,
  calculateUsagePercentage,
  fromCents,
  toCents,
} from '../utils/dashboardMetrics.js';

function buildCategoryMaps(transactions, currentCategories) {
  const allocatedCentsByKey = new Map();
  const usedCentsByKey = new Map();

  currentCategories.forEach((category) => {
    const key = category.name.toLowerCase();
    allocatedCentsByKey.set(key, 0);
    usedCentsByKey.set(key, 0);
  });

  for (const transaction of transactions) {
    if (transaction.direction === 'income') {
      for (const allocation of transaction.allocations ?? []) {
        const key = String(allocation.category || '').toLowerCase();
        if (!allocatedCentsByKey.has(key)) {
          continue;
        }
        allocatedCentsByKey.set(
          key,
          allocatedCentsByKey.get(key) + toCents(allocation.amount),
        );
      }
      continue;
    }

    if (transaction.direction === 'expense') {
      const key = String(transaction.category || '').toLowerCase();
      if (!usedCentsByKey.has(key)) {
        continue;
      }
      usedCentsByKey.set(key, usedCentsByKey.get(key) + toCents(transaction.amount));
    }
  }

  return { allocatedCentsByKey, usedCentsByKey };
}

function buildMonthSummary(transactions) {
  let totalIncomeCents = 0;
  let totalSpentCents = 0;

  for (const transaction of transactions) {
    if (transaction.direction === 'income') {
      totalIncomeCents += toCents(transaction.amount);
      continue;
    }

    if (transaction.direction === 'expense') {
      totalSpentCents += toCents(transaction.amount);
    }
  }

  const totalIncome = fromCents(totalIncomeCents);
  const totalSpent = fromCents(totalSpentCents);

  return {
    totalIncome,
    totalSpent,
    available: fromCents(totalIncomeCents - totalSpentCents),
  };
}

export async function getDashboardSummary() {
  const applicationDate = getApplicationDate();
  const { month, startDate, endDateExclusive } =
    getApplicationMonthRange(applicationDate);

  const budgetRules = await budgetRuleService.getBudgetRules();
  const currentCategories = budgetRules.categories ?? [];

  const transactions = await Transaction.find({
    date: {
      $gte: startDate,
      $lt: endDateExclusive,
    },
  })
    .select('direction category amount allocations date')
    .lean();

  const summary = buildMonthSummary(transactions);
  // Keep top-level totalIncome for existing clients; summary is authoritative.
  const totalIncome = summary.totalIncome;

  if (currentCategories.length === 0) {
    return {
      month,
      totalIncome,
      summary,
      categories: [],
    };
  }

  const { allocatedCentsByKey, usedCentsByKey } = buildCategoryMaps(
    transactions,
    currentCategories,
  );

  const categories = currentCategories.map((rule) => {
    const key = rule.name.toLowerCase();
    const allocatedCents = allocatedCentsByKey.get(key) || 0;
    const usedCents = usedCentsByKey.get(key) || 0;
    const remainingCents = allocatedCents - usedCents;
    const usagePercentage = calculateUsagePercentage(usedCents, allocatedCents);
    const status = calculateCategoryStatus(
      usagePercentage,
      usedCents,
      allocatedCents,
    );

    return {
      category: rule.name,
      percentage: rule.percentage,
      allocated: fromCents(allocatedCents),
      used: fromCents(usedCents),
      remaining: fromCents(remainingCents),
      usagePercentage,
      status,
    };
  });

  return {
    month,
    totalIncome,
    summary,
    categories,
  };
}
