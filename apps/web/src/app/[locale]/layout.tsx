import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@app/core/contracts';
import '../globals.css';
import { interBody, oswaldDisplay } from '../fonts';

// T0.2: enumera las 3 rutas localizadas para `output: 'export'` — sin esto
// Next no sabe qué `/en`, `/es`, `/de` prerenderizar (no hay servidor que
// resuelva el segmento dinámico bajo demanda). `generateStaticParams` en el
// layout basta: no hay más segmentos dinámicos por debajo en esta tarea.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

// Root layout propio de este árbol (T3.2, fix de deuda anotada 3 veces en
// el journal): antes este layout NO era una raíz — envolvía `children` sin
// `<html>`/`<body>`, delegados al único root layout compartido con `/`
// (`app/layout.tsx`, ya borrado), que nunca recibía `locale` y por eso
// `<html lang>` quedaba fijo en "en" para `/es/*` y `/de/*` (parcheado
// client-side por `SetHtmlLang`, también borrado — ver el layout de
// `(root)` para el detalle completo de la técnica "multiple root layouts").
// Ahora este árbol declara su propio `<html lang={locale}>` correcto desde
// el HTML servido, sin JS — mismas fuentes/CSS que antes, ningún cambio
// visual.
export const metadata: Metadata = {
  title: 'EnduroFun',
  description: 'Rutas guiadas de enduro en la provincia de Málaga.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Solo alcanzable si alguien pide una ruta fuera de las 3 generadas
  // (no ocurre navegando desde el sitio) — 404 estático, no negociación de
  // idioma en servidor (PRD D11: no hay servidor).
  if (!isLocale(locale)) {
    notFound();
  }
  return (
    <html lang={locale} className={`${interBody.variable} ${oswaldDisplay.variable}`}>
      <body>{children}</body>
    </html>
  );
}
