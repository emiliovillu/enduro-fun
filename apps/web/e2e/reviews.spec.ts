import { test, expect } from '@playwright/test';

// T2.2 — Página Reviews. Verifica que el grid renderiza TODAS las reviews
// de `apps/web/src/data/reviews.ts` (6 tras esta tarea) con su rating
// correcto (★/☆) en los 3 idiomas — mismo criterio que `packages.spec.ts`
// (T2.1) pero contando estrellas en vez de precio/features.

const REVIEWS_EN = [
  {
    name: 'Marcus',
    country: 'Germany',
    rating: 5,
    text: "Local knowledge you can't get from a map",
  },
  { name: 'James', country: 'United Kingdom', rating: 5, text: 'Great mix of proper trails' },
  { name: 'Sophie', country: 'United Kingdom', rating: 4, text: 'Well organised from the airport' },
  {
    name: 'Lars',
    country: 'Sweden',
    rating: 5,
    text: 'The guides know every inch of that terrain',
  },
  { name: 'Elena', country: 'Italy', rating: 5, text: 'Six days, zero regrets' },
  { name: 'Tom', country: 'Netherlands', rating: 4, text: 'Bike was well maintained' },
];

test(
  '/en/reviews muestra las 6 reviews con su rating correcto',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/en/reviews/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText("From riders who've been");

    for (const review of REVIEWS_EN) {
      const card = page.getByText(review.text).locator('..');
      await expect(card).toContainText(review.name);
      await expect(card).toContainText(review.country);
      const stars = card.getByRole('img', { name: `${String(review.rating)} out of 5 stars` });
      await expect(stars).toBeVisible();
    }
  },
);

test(
  '/es/reviews muestra el mismo conjunto de 6 reviews traducido',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/es/reviews/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'De riders que ya han estado aquí',
    );

    // Nombre/país no se traducen (son datos, no copy) — el texto sí.
    for (const name of ['Marcus', 'James', 'Sophie', 'Lars', 'Elena', 'Tom']) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(
      page.getByText('Conocimiento local que no se encuentra en ningún mapa'),
    ).toBeVisible();
    await expect(page.getByText('La moto estaba bien mantenida')).toBeVisible();
  },
);

test(
  '/de/reviews muestra el mismo conjunto de 6 reviews traducido',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/de/reviews/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Von Fahrern, die schon dort waren',
    );

    for (const name of ['Marcus', 'James', 'Sophie', 'Lars', 'Elena', 'Tom']) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(page.getByText('Lokales Wissen, das man auf keiner Karte findet')).toBeVisible();
    await expect(page.getByText('Das Motorrad war gut gewartet')).toBeVisible();
  },
);

test(
  'el grid renderiza las 6 ReviewCard (mismo conteo que el data file)',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/en/reviews/');

    const cards = page.locator('[data-slot="review-card"]');
    await expect(cards).toHaveCount(6);
  },
);

test('el nav del Header marca "Reviews" como página activa', { tag: ['@f2'] }, async ({ page }) => {
  await page.goto('/en/reviews/');

  const reviewsLink = page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Reviews' });
  await expect(reviewsLink).toHaveAttribute('aria-current', 'page');
});
