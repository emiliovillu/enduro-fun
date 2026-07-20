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

test('la sección de galería es visible y navegable', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/');
  const gallery = page.getByRole('region', { name: 'A taste of the terrain' });
  await gallery.scrollIntoViewIfNeeded();
  await expect(gallery).toBeVisible();

  const dots = gallery.getByRole('button', { name: /^\d\/5$/ });
  await expect(dots).toHaveCount(5);
  await expect(dots.first()).toHaveAttribute('aria-current', 'true');

  await dots.nth(2).click();
  await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');

  const pauseButton = gallery.getByRole('button', { name: 'Pause gallery autoplay' });
  await expect(pauseButton).toBeVisible();
  await pauseButton.click();
  await expect(gallery.getByRole('button', { name: 'Resume gallery autoplay' })).toBeVisible();
});

// Control negativo (bug real reportado por el usuario, 2026-07-19): el
// avance automático del carrusel usaba `card.scrollIntoView()`, que puede
// escalar a CUALQUIER ancestro scrolleable — incluida la página entera — si
// decide que la tarjeta "no está visible" (p. ej. el usuario ya bajó a leer
// Reviews mientras el autoplay seguía en marcha), tirando al usuario de
// vuelta a la galería en cada tick. Fix: `track.scrollTo()` sobre el propio
// contenedor del carrusel, nunca sobre la tarjeta. Este test falla si el bug
// se reintroduce (verificado reintroduciendo `scrollIntoView` antes de fijar
// el fix: el test se puso en rojo).
test(
  'el autoplay del carrusel no mueve el scroll de la página',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/');
    // Simula al usuario leyendo una sección posterior a la galería mientras
    // el autoplay sigue avanzando solo.
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.8);
    });
    const scrollBefore = await page.evaluate(() => window.scrollY);

    // Espera a que el autoplay haga avanzar al menos un slide (poll real
    // sobre el dot activo, no un `waitForTimeout` a ciegas).
    const gallery = page.getByRole('region', { name: 'A taste of the terrain' });
    await expect(gallery.getByRole('button', { name: '2/5' })).toHaveAttribute(
      'aria-current',
      'true',
      { timeout: 6000 },
    );

    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBe(scrollBefore);
  },
);

// Hotfix 2026-07-20: en mobile el nav de 5 enlaces se desbordaba y partía
// en dos líneas (captura real del usuario) — el Header colapsa detrás de
// un botón hamburguesa por debajo de `lg` (1024px). 2ª iteración, mismo
// día: el panel pasa de dropdown a drawer deslizante desde la derecha.
test(
  'en mobile el nav colapsa detrás de un botón hamburguesa',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en/');

    const menuButton = page.getByRole('button', { name: 'Open menu' });
    await expect(menuButton).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();

    await menuButton.click();
    const closeButton = page.getByRole('button', { name: 'Close menu' });
    await expect(closeButton).toBeVisible();
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Packages' })).toBeVisible();

    // Control negativo (bug real cazado al verificar visualmente antes de
    // cerrar el hotfix): un elemento SIN `position` propio siempre pinta
    // por DEBAJO de cualquier descendiente posicionado con z-index dentro
    // del mismo contexto de apilamiento — el botón "Close menu" quedaba
    // tapado por el propio drawer (`fixed z-40`) pese a que el `<header>`
    // tenía `z-50`, porque ese z-50 solo compite con los HERMANOS del
    // header, no gobierna el orden ENTRE sus hijos. Un `.click()` real de
    // Playwright sobre un botón tapado falla la comprobación de
    // "receives pointer events" — este assert es el que lo habría cazado
    // (Escape por sí solo no ejercita el botón real).
    await closeButton.click();
    await expect(menuButton).toBeVisible();
    await expect(nav).toBeHidden();

    // Escape también cierra (accesibilidad de teclado).
    await menuButton.click();
    await expect(closeButton).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menuButton).toBeVisible();
  },
);

test(
  'en desktop el nav se muestra en una fila, sin botón hamburguesa',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/');
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden();
  },
);

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
