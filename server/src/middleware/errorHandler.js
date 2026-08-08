import { env } from '../config/env.js';

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;

  console.error(err);

  const isProduction = env.NODE_ENV === 'production';
  const message =
    statusCode >= 500 && isProduction
      ? 'Internal server error'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}
