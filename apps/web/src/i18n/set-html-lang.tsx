'use client';

import { useEffect } from 'react';
import type { Locale } from '@app/core/contracts';

/**
 * Ajusta `<html lang>` al locale de la ruta actual (T0.2, code review).
 *
 * Por qué esto es necesario y por qué NO se hace en servidor: Next App
 * Router solo permite un `<html>` en todo el árbol — vive en el layout
 * RAÍZ (`apps/web/src/app/layout.tsx`), que envuelve TAMBIÉN la página de
 * redirección `/` (fuera del segmento `[locale]`). Ese layout raíz nunca
 * recibe el param `locale`, así que no hay forma síncrona en servidor de
 * escribir el `lang` correcto sin restructurar el árbol de layouts (mover
 * `<html>`/`<body>` dentro de `[locale]/layout.tsx` rompería la página `/`,
 * que necesita su propio documento completo para el meta-refresh).
 *
 * Esto NO es "detección de idioma de navegador" (PRD D11 lo prohíbe): no
 * negocia nada, solo REFLEJA en el DOM el locale que la URL ya decidió
 * (accesibilidad — lectores de pantalla — y SEO). JS mínimo, sin
 * dependencia de red ni de estado del navegador.
 */
export function SetHtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
