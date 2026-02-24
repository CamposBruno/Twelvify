export const RATE_LIMIT = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,                  // Hard limit: 100 req/hr (backend enforced)
};

export const OPENAI_TIMEOUT_MS = 10000;  // 10 seconds

export const MAX_TEXT_CHARS = 5000;

export const SSE_KEEPALIVE_MS = 15000;
