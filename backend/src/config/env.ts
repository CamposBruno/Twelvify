import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required — set it in backend/.env.local'),
  PORT: z.string().default('3001'),
  ALLOWED_ORIGIN: z.string().default('*'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.errors.map(e => `  ${e.path.join('.')}: ${e.message}`).join('\n');
  throw new Error(`Missing or invalid environment variables:\n${missing}\n\nCopy backend/.env.example to backend/.env.local and fill in the values.`);
}

export const env = parsed.data;
