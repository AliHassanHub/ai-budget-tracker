import { parseResponse } from './parseResponse.js';

export async function getDashboardSummary() {
  const response = await fetch('/api/dashboard');
  return parseResponse(response);
}
