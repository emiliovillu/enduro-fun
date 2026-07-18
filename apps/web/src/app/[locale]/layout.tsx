import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@app/core/contracts';
import { SetHtmlLang } from '@/i18n/set-html-lang';

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
    <>
      <SetHtmlLang locale={locale} />
      {children}
    </>
  );
}
