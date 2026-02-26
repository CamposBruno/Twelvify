import express from 'express';
import cors, { type CorsOptions } from 'cors';
import { env } from './config/env';
import { logger } from './services/logger';
import { requestLogger } from './middleware/logging';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { simplifyRouter } from './routes/simplify';
import { playgroundRouter } from './routes/playground';

const app = express();

// Trust proxy (for correct IP behind Vercel/Render/nginx)
app.set('trust proxy', 1);

const allowedOrigins = (env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('cors_blocked', { origin });
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
  credentials: false,
  maxAge: 3600,
};

app.use(cors(corsOptions));

let isShuttingDown = false;

app.use((req, res, next) => {
  if (isShuttingDown) {
    res.status(503).json({ error: 'server_shutting_down', message: 'Server is shutting down' });
    return;
  }
  next();
});

app.use(express.json({ limit: '64kb' }));
app.use(requestLogger);

app.use(healthRouter);
app.use(simplifyRouter);
app.use(playgroundRouter);
app.use(errorHandler);

const port = parseInt(env.PORT, 10);
const server = app.listen(port, () => {
  logger.info('server_start', { port });
});

const gracefulShutdown = (signal: string) => {
  logger.info('shutdown', { signal, message: `${signal} received, starting graceful shutdown...` });
  isShuttingDown = true;
  server.close(() => {
    logger.info('shutdown', { message: 'Server closed' });
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('shutdown', { message: 'Forced shutdown after 30 seconds' });
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
