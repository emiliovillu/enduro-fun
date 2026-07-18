import type { Company, Locale } from '@app/core/contracts';
import { getMessages } from '@/i18n/messages';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

// Placeholder de F0 (movido aquí desde app/page.tsx en T0.2 — la raíz ahora
// es la redirección estática a /en/). Se sustituye por contenido real en
// F1 (T1.1 Home).
//
// `company` se sigue tipando e importando A PROPÓSITO, aunque el H1 ya no
// concatena `company.name` (code review T0.2: duplicaba "EnduroFun" con el
// propio mensaje traducido, ej. "Hello EnduroFun — EnduroFun"). Se conserva
// referenciado (línea de contacto abajo) para preservar el control negativo
// de T0.1: romper un campo requerido de `CompanySchema` en packages/core
// debe seguir rompiendo la compilación de esta página.
const company: Company = {
  name: 'EnduroFun',
  email: 'hola@endurofun.eu',
  location: { address: 'Álora, Málaga', lat: 36.8299, lng: -4.7106 },
  social: { instagram: 'https://instagram.com/endurofun' },
};

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <LanguageSwitcher activeLocale={locale} />
      <h1 className="text-display-lg">{messages.home.title}</h1>
      <p className="text-text-secondary">{messages.home.subtitle}</p>
      <p className="text-caption text-text-secondary">{company.email}</p>
    </main>
  );
}
