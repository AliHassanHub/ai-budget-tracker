import { z } from 'zod';

export const MAX_TRANSACTION_TEXT_LENGTH = 500;

export const parseTransactionRequestSchema = z.object({
  text: z
    .string({ error: 'Transaction text is required' })
    .trim()
    .min(1, 'Transaction text is required')
    .max(
      MAX_TRANSACTION_TEXT_LENGTH,
      `Transaction text must be at most ${MAX_TRANSACTION_TEXT_LENGTH} characters`,
    ),
});

export function getParseTransactionRequestMessage(error) {
  const issues = error.issues ?? [];
  if (issues.length === 0) {
    return 'Invalid transaction text';
  }
  return issues[0].message;
}
