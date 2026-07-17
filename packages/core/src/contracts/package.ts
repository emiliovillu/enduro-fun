import { z } from 'zod';
import { LocalizedTextSchema } from './locale';

/**
 * Contrato de un paquete de ruta guiada (PRD §7): "array de paquetes (id,
 * noches, días, precio, features) × 3 idiomas". Placeholder de F0 — se amplía
 * en la tarea de F2 que construye /packages con los campos que exija el mockup.
 */
export const PackageSchema = z.object({
  id: z.string().min(1),
  nights: z.number().int().nonnegative(),
  days: z.number().int().positive(),
  priceEur: z.number().positive(),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema,
  features: z.array(LocalizedTextSchema),
});
export type Package = z.infer<typeof PackageSchema>;
