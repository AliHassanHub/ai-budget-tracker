/**
 * Returns the application calendar date as YYYY-MM-DD using the local timezone.
 * All relative date resolution should use this same value.
 */
export function getApplicationDate(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Returns the application month (YYYY-MM) and date bounds for querying
 * canonical YYYY-MM-DD transaction dates in the current month.
 */
export function getApplicationMonthRange(applicationDate = getApplicationDate()) {
  if (!isValidCalendarDate(applicationDate)) {
    throw new Error('Invalid application date');
  }

  const month = applicationDate.slice(0, 7);
  const [year, monthNumber] = month.split('-').map(Number);
  const nextMonth = new Date(Date.UTC(year, monthNumber, 1));
  const nextYear = nextMonth.getUTCFullYear();
  const nextMonthNumber = String(nextMonth.getUTCMonth() + 1).padStart(2, '0');

  return {
    month,
    startDate: `${month}-01`,
    endDateExclusive: `${nextYear}-${nextMonthNumber}-01`,
  };
}
