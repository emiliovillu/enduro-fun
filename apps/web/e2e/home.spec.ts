import { test, expect } from '@playwright/test';

// T1.1 — Home real. `/packages` y `/contact` no existen todavía (llegan en
// F1/F2): los tests de CTA comprueban la INTENCIÓN del enlace (href /
// navegación intentada hacia la ruta esperada), no que la página de destino
// cargue con éxito — decisión documentada en el brief de la tarea, la misma
// que ya usa el `i18n.spec.ts` de T0.2 para el LanguageSwitcher.

test('el hero, tagline y CTAs de Home son visibles', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Ride the wild heart of Andalucía',
  );
  await expect(page.getByRole('img', { name: 'EnduroFun' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View packages' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get in touch' })).toBeVisible();
});

test('el CTA "View packages" apunta a /en/packages/', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/');
  const cta = page.getByRole('link', { name: 'View packages' });
  await expect(cta).toHaveAttribute('href', '/en/packages/');
});

test('el CTA "Get in touch" apunta a /en/contact/', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/');
  const cta = page.getByRole('link', { name: 'Get in touch' });
  await expect(cta).toHaveAttribute('href', '/en/contact/');
});

test('la preview de packages y reviews renderiza', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/');

  await expect(page.getByRole('heading', { name: 'Getaway' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Full Adventure' })).toBeVisible();
  await expect(page.getByText('Most popular')).toBeVisible();

  await expect(page.getByText('Marcus')).toBeVisible();
  await expect(page.getByText('James')).toBeVisible();
  await expect(page.getByText('Sophie')).toBeVisible();
});

test(
  'el LanguageSwitcher cambia de idioma conservando la página (Home)',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/');
    const switcher = page.getByRole('navigation', { name: 'Language' }).first();

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
  },
);
