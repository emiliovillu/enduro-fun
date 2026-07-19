import { test, expect } from '@playwright/test';

// T0.2 — i18n estático. El control negativo (quitar una clave de de.json
// rompe `pnpm build`) NO vive aquí: se prueba invocando `pnpm build` sobre
// un fixture, ver apps/web/src/i18n/messages.build-negative.test.ts.

// Los textos exactos ("Hello EnduroFun" placeholder de F0) cambiaron en T1.1
// (Home real, hero cinemático) — se actualizan aquí a los del hero real
// (mismas claves `home.title`/`home.subtitle`, solo cambió el contenido).

test('la raíz redirige a /en/ (meta-refresh, sin JS)', { tag: ['@f0'] }, async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Ride the wild heart of Andalucía',
  );
});

test('/es/ sirve el contenido en español', { tag: ['@f0'] }, async ({ page }) => {
  await page.goto('/es/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Vive el corazón salvaje de Andalucía',
  );
});

test('/de/ sirve el contenido en alemán', { tag: ['@f0'] }, async ({ page }) => {
  await page.goto('/de/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Erlebe das wilde Herz Andalusiens',
  );
});

test(
  'el LanguageSwitcher navega realmente entre /en, /es y /de',
  { tag: ['@f0'] },
  async ({ page }) => {
    await page.goto('/en/');
    // Home (T1.1) monta Header Y Footer, cada uno con su propio
    // LanguageSwitcher (`nav[aria-label="Language"]`) — `.first()` escoge el
    // del Header (visible sin scroll), evitando la violación de modo
    // estricto de Playwright ante los 2 matches.
    const switcher = page.getByRole('navigation', { name: 'Language' }).first();
    await expect(switcher).toBeVisible();

    await switcher.getByRole('link', { name: 'ES' }).click();
    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Vive el corazón salvaje de Andalucía',
    );

    await switcher.getByRole('link', { name: 'DE' }).click();
    await expect(page).toHaveURL(/\/de\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Erlebe das wilde Herz Andalusiens',
    );

    await switcher.getByRole('link', { name: 'EN' }).click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Ride the wild heart of Andalucía',
    );
  },
);
