import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  logger.error('request_error', { name: err.name, message: err.message });
  if (res.headersSent) return;
  res.status(500).json({
    error: 'internal_error',
    message: 'Something broke on my end. Try again?',
  });
}
