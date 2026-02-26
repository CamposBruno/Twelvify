export const RATE_LIMIT = {
  windowMs: 60 * 1000,  // 1 minute window (changed from 1 hour)
  max: 30,              // 30 requests per minute per IP (conservative for API costs)
};

export const OPENAI_TIMEOUT_MS = 10000;  // 10 seconds

export const MAX_TEXT_CHARS = 5000;

export const SSE_KEEPALIVE_MS = 15000;
