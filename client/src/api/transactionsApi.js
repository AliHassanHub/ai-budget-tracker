async function parseResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function parseTransaction(text) {
  const response = await fetch('/api/ai/parse-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  return parseResponse(response);
}

export async function createTransaction(transaction) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      originalSentence: transaction.originalSentence,
      amount: transaction.amount,
      direction: transaction.direction,
      category: transaction.category,
      date: transaction.date,
    }),
  });

  return parseResponse(response);
}

export async function getTransactions() {
  const response = await fetch('/api/transactions');
  return parseResponse(response);
}
