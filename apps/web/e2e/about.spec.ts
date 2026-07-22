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
  await expect(
    page.getByAltText('One of our guides giving a thumbs up on the trail near Álora'),
  ).toBeVisible();
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

// TD.12 — sección "Nuestra flota": visible en los 3 idiomas, justo después
// de la sección de guías/historia ("Our story") y antes de "What makes us
// different" (orden real del DOM, no solo presencia — los 3 títulos son
// `h2`), con las 3 `FleetCard` (TE 300 / Norden 901 / BMW 1300 GS — la BMW
// añadida 2026-07-23, misma categoría trail-adventure que la Norden)
// mostrando nombre (literal, sin traducir), cilindrada y categoría
// traducida. La categoría "Trail & Adventure"/"Trail y Aventura"/"Trail &
// Abenteuer" aparece 2 veces (Norden + BMW) — se cuenta en vez de asumir un
// único match.
test(
  '/en/about muestra "Our fleet" en la posición correcta con las 3 motos',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/about/');

    const h2Titles = await page.getByRole('heading', { level: 2 }).allTextContents();
    const storyIndex = h2Titles.indexOf('Riders first, guides by trade');
    const fleetIndex = h2Titles.indexOf('The bikes we ride');
    const differentIndex = h2Titles.indexOf('Three things riders notice');
    expect(storyIndex).toBeGreaterThanOrEqual(0);
    expect(fleetIndex).toBeGreaterThan(storyIndex);
    expect(differentIndex).toBeGreaterThan(fleetIndex);

    await expect(page.getByRole('heading', { name: 'Husqvarna TE 300' })).toBeVisible();
    await expect(page.getByText('300cc', { exact: true })).toBeVisible();
    await expect(page.getByText('Enduro', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Husqvarna Norden 901' })).toBeVisible();
    await expect(page.getByText('901cc')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'BMW 1300 GS' })).toBeVisible();
    await expect(page.getByText('1300cc')).toBeVisible();
    await expect(page.getByText('Trail & Adventure')).toHaveCount(2);
  },
);

test(
  '/es/about muestra "Nuestra flota" con las 3 motos y categorías en español',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/es/about/');

    const h2Titles = await page.getByRole('heading', { level: 2 }).allTextContents();
    const storyIndex = h2Titles.indexOf('Motoristas primero, guías de oficio');
    const fleetIndex = h2Titles.indexOf('Las motos con las que rodamos');
    const differentIndex = h2Titles.indexOf('Tres cosas que los motoristas notan');
    expect(fleetIndex).toBeGreaterThan(storyIndex);
    expect(differentIndex).toBeGreaterThan(fleetIndex);

    await expect(page.getByRole('heading', { name: 'Husqvarna TE 300' })).toBeVisible();
    await expect(page.getByText('300cc', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Husqvarna Norden 901' })).toBeVisible();
    await expect(page.getByText('901cc')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'BMW 1300 GS' })).toBeVisible();
    await expect(page.getByText('1300cc')).toBeVisible();
    await expect(page.getByText('Trail y Aventura')).toHaveCount(2);
  },
);

test(
  '/de/about muestra "Unsere Flotte" con las 3 motos y categorías en alemán',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/de/about/');

    const h2Titles = await page.getByRole('heading', { level: 2 }).allTextContents();
    const storyIndex = h2Titles.indexOf('Zuerst Fahrer, dann Guides von Beruf');
    const fleetIndex = h2Titles.indexOf('Die Motorräder, die wir fahren');
    const differentIndex = h2Titles.indexOf('Drei Dinge, die Fahrern auffallen');
    expect(fleetIndex).toBeGreaterThan(storyIndex);
    expect(differentIndex).toBeGreaterThan(fleetIndex);

    await expect(page.getByRole('heading', { name: 'Husqvarna TE 300' })).toBeVisible();
    await expect(page.getByText('300cc', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Husqvarna Norden 901' })).toBeVisible();
    await expect(page.getByText('901cc')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'BMW 1300 GS' })).toBeVisible();
    await expect(page.getByText('1300cc')).toBeVisible();
    await expect(page.getByText('Trail & Abenteuer')).toHaveCount(2);
  },
);
