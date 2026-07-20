import { test, expect } from '@playwright/test';

// Página Gallery (hotfix, petición directa del usuario). Verifica que la
// página carga en los 3 idiomas con su contenido traducido, que el nav del
// Header marca "gallery" como activo, que el grid arranca con la tanda
// inicial de tarjetas placeholder, y que el scroll infinito carga una tanda
// más al llegar al final (sin mockear temporizadores — el delay simulado de
// carga es corto a propósito para que el test sea rápido y determinista).

const PLACEHOLDER_TILE = 'div[class*="aspect-square"]';

test('/en/gallery carga con el contenido en inglés', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('A taste of the terrain');
  await expect(page.getByText('Photo placeholder — route 1', { exact: true })).toBeVisible();
});

test('/es/gallery carga con el contenido en español', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/es/gallery/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Una muestra del terreno');
  await expect(page.getByText('Foto de ejemplo — ruta 1', { exact: true })).toBeVisible();
});

test('/de/gallery carga con el contenido en alemán', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/de/gallery/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Ein Vorgeschmack auf das Gelände',
  );
  await expect(page.getByText('Fotoplatzhalter — Route 1', { exact: true })).toBeVisible();
});

test('el nav del Header marca "Gallery" como página activa', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  const galleryLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
    name: 'Gallery',
  });
  await expect(galleryLink).toHaveAttribute('aria-current', 'page');
});

test('el grid arranca con 25 tarjetas placeholder', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  await expect(page.locator(PLACEHOLDER_TILE)).toHaveCount(25);
});

test(
  'el scroll infinito carga una tanda más al llegar al final del grid',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');
    await expect(page.locator(PLACEHOLDER_TILE)).toHaveCount(25);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await expect(page.locator(PLACEHOLDER_TILE)).toHaveCount(40, { timeout: 5000 });
  },
);
