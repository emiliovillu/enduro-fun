import { test, expect } from '@playwright/test';

// T1.2 — Página About. Verifica que la página carga en los 3 idiomas con su
// contenido traducido y que el nav del Header marca "about" como activo
// (mismo criterio de `aria-current="page"` que usa Header.tsx).

test('/en/about carga con el contenido en inglés', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/about/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Local knowledge, real trails',
  );
  await expect(page.getByRole('heading', { name: 'Riders first, guides by trade' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local knowledge', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Varied terrain', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cultural offering', exact: true })).toBeVisible();
  await expect(page.getByText('Beginner')).toBeVisible();
  await expect(page.getByText('Intermediate')).toBeVisible();
  await expect(page.getByText('Advanced')).toBeVisible();
});

test('/es/about carga con el contenido en español', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/es/about/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Conocimiento local, rutas de verdad',
  );
  await expect(
    page.getByRole('heading', { name: 'Conocimiento local', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Principiante')).toBeVisible();
});

test('/de/about carga con el contenido en alemán', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/de/about/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Lokales Wissen, echte Trails',
  );
  await expect(page.getByRole('heading', { name: 'Lokales Wissen', exact: true })).toBeVisible();
  await expect(page.getByText('Anfänger')).toBeVisible();
});

test('el nav del Header marca "About" como página activa', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/about/');

  const aboutLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
    name: 'About',
  });
  await expect(aboutLink).toHaveAttribute('aria-current', 'page');
});
