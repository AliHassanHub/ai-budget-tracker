import { z } from 'zod';
import { isValidCalendarDate } from '../utils/applicationDate.js';

export const geminiTransactionJsonSchema = {
  type: 'object',
  properties: {
    amount: {
      type: 'number',
      nullable: true,
      description:
        'Normalized numeric transaction amount greater than 0. Use null if the amount cannot be determined confidently.',
    },
    direction: {
      type: 'string',
      enum: ['income', 'expense'],
      description: 'Whether the transaction is income or expense.',
    },
    category: {
      type: 'string',
      nullable: true,
      description:
        'For income use "Income". For expense use one supplied budget category, or null when the category cannot be determined confidently.',
    },
    date: {
      type: 'string',
      description: 'Transaction date in exact YYYY-MM-DD format.',
    },
  },
  required: ['amount', 'direction', 'category', 'date'],
  additionalProperties: false,
};

export const parsedTransactionSchema = z.object({
  amount: z
    .number({ error: 'Amount must be a number' })
    .finite('Amount must be a finite number')
    .gt(0, 'Amount must be greater than 0'),
  direction: z.enum(['income', 'expense'], {
    error: 'Direction must be income or expense',
  }),
  category: z.union([
    z.string().trim().min(1, 'Category cannot be empty'),
    z.null(),
  ]),
  date: z
    .string({ error: 'Date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must use YYYY-MM-DD format')
    .refine(isValidCalendarDate, 'Date must be a valid calendar date'),
});

export function getParsedTransactionValidationMessage(error) {
  const issues = error.issues ?? [];
  if (issues.length === 0) {
    return 'Parsed transaction data is invalid';
  }
  return issues[0].message;
}
