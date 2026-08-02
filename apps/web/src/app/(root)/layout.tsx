import type { Metadata } from 'next';
import '../globals.css';
import { interBody, oswaldDisplay } from '../fonts';

// Root layout independiente para el route group `(root)` (T3.2, fix de
// deuda anotada 3 veces en el journal como "candidata a T3.2"). Next App
// Router solo permite UN `<html>` por raíz de árbol de layouts — antes había
// un único root layout (`app/layout.tsx`, borrado en esta tarea) compartido
// por la página `/` (esta, fuera de `[locale]`) Y el árbol `[locale]/*`, que
// nunca recibía el param `locale` y por eso `<html lang>` quedaba fijo en
// "en" para TODAS las rutas (parcheado hasta ahora client-side por
// `SetHtmlLang`, también borrado). La técnica "multiple root layouts" de
// Next (route groups sin afectar la URL — `(root)` no aparece en la ruta)
// separa esta raíz de la de `[locale]/layout.tsx`, que ahora declara su
// propio `<html lang={locale}>`.
//
// Cubre 2 rutas sin locale (ninguna de las 2 es contenido localizado, PRD
// D11): la redirección `/` (`page.tsx`, meta-refresh a `/en/`) y la
// herramienta interna `/design-system` (`robots: noindex`, TD.1). Mismas
// fuentes/CSS que `[locale]/layout.tsx` — ningún cambio visual, solo cómo
// se declara `<html lang>`.
export const metadata: Metadata = {
  title: 'EnduroFun',
  description: 'Rutas guiadas de enduro en la provincia de Málaga.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interBody.variable} ${oswaldDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
