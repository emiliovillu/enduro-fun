import { z } from 'zod';

/**
 * Esquema de mensajes de UI localizados (T0.2). Distinto de
 * `LocalizedTextSchema` (locale.ts): ese es para un campo individual de
 * CONTENIDO (ej. el nombre de un `Package`); este es la forma completa de
 * `src/messages/<locale>.json` en `apps/web` — un fichero POR idioma, no un
 * objeto con las 3 claves por string.
 *
 * `apps/web/src/i18n/messages.ts` hace `MessagesSchema.parse(...)` sobre
 * CADA UNO de `en.json`/`es.json`/`de.json` a nivel de módulo (import time):
 * si falta una clave en cualquiera de los 3 ficheros, `.parse()` lanza y
 * `next build` falla — ese es el invariante "las 3 claves obligatorias" del
 * PRD §7, aplicado aquí a nivel de fichero-por-idioma en vez de
 * objeto-por-string.
 *
 * Placeholder mínimo de F0: solo el "Hello EnduroFun" de la página raíz
 * placeholder de T0.1. El contenido real (Home/About/Packages/Reviews/
 * Contact) se amplía en F1/F2 — esta tarea NO es la tarea de contenido.
 */
export const MessagesSchema = z.object({
  home: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
  }),
});

export type Messages = z.infer<typeof MessagesSchema>;
