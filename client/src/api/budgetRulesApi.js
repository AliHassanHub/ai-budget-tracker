import { parseResponse } from './parseResponse.js';

export async function getBudgetRules() {
  const response = await fetch('/api/budget-rules');
  return parseResponse(response);
}

export async function saveBudgetRules(categories) {
  const response = await fetch('/api/budget-rules', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categories }),
  });

  return parseResponse(response);
}
