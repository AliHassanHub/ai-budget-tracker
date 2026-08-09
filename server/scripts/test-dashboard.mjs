import '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import BudgetRule from '../src/models/BudgetRule.js';
import Transaction from '../src/models/Transaction.js';
import {
  getApplicationDate,
  getApplicationMonthRange,
} from '../src/utils/applicationDate.js';
import {
  calculateCategoryStatus,
  calculateUsagePercentage,
  fromCents,
  toCents,
} from '../src/utils/dashboardMetrics.js';

function check(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'} ${label}`);
}

function byCategory(payload) {
  return Object.fromEntries(
    payload.data.categories.map((category) => [category.category, category]),
  );
}

await connectDB();

const appDate = getApplicationDate();
const { month } = getApplicationMonthRange(appDate);
const [year, monthNumber] = month.split('-').map(Number);

const previous = new Date(Date.UTC(year, monthNumber - 2, 15));
const previousDate = `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, '0')}-15`;

const next = new Date(Date.UTC(year, monthNumber, 15));
const nextDate = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-15`;

const currentIncomeDate = `${month}-10`;
const currentExpenseDate = `${month}-12`;
const currentIncome2Date = `${month}-20`;
const marker = `DASHBOARD_TEST_${Date.now()}`;

await BudgetRule.findOneAndUpdate(
  {},
  {
    categories: [
      { name: 'Needs', percentage: 40 },
      { name: 'Wants', percentage: 30 },
      { name: 'Savings', percentage: 20 },
      { name: 'Investment', percentage: 10 },
    ],
  },
  { upsert: true, returnDocument: 'after' },
);

const beforeResponse = await fetch('http://localhost:5000/api/dashboard');
const beforeBody = await beforeResponse.json();
const before = byCategory(beforeBody);

await Transaction.create([
  {
    originalSentence: `${marker} income1`,
    amount: 50000,
    direction: 'income',
    category: 'Income',
    date: currentIncomeDate,
    allocations: [
      { category: 'Needs', percentage: 40, amount: 20000 },
      { category: 'Wants', percentage: 30, amount: 15000 },
      { category: 'Savings', percentage: 20, amount: 10000 },
      { category: 'Investment', percentage: 10, amount: 5000 },
    ],
  },
  {
    originalSentence: `${marker} income2-rule-change-snapshot`,
    amount: 10000,
    direction: 'income',
    category: 'Income',
    date: currentIncome2Date,
    allocations: [
      { category: 'Needs', percentage: 50, amount: 5000 },
      { category: 'Wants', percentage: 20, amount: 2000 },
      { category: 'Savings', percentage: 20, amount: 2000 },
      { category: 'Investment', percentage: 10, amount: 1000 },
    ],
  },
  {
    originalSentence: `${marker} expense-needs`,
    amount: 4000,
    direction: 'expense',
    category: 'Needs',
    date: currentExpenseDate,
    allocations: [],
  },
  {
    originalSentence: `${marker} expense-overspend-wants`,
    amount: 18000,
    direction: 'expense',
    category: 'Wants',
    date: currentExpenseDate,
    allocations: [],
  },
  {
    originalSentence: `${marker} prev-month-expense`,
    amount: 9999,
    direction: 'expense',
    category: 'Needs',
    date: previousDate,
    allocations: [],
  },
  {
    originalSentence: `${marker} next-month-income`,
    amount: 80000,
    direction: 'income',
    category: 'Income',
    date: nextDate,
    allocations: [
      { category: 'Needs', percentage: 40, amount: 32000 },
      { category: 'Wants', percentage: 30, amount: 24000 },
      { category: 'Savings', percentage: 20, amount: 16000 },
      { category: 'Investment', percentage: 10, amount: 8000 },
    ],
  },
]);

const afterResponse = await fetch('http://localhost:5000/api/dashboard');
const afterBody = await afterResponse.json();
const after = byCategory(afterBody);

console.log(`STATUS ${afterResponse.status}`);
console.log(`MONTH ${afterBody.data.month} expected ${month}`);

const needsAllocDelta = toCents(after.Needs.allocated) - toCents(before.Needs?.allocated || 0);
const needsUsedDelta = toCents(after.Needs.used) - toCents(before.Needs?.used || 0);
const wantsAllocDelta = toCents(after.Wants.allocated) - toCents(before.Wants?.allocated || 0);
const wantsUsedDelta = toCents(after.Wants.used) - toCents(before.Wants?.used || 0);
const savingsAllocDelta =
  toCents(after.Savings.allocated) - toCents(before.Savings?.allocated || 0);
const investmentAllocDelta =
  toCents(after.Investment.allocated) - toCents(before.Investment?.allocated || 0);

check('delta needs allocated +25000', needsAllocDelta === 2500000);
check('delta needs used +4000', needsUsedDelta === 400000);
check('delta wants allocated +17000', wantsAllocDelta === 1700000);
check('delta wants used +18000', wantsUsedDelta === 1800000);
check('delta savings allocated +12000', savingsAllocDelta === 1200000);
check('delta investment allocated +6000', investmentAllocDelta === 600000);
check(
  'month boundary ignored for deltas',
  needsUsedDelta === 400000 && needsAllocDelta === 2500000,
);

const overspendAllocated = 10000;
const overspendUsed = 12000;
const overspendUsage = calculateUsagePercentage(
  toCents(overspendUsed),
  toCents(overspendAllocated),
);
check('overspend usage 120', overspendUsage === 120);
check(
  'overspend status over',
  calculateCategoryStatus(
    overspendUsage,
    toCents(overspendUsed),
    toCents(overspendAllocated),
  ) === 'over',
);
check(
  'remaining exact cents',
  fromCents(toCents(after.Needs.allocated) - toCents(after.Needs.used)) ===
    after.Needs.remaining,
);

check(
  'thresholds',
  calculateCategoryStatus(69.99, 6999, 10000) === 'healthy' &&
    calculateCategoryStatus(70, 7000, 10000) === 'warning' &&
    calculateCategoryStatus(100, 10000, 10000) === 'warning' &&
    calculateCategoryStatus(100.01, 10001, 10000) === 'over',
);

const health = await fetch('http://localhost:5000/api/health').then((res) => res.json());
check('health', health.success === true);

await disconnectDB();
