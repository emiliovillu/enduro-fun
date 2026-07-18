import { LOCALES, MessagesSchema, type Locale, type Messages } from '@app/core/contracts';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import es from '@/messages/es.json';

// Solución custom mínima (no next-intl) — decisión de T0.2, ver planning.md
// y PRD §6.2/§12: next-intl SÍ es compatible con `output: 'export'` (rutas
// con prefijo `/en`/`/es`/`/de`, sin proxy/middleware — verificado contra su
// documentación oficial), pero para 5 páginas y 3 idiomas añade routing
// config + plugin de next.config + provider de cliente que este proyecto no
// necesita. Un diccionario tipado + Zod cubre el mismo invariante (falta
// una clave → falla el build) con muchísima menos superficie.
const RAW_MESSAGES: Record<Locale, unknown> = { en, es, de };

// Validado a nivel de MÓDULO (import time), no perezoso: cualquier página
// que importe este fichero dispara el `.parse()` de los 3 idiomas durante
// `next build` (SSG), así que falta una clave en CUALQUIER locale rompe el
// build entero, no solo la ruta que la usa — control negativo de la tarea.
const MESSAGES: Record<Locale, Messages> = Object.fromEntries(
  LOCALES.map((locale) => [locale, MessagesSchema.parse(RAW_MESSAGES[locale])]),
) as Record<Locale, Messages>;

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
