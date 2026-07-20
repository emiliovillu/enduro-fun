import { z } from 'zod';
import { LocalizedTextSchema } from './locale';

/**
 * Contrato de un paquete de ruta guiada (PRD §7): "array de paquetes (id,
 * noches, días, precio, features) × 3 idiomas". Placeholder de F0 — se amplía
 * en la tarea de F2 que construye /packages con los campos que exija el mockup.
 *
 * `nights`/`days`/`priceEur` pasan a opcionales, y se añaden
 * `subtitleOverride`/`priceLabel` (hotfix, petición directa del usuario):
 * el catálogo gana una entrada que no es una ruta con noches/días/precio
 * fijo ("Rueda con tu propia moto" — almacenamiento/transporte/taller para
 * quien trae su propia moto), así que la página no siempre puede construir
 * el subtitle/precio a partir de esos 3 campos numéricos. Cuando
 * `subtitleOverride`/`priceLabel` están presentes, la página los usa TAL
 * CUAL (ya localizados) en vez de interpolar `durationTemplate` o formatear
 * `priceEur` — mismo criterio que el resto del contrato: el dato ya viene
 * traducido, la página solo elige qué mostrar.
 */
export const PackageSchema = z.object({
  id: z.string().min(1),
  nights: z.number().int().nonnegative().optional(),
  days: z.number().int().positive().optional(),
  priceEur: z.number().positive().optional(),
  name: LocalizedTextSchema,
  description: LocalizedTextSchema,
  features: z.array(LocalizedTextSchema),
  subtitleOverride: LocalizedTextSchema.optional(),
  priceLabel: LocalizedTextSchema.optional(),
});
export type Package = z.infer<typeof PackageSchema>;
