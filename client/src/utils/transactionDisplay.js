export function formatRupees(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) {
    return 'Rs. —';
  }

  if (numeric < 0) {
    return `-Rs. ${Math.abs(numeric).toLocaleString('en-PK')}`;
  }

  return `Rs. ${numeric.toLocaleString('en-PK')}`;
}

export function formatDisplayDate(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return isoDate || '—';
  }

  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthLabel(monthKey) {
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return monthKey || '—';
  }

  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function formatDirection(direction) {
  if (direction === 'income') {
    return 'Income';
  }
  if (direction === 'expense') {
    return 'Expense';
  }
  return direction || '—';
}
