export function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

export function fromCents(cents) {
  return cents / 100;
}

/**
 * usagePercentage:
 * - allocated=0, used=0 → 0
 * - allocated=0, used>0 → null
 * - otherwise → used/allocated*100 rounded to 2 decimals (may exceed 100)
 */
export function calculateUsagePercentage(usedCents, allocatedCents) {
  if (allocatedCents === 0) {
    return usedCents > 0 ? null : 0;
  }

  return Math.round((usedCents / allocatedCents) * 10000) / 100;
}

/**
 * Status thresholds:
 * - healthy: < 70
 * - warning: 70–100 inclusive
 * - over: > 100, or allocated=0 with used>0
 */
export function calculateCategoryStatus(usagePercentage, usedCents, allocatedCents) {
  if (allocatedCents === 0) {
    return usedCents > 0 ? 'over' : 'healthy';
  }

  if (usagePercentage < 70) {
    return 'healthy';
  }

  if (usagePercentage <= 100) {
    return 'warning';
  }

  return 'over';
}
