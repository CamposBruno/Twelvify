import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/logging';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { simplifyRouter } from './routes/simplify';
import { playgroundRouter } from './routes/playground';

const app = express();

// Trust proxy (for correct IP behind Vercel/Render/nginx)
app.set('trust proxy', 1);

app.use(cors({
  origin: env.ALLOWED_ORIGIN === '*' ? '*' : env.ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'HEAD', 'OPTIONS'],
}));

app.use(express.json({ limit: '64kb' }));
app.use(requestLogger);

app.use(healthRouter);
app.use(simplifyRouter);
app.use(playgroundRouter);
app.use(errorHandler);

const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  console.log(`Twelvify backend listening on port ${port}`);
});
