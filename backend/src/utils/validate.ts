import { z } from 'zod';

export const SimplifyRequestSchema = z.object({
  text: z.string()
    .min(1, 'Text cannot be empty')
    .max(5000, 'Text exceeds 5000 characters — select a shorter passage'),
});

export type SimplifyRequest = z.infer<typeof SimplifyRequestSchema>;
