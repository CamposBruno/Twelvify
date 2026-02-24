import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

// Privacy policy for logging:
// NEVER log: text content, req.body, user emails, raw IP addresses, or any PII
// Safe to log: fingerprint hash (SHA-256 of IP+User-Agent), token counts,
//              response times, status codes, error names, input length bins
