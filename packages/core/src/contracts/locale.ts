import { z } from 'zod';

// Los 3 idiomas del proyecto (PRD §1/§7). El inglés es el idioma fuente.
export const LOCALES = ['en', 'es', 'de'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Texto localizado que EXIGE las 3 claves — PRD §7 invariante: "un esquema Zod
 * que exija las 3 claves rompe el build si falta una traducción". Un objeto
 * simple con las 3 keys required (no z.record) para que falte una clave sea
 * un error de tipos en compile time, no solo en runtime.
 */
export const LocalizedTextSchema = z.object({
  en: z.string().min(1),
  es: z.string().min(1),
  de: z.string().min(1),
});
export type LocalizedText = z.infer<typeof LocalizedTextSchema>;
