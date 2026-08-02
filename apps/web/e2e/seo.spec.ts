import { test, expect } from '@playwright/test';

// T3.2 (F3, meta tags/hreflang/sitemap) — control negativo permanente de la
// Verificación de la tarea (regla 8/10 del planning: cláusulas
// deterministas y gratuitas de la Verificación quedan protegidas contra
// regresión).
//
// 3 cosas se prueban aquí:
// 1. `<html lang>` correcto por locale SIN JavaScript — la razón de ser de
//    la restructuración de layouts de esta tarea (route groups: `(root)`
//    para `/` y `/design-system`, `[locale]` con su propio `<html>`). Antes
//    se parcheaba con `SetHtmlLang` (client-side, `useEffect`) — un
//    rastreador que no ejecuta JS habría visto siempre `lang="en"`.
//    Playwright evalúa el DOM ya parseado, no basta para probar "sin JS"
//    per se, pero si el HTML servido llevara `lang="en"` fijo y un script
//    lo corrigiera después, este test seguiría en verde por error — de ahí
//    que la Verificación de la tarea (ver report) además lea el HTML
//    servido en disco con `grep`, no solo lo compruebe aquí.
// 2. Los 3 `<link rel="alternate" hreflang="…">` cruzados, con las URLs
//    absolutas correctas — generados por `alternates.languages` en
//    `generateMetadata` (`lib/seo.ts`), no escritos a mano.
// 3. `sitemap.xml` lista las 18 URLs esperadas (6 páginas × 3 idiomas,
//    `lib/nav-links.ts`), cada una con contenido de sitemap válido.
test.describe('T3.2 — html lang, hreflang y sitemap', () => {
  test('/en/, /es/ y /de/ sirven <html lang> correcto', { tag: ['@f3'] }, async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.goto('/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.goto('/de/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test(
    'la raíz `/` y `/design-system` no rompen con la nueva raíz de layouts',
    { tag: ['@f3'] },
    async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');

      await page.goto('/design-system/');
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    },
  );

  test(
    '/es/about lleva los 3 hreflang cruzados con las URLs absolutas correctas',
    { tag: ['@f3'] },
    async ({ page }) => {
      await page.goto('/es/about/');

      const en = page.locator('link[rel="alternate"][hreflang="en"]');
      const es = page.locator('link[rel="alternate"][hreflang="es"]');
      const de = page.locator('link[rel="alternate"][hreflang="de"]');

      await expect(en).toHaveAttribute('href', 'https://endurofun.eu/en/about/');
      await expect(es).toHaveAttribute('href', 'https://endurofun.eu/es/about/');
      await expect(de).toHaveAttribute('href', 'https://endurofun.eu/de/about/');

      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        'https://endurofun.eu/es/about/',
      );
    },
  );

  test(
    'cada página localizada trae su meta description propia',
    { tag: ['@f3'] },
    async ({ page }) => {
      await page.goto('/en/');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Málaga/);

      // EN vs DE de la misma página (`contact`): contenido distinto, no un
      // string compartido — descarta el bug de "todas las páginas comparten
      // una sola meta description" (regresión plausible si alguien pasa
      // `messages.home.meta` a todas las páginas por accidente).
      await page.goto('/en/contact/');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        'Get in touch with EnduroFun to plan your guided enduro trip near Álora, Málaga — ask us for a personalised offer.',
      );

      await page.goto('/de/contact/');
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        'Kontaktieren Sie EnduroFun, um Ihre geführte Enduro-Tour in der Nähe von Álora, Málaga zu planen — fragen Sie nach einem individuellen Angebot.',
      );
    },
  );

  test(
    '/sitemap.xml lista las 18 URLs (6 páginas × 3 idiomas)',
    { tag: ['@f3'] },
    async ({ page }) => {
      const response = await page.request.get('/sitemap.xml');
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('xml');

      const body = await response.text();
      const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      expect(locs).toHaveLength(18);

      // Un URL por combinación página×locale — cuenta exacta, sin duplicados
      // ni huecos. `/` (redirección meta-refresh) NO es una de ellas (ver
      // `lib/nav-links.ts` NAV_LINKS + decisión documentada en `sitemap.ts`).
      // Slugs con la barra final ya incluida (o vacíos para la raíz del
      // locale) — evita un condicional dentro del test (lint
      // `playwright/no-conditional-in-test`).
      const trailingSlugs = ['', 'gallery/', 'packages/', 'about/', 'contact/', 'reviews/'];
      for (const locale of ['en', 'es', 'de']) {
        for (const slug of trailingSlugs) {
          expect(locs).toContain(`https://endurofun.eu/${locale}/${slug}`);
        }
      }

      // Cada `<url>` lleva sus 3 anotaciones xhtml:link de idioma cruzadas —
      // el equivalente de sitemap a los hreflang del <head>.
      const xhtmlLinks = [...body.matchAll(/<xhtml:link[^>]*hreflang="([a-z]{2})"/g)];
      expect(xhtmlLinks).toHaveLength(18 * 3);
    },
  );
});
