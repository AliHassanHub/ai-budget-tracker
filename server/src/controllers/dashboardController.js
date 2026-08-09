import * as dashboardService from '../services/dashboardService.js';

export async function getDashboard(_req, res, next) {
  try {
    const data = await dashboardService.getDashboardSummary();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
