import { test, expect } from '@playwright/test';

// T0.2 — i18n estático. El control negativo (quitar una clave de de.json
// rompe `pnpm build`) NO vive aquí: se prueba invocando `pnpm build` sobre
// un fixture, ver apps/web/src/i18n/messages.build-negative.test.ts.

test('la raíz redirige a /en/ (meta-refresh, sin JS)', { tag: ['@f0'] }, async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hello EnduroFun');
});

test('/es/ sirve el contenido en español', { tag: ['@f0'] }, async ({ page }) => {
  await page.goto('/es/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hola EnduroFun');
});

test('/de/ sirve el contenido en alemán', { tag: ['@f0'] }, async ({ page }) => {
  await page.goto('/de/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Hallo EnduroFun');
});

test(
  'el LanguageSwitcher navega realmente entre /en, /es y /de',
  { tag: ['@f0'] },
  async ({ page }) => {
    await page.goto('/en/');
    const switcher = page.getByRole('navigation', { name: 'Language' });
    await expect(switcher).toBeVisible();

    await switcher.getByRole('link', { name: 'ES' }).click();
    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hola EnduroFun');

    await switcher.getByRole('link', { name: 'DE' }).click();
    await expect(page).toHaveURL(/\/de\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hallo EnduroFun');

    await switcher.getByRole('link', { name: 'EN' }).click();
    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hello EnduroFun');
  },
);
