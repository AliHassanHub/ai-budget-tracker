import { parseResponse } from './parseResponse.js';

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
