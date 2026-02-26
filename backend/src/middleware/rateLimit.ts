import rateLimit, { type AugmentedRequest } from 'express-rate-limit';
import { hashFingerprint } from '../utils/fingerprint';
import { RATE_LIMIT } from '../config/constants';

export const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  max: RATE_LIMIT.max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => hashFingerprint(req.ip ?? '0.0.0.0', req.get('user-agent') ?? ''),
  handler: (req, res) => {
    const augmented = req as AugmentedRequest;
    const rateLimitInfo = augmented['rateLimit'];
    const resetAt = rateLimitInfo?.resetTime ?? new Date(Date.now() + RATE_LIMIT.windowMs);
    const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
    const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: `Chill, I need a break. Try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? '' : 's'}.`,
      resetAt: resetAt.toISOString(),
      retryAfterSeconds,
    });
  },
  skip: (req) => req.path === '/health',
});
