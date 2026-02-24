import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger';
import { hashFingerprint } from '../utils/fingerprint';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const fingerprint = hashFingerprint(req.ip ?? '0.0.0.0', req.get('user-agent') ?? '');

  res.on('finish', () => {
    logger.info('request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
      fingerprint,  // hashed — not raw IP
      // NEVER log: req.body, text content, raw IP, or any PII
    });
  });

  next();
}
