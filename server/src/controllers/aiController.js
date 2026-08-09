import { AppError } from '../utils/AppError.js';
import { getApplicationDate } from '../utils/applicationDate.js';
import * as budgetRuleService from '../services/budgetRuleService.js';
import { parseTransactionText } from '../services/geminiTransactionService.js';
import {
  getParseTransactionRequestMessage,
  parseTransactionRequestSchema,
} from '../validators/parseTransactionValidator.js';

export async function parseTransaction(req, res, next) {
  try {
    const parsedRequest = parseTransactionRequestSchema.safeParse(req.body);

    if (!parsedRequest.success) {
      throw new AppError(getParseTransactionRequestMessage(parsedRequest.error), 400);
    }

    const budgetRules = await budgetRuleService.getBudgetRules();
    const categories = (budgetRules.categories ?? []).map((category) => category.name);
    const applicationDate = getApplicationDate();

    const data = await parseTransactionText(
      parsedRequest.data.text,
      categories,
      applicationDate,
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
