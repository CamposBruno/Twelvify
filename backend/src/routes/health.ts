import { Router } from 'express';
import { OpenAI } from 'openai';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const startTime = Date.now();

  const payload: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: {
      gitSha: process.env.GIT_SHA || 'unknown',
      buildTime: process.env.BUILD_TIMESTAMP || 'unknown',
    },
    memory: {
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    checks: {
      anthropic: 'pending',
    },
  };

  try {
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    await client.models.list();
    (payload.checks as Record<string, string>).anthropic = 'ok';
  } catch (err) {
    (payload.checks as Record<string, string>).anthropic = 'failed';
    payload.status = 'degraded';
    payload.responseTimeMs = Date.now() - startTime;
    res.status(503).json(payload);
    return;
  }

  payload.responseTimeMs = Date.now() - startTime;
  res.status(200).json(payload);
});
