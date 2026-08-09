async function parseResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

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
