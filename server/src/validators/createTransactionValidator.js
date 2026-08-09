import { z } from 'zod';
import { isValidCalendarDate } from '../utils/applicationDate.js';

const MAX_ORIGINAL_SENTENCE_LENGTH = 500;

function hasAtMostTwoDecimalPlaces(value) {
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-8;
}

export const createTransactionRequestSchema = z.object({
  originalSentence: z
    .string({ error: 'Original sentence is required' })
    .trim()
    .min(1, 'Original sentence is required')
    .max(
      MAX_ORIGINAL_SENTENCE_LENGTH,
      `Original sentence must be at most ${MAX_ORIGINAL_SENTENCE_LENGTH} characters`,
    ),
  amount: z
    .number({ error: 'Amount must be a number' })
    .finite('Amount must be a finite number')
    .gt(0, 'Amount must be greater than 0')
    .refine(hasAtMostTwoDecimalPlaces, {
      message: 'Amount may have at most two decimal places',
    }),
  direction: z.enum(['income', 'expense'], {
    error: 'Direction must be income or expense',
  }),
  category: z
    .string({ error: 'Category is required' })
    .trim()
    .min(1, 'Category is required'),
  date: z
    .string({ error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
    .refine(isValidCalendarDate, 'Date must be a valid calendar date'),
});

export function getCreateTransactionValidationMessage(error) {
  const issues = error.issues ?? [];
  if (issues.length === 0) {
    return 'Invalid transaction data';
  }
  return issues[0].message;
}
