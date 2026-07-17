import { z } from 'zod';
import { LocalizedTextSchema } from './locale';

/**
 * Contrato de una review (PRD §7): "array de reviews (nombre, país, rating,
 * texto) — datos inventados en v1". El texto es localizado; nombre y país no
 * (son datos, no copy de marketing).
 */
export const ReviewSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  text: LocalizedTextSchema,
});
export type Review = z.infer<typeof ReviewSchema>;
