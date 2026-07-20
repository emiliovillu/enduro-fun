import { test, expect } from '@playwright/test';

// T2.1 — Página Packages. Verifica que las 2 cards (Getaway/Full Adventure)
// renderizan con precio y features en los 3 idiomas, y que el badge
// "Most popular" (traducido) aparece sobre Full Adventure, no sobre Getaway
// — mismo criterio que `home.spec.ts` ('la preview de packages... renderiza')
// pero contra la página dedicada, con el precio y las features completas.

test('/en/packages muestra las 2 cards completas en inglés', { tag: ['@f2'] }, async ({ page }) => {
  await page.goto('/en/packages/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Two ways to ride');

  const getaway = page.getByRole('heading', { name: 'Getaway' }).locator('..');
  await expect(getaway).toContainText('From 1,290 €');
  await expect(getaway).toContainText('4 nights, breakfast included');
  await expect(getaway).toContainText('3 days of guided route on a Husqvarna enduro bike');
  await expect(getaway).toContainText('Bike, fuel and local guide included');

  const fullAdventure = page.getByRole('heading', { name: 'Full Adventure' }).locator('..');
  await expect(fullAdventure).toContainText('From 1,690 €');
  await expect(fullAdventure).toContainText('6 nights, breakfast included');
  await expect(fullAdventure).toContainText('2 route days + rest day + 2 route days');
  await expect(fullAdventure).toContainText('Rest day option: Caminito del Rey or Málaga old town');

  await expect(page.getByText('Adventure bike options available on route days')).toBeVisible();
});

test(
  'el badge "Most popular" aparece sobre Full Adventure, no sobre Getaway',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/en/packages/');

    const fullAdventureCard = page
      .getByRole('heading', { name: 'Full Adventure' })
      .locator('..')
      .locator('..');
    await expect(fullAdventureCard.getByText('Most popular')).toBeVisible();

    const getawayCard = page.getByRole('heading', { name: 'Getaway' }).locator('..').locator('..');
    await expect(getawayCard.getByText('Most popular')).toHaveCount(0);
  },
);

test(
  '/es/packages muestra las 2 cards completas en español',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/es/packages/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dos formas de rodar');

    const getaway = page.getByRole('heading', { name: 'Escapada' }).locator('..');
    // `Intl.NumberFormat('es')` no agrupa números de 4 cifras con un único
    // dígito en el grupo principal (`minimumGroupingDigits` de CLDR para
    // `es`) — "1290" sin separador, no "1.290". Mismo comportamiento ya
    // presente en la preview de Home (T1.1) con el mismo `priceFormatter`;
    // verificado contra el HTML generado (`out/es/packages/index.html`), no
    // asumido.
    await expect(getaway).toContainText('Desde 1290 €');
    await expect(getaway).toContainText('4 noches, desayuno incluido');

    const fullAdventure = page.getByRole('heading', { name: 'Aventura Completa' }).locator('..');
    await expect(fullAdventure).toContainText('Desde 1690 €');
    await expect(fullAdventure).toContainText('6 noches, desayuno incluido');

    await expect(page.getByText('Más popular')).toBeVisible();
    await expect(
      page.getByText('Opciones de moto de trail disponibles en los días de ruta'),
    ).toBeVisible();
  },
);

test('/de/packages muestra las 2 cards completas en alemán', { tag: ['@f2'] }, async ({ page }) => {
  await page.goto('/de/packages/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Zwei Arten zu fahren');

  const getaway = page.getByRole('heading', { name: 'Kurztrip' }).locator('..');
  await expect(getaway).toContainText('Ab 1.290 €');
  await expect(getaway).toContainText('4 Nächte, Frühstück inklusive');

  const fullAdventure = page.getByRole('heading', { name: 'Volles Abenteuer' }).locator('..');
  await expect(fullAdventure).toContainText('Ab 1.690 €');
  await expect(fullAdventure).toContainText('6 Nächte, Frühstück inklusive');

  await expect(page.getByText('Am beliebtesten')).toBeVisible();
  await expect(
    page.getByText('An den Routentagen sind Adventure-Bike-Optionen verfügbar'),
  ).toBeVisible();
});

test(
  'el nav del Header marca "Packages" como página activa',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/en/packages/');

    const packagesLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'Packages',
    });
    await expect(packagesLink).toHaveAttribute('aria-current', 'page');
  },
);

// Hotfix — tercera card "Ride your own bike" (servicio de almacenamiento/
// transporte/taller, sin noches/días/precio fijo): verifica que se muestra
// junto a las 2 rutas guiadas, con su subtitle/precio propios (no la
// plantilla de noches/días), y que el CTA navega a /contact igual que las
// otras 2 cards.
test(
  'la 3ª card "Ride your own bike" se muestra con su propio subtitle/precio',
  { tag: ['@f2'] },
  async ({ page }) => {
    await page.goto('/en/packages/');

    const ownBikeCard = page
      .getByRole('heading', { name: 'Ride your own bike' })
      .locator('..')
      .locator('..');
    await expect(ownBikeCard).toContainText('Storage · Transport · Workshop');
    await expect(ownBikeCard).toContainText('Ask for pricing');
    await expect(ownBikeCard).toContainText('Storage with our own workshop');
    await expect(ownBikeCard).toContainText('Airport pickup service');

    const ownBikeCta = ownBikeCard.getByRole('link', { name: 'Enquire' });
    await ownBikeCta.click();
    await expect(page).toHaveURL(/\/en\/contact\/$/);
  },
);
