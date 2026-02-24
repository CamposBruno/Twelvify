import { Router, Request, Response } from 'express';
import rateLimit, { type AugmentedRequest } from 'express-rate-limit';
import { streamSimplification } from '../services/aiClient';
import { logger } from '../services/logger';
import { hashFingerprint } from '../utils/fingerprint';

const PLAYGROUND_SAMPLE =
  'The superfluous utilization of sesquipedalian verbiage inevitably precipitates a profound state of intellectual vertigo for the uninitiated observer.';

const PLAYGROUND_WINDOW_MS = 60 * 1000; // 1 minute

const playgroundRateLimiter = rateLimit({
  windowMs: PLAYGROUND_WINDOW_MS,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => hashFingerprint(req.ip ?? '0.0.0.0', req.get('user-agent') ?? ''),
  handler: (req, res) => {
    const augmented = req as AugmentedRequest;
    const rateLimitInfo = augmented['rateLimit'];
    const resetAt = rateLimitInfo?.resetTime ?? new Date(Date.now() + PLAYGROUND_WINDOW_MS);
    const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
    res.status(429).json({
      error: 'rate_limit_exceeded',
      message: "Whoa, slow down! The AI needs a breather. Try again in a moment.",
      retryAfterSeconds,
    });
  },
});

export const playgroundRouter = Router();

playgroundRouter.post('/api/playground', playgroundRateLimiter, async (req: Request, res: Response) => {
  const fingerprint = hashFingerprint(req.ip ?? '0.0.0.0', req.get('user-agent') ?? '');
  const startTime = Date.now();

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    // Stream the hardcoded sample text — never arbitrary user input
    for await (const chunk of streamSimplification(PLAYGROUND_SAMPLE, { tone: 12, depth: 'medium', profession: '' })) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    logger.info('playground_complete', {
      fingerprint,
      durationMs: Date.now() - startTime,
    });
  } catch (err: unknown) {
    const errorName = (err as Error).name ?? 'Error';
    logger.error('playground_error', { fingerprint, errorName, durationMs: Date.now() - startTime });
    res.write(`data: ${JSON.stringify({ error: 'ai_error', message: 'Something went wrong. Give it another go?' })}\n\n`);
    res.end();
  }
});
