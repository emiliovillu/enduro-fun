import { z } from 'zod';
import { LocalizedTextSchema } from './locale';

/**
 * Contrato de una moto de la flota (TD.12): "Nuestra flota" en /about.
 * Mismo patrón que `ReviewSchema` — `name` NO es `LocalizedTextSchema` porque
 * es un nombre de modelo (dato, no copy de marketing), mismo criterio que
 * `name`/`country` en `ReviewSchema`. `category` es un enum fijo (no texto
 * libre): la ETIQUETA visible ("Enduro"/"Trail & Adventure") vive en
 * `messages.about.fleet.categories` (namespace hermano en `MessagesSchema`),
 * no aquí — el enum es el dato de dominio, la traducción de su etiqueta es
 * copy de UI, misma separación que ya usa `status-class.ts` para estados
 * (design-system.md §3.4: la agrupación enum→texto vive en UN sitio).
 */
export const FleetBikeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  displacementCc: z.number().int().positive(),
  category: z.enum(['enduro', 'trail-adventure']),
  description: LocalizedTextSchema,
});
export type FleetBike = z.infer<typeof FleetBikeSchema>;
