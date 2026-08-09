/**
 * Allocates an income amount across budget categories using minor-unit (cent) math.
 * Earlier allocations use floor; the final allocation receives the remainder so the
 * amounts always sum exactly to the original income.
 *
 * @param {number} amount - Income amount (> 0, at most 2 decimal places)
 * @param {Array<{ name: string, percentage: number }>} categories
 * @returns {Array<{ category: string, percentage: number, amount: number }>}
 */
export function allocateIncome(amount, categories) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Income amount must be a finite number greater than 0');
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('At least one budget category is required for allocation');
  }

  const totalCents = Math.round(amount * 100);
  const allocations = [];
  let assignedCents = 0;

  for (let index = 0; index < categories.length; index += 1) {
    const rule = categories[index];
    const percentageCents = Math.round(rule.percentage * 100);
    const isLast = index === categories.length - 1;

    const allocationCents = isLast
      ? totalCents - assignedCents
      : Math.floor((totalCents * percentageCents) / 10000);

    if (!isLast) {
      assignedCents += allocationCents;
    }

    allocations.push({
      category: rule.name,
      percentage: rule.percentage,
      amount: allocationCents / 100,
    });
  }

  const sumCents = allocations.reduce(
    (sum, item) => sum + Math.round(item.amount * 100),
    0,
  );

  if (sumCents !== totalCents) {
    throw new Error('Allocation total does not match the income amount');
  }

  return allocations;
}
