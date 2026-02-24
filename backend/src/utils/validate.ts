import { z } from 'zod';

export const SimplifyRequestSchema = z.object({
  text: z.string()
    .min(1, 'Text cannot be empty')
    .max(5000, 'Text exceeds 5000 characters — select a shorter passage'),
  tone: z.union([z.literal('baby'), z.literal(5), z.literal(12), z.literal(18), z.literal('big_boy')]).optional().default(12),
  depth: z.enum(['light', 'medium', 'detailed']).optional().default('medium'),
  profession: z.string().max(200).optional().default(''),
});

export type SimplifyRequest = z.infer<typeof SimplifyRequestSchema>;
