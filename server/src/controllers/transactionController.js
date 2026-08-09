import * as transactionService from '../services/transactionService.js';

export async function createTransaction(req, res, next) {
  try {
    const data = await transactionService.createTransaction(req.body);

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function listTransactions(_req, res, next) {
  try {
    const data = await transactionService.getTransactions();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
