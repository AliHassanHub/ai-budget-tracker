import { z } from 'zod';

const PERCENTAGE_TOTAL_CENTS = 10000;

function hasAtMostTwoDecimalPlaces(value) {
  const scaled = value * 100;
  return Math.abs(scaled - Math.round(scaled)) < 1e-8;
}

const categorySchema = z.object({
  name: z
    .string({ error: 'Category name is required' })
    .trim()
    .min(1, 'Category name is required'),
  percentage: z
    .number({ error: 'Percentage must be a valid number' })
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage must be at most 100')
    .refine(hasAtMostTwoDecimalPlaces, {
      message: 'Percentage may have at most two decimal places',
    }),
});

export const budgetRulesSchema = z
  .object({
    categories: z
      .array(categorySchema, {
        error: 'Categories must be an array',
      })
      .min(1, 'At least one category is required'),
  })
  .superRefine((data, ctx) => {
    const seen = new Set();

    for (const category of data.categories) {
      const key = category.name.toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: 'custom',
          path: ['categories'],
          message: 'Category names must be unique',
        });
        return;
      }
      seen.add(key);
    }

    const totalCents = data.categories.reduce(
      (sum, category) => sum + Math.round(category.percentage * 100),
      0,
    );

    if (totalCents !== PERCENTAGE_TOTAL_CENTS) {
      ctx.addIssue({
        code: 'custom',
        path: ['categories'],
        message: 'Budget percentages must total exactly 100%',
      });
    }
  });

export function getBudgetRulesValidationMessage(error) {
  const issues = error.issues ?? [];
  if (issues.length === 0) {
    return 'Invalid budget rules';
  }
  return issues[0].message;
}
