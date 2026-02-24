import { Router, Request, Response } from 'express';
import { SimplifyRequestSchema } from '../utils/validate';
import { streamSimplification } from '../services/aiClient';
import { logger } from '../services/logger';
import { hashFingerprint } from '../utils/fingerprint';
import { rateLimiter } from '../middleware/rateLimit';

export const simplifyRouter = Router();

simplifyRouter.post('/api/simplify', rateLimiter, async (req: Request, res: Response) => {
  // 1. Validate request body
  const parsed = SimplifyRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0];
    const isTooLong = firstError?.path[0] === 'text' && firstError.message.includes('5000');
    res.status(400).json({
      error: isTooLong ? 'text_too_long' : 'validation_error',
      message: isTooLong
        ? "Easy there, speed racer. That's too much to chew. Select a shorter passage (under 5000 characters)."
        : firstError?.message ?? 'Invalid request',
    });
    return;
  }

  const { text, tone, depth, profession } = parsed.data;
  const fingerprint = hashFingerprint(req.ip ?? '0.0.0.0', req.get('user-agent') ?? '');
  const startTime = Date.now();

  // 2. Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');  // Prevent nginx buffering
  res.flushHeaders();

  // 3. Set response timeout (10s max)
  res.setTimeout(10000, () => {
    res.write(`data: ${JSON.stringify({ error: 'timeout', message: 'That took too long. Hit me again?' })}\n\n`);
    res.end();
  });

  try {
    // 4. Stream from OpenAI token by token
    let tokenCount = 0;
    for await (const chunk of streamSimplification(text, { tone, depth, profession })) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      tokenCount += chunk.split(/\s+/).length;  // Approximate word count
    }

    // 5. Signal completion
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // 6. Log metadata (never text content)
    logger.info('simplify_complete', {
      fingerprint,
      inputLengthBin: text.length < 500 ? 'short' : text.length < 2000 ? 'medium' : 'long',
      approxOutputWords: tokenCount,
      durationMs: Date.now() - startTime,
    });
  } catch (err: unknown) {
    const errorName = (err as Error).name ?? 'Error';
    logger.error('simplify_error', { fingerprint, errorName, durationMs: Date.now() - startTime });
    res.write(`data: ${JSON.stringify({ error: 'ai_error', message: 'Something broke. Try again?' })}\n\n`);
    res.end();
  }
});
