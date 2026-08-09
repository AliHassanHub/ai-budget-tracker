const PERCENTAGE_TOTAL_CENTS = 10000;

export function createEmptyCategory() {
  return {
    id: crypto.randomUUID(),
    name: '',
    percentage: '',
  };
}

export function mapServerCategories(categories = []) {
  return categories.map((category) => ({
    id: crypto.randomUUID(),
    name: category.name ?? '',
    percentage:
      category.percentage === undefined || category.percentage === null
        ? ''
        : String(category.percentage),
  }));
}

function parsePercentage(value) {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return numeric;
}

function hasAtMostTwoDecimalPlaces(value) {
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-8;
}

export function getAllocationTotal(categories) {
  return categories.reduce((sum, category) => {
    const parsed = parsePercentage(category.percentage);
    return sum + (parsed ?? 0);
  }, 0);
}

function getTotalCents(categories) {
  return categories.reduce((sum, category) => {
    const parsed = parsePercentage(category.percentage);
    if (parsed === null) {
      return sum;
    }
    return sum + Math.round(parsed * 100);
  }, 0);
}

function getDuplicateNameIds(categories) {
  const counts = new Map();

  categories.forEach((category) => {
    const key = category.name.trim().toLowerCase();
    if (!key) {
      return;
    }
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const duplicates = new Set();
  categories.forEach((category) => {
    const key = category.name.trim().toLowerCase();
    if (key && counts.get(key) > 1) {
      duplicates.add(category.id);
    }
  });

  return duplicates;
}

function getCategoryFieldErrors(category, duplicateIds) {
  const errors = {};
  const trimmedName = category.name.trim();
  const percentage = parsePercentage(category.percentage);

  if (!trimmedName) {
    errors.name = 'Category name is required';
  } else if (duplicateIds.has(category.id)) {
    errors.name = 'Category names must be unique';
  }

  if (category.percentage === '') {
    errors.percentage = 'Percentage is required';
  } else if (percentage === null) {
    errors.percentage = 'Enter a valid number';
  } else if (percentage < 0) {
    errors.percentage = 'Must be at least 0';
  } else if (percentage > 100) {
    errors.percentage = 'Must be at most 100';
  } else if (!hasAtMostTwoDecimalPlaces(percentage)) {
    errors.percentage = 'Use at most two decimal places';
  }

  return errors;
}

export function validateBudgetRulesForm(categories) {
  if (categories.length === 0) {
    return {
      isValid: false,
      formError: 'Add at least one category before saving.',
      fieldErrors: {},
    };
  }

  const duplicateIds = getDuplicateNameIds(categories);
  const fieldErrors = {};
  let hasFieldErrors = false;

  categories.forEach((category) => {
    const errors = getCategoryFieldErrors(category, duplicateIds);
    if (Object.keys(errors).length > 0) {
      hasFieldErrors = true;
      fieldErrors[category.id] = errors;
    }
  });

  const totalCents = getTotalCents(categories);
  let formError = null;

  if (!hasFieldErrors && totalCents !== PERCENTAGE_TOTAL_CENTS) {
    formError = 'Budget percentages must total exactly 100%';
  }

  return {
    isValid: !hasFieldErrors && totalCents === PERCENTAGE_TOTAL_CENTS,
    formError,
    fieldErrors,
  };
}

export function toSavePayload(categories) {
  return categories.map((category) => ({
    name: category.name.trim(),
    percentage: Number(parsePercentage(category.percentage).toFixed(2)),
  }));
}

export function serializeCategories(categories) {
  return JSON.stringify(
    categories.map((category) => ({
      name: category.name.trim(),
      percentage: category.percentage === '' ? '' : String(category.percentage),
    })),
  );
}

export function getAllocationMessage(total) {
  const rounded = Math.round(total * 100) / 100;
  const remaining = Math.round((100 - rounded) * 100) / 100;

  if (Math.abs(rounded - 100) < 0.005) {
    return {
      tone: 'success',
      message: 'Your allocation is balanced and ready to save.',
    };
  }

  if (rounded < 100) {
    return {
      tone: 'warning',
      message: `Allocate ${formatPercent(remaining)} more to reach 100%.`,
    };
  }

  return {
    tone: 'error',
    message: `Your allocation exceeds the 100% limit by ${formatPercent(rounded - 100)}.`,
  };
}

export function formatPercent(value) {
  const rounded = Math.round(value * 100) / 100;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(2)}%`;
}

export function isPercentageInputAllowed(value) {
  return value === '' || /^\d{0,3}(\.\d{0,2})?$/.test(value);
}
