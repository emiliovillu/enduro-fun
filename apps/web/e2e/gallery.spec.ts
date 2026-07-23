import { test, expect } from '@playwright/test';

// Página Gallery (hotfix, petición directa del usuario). Verifica que la
// página carga en los 3 idiomas con su contenido traducido, que el nav del
// Header marca "gallery" como activo, que el grid arranca con la tanda
// inicial de fotos reales, y que el scroll infinito carga una tanda más al
// llegar al final (sin mockear temporizadores — el delay simulado de carga
// es corto a propósito para que el test sea rápido y determinista).
//
// TD.11 (Lightbox): las miniaturas pasaron de `<div>` a `<button>` para ser
// clicables/operables por teclado — PHOTO_TILE se actualiza en consecuencia.

const PHOTO_TILE = 'button[class*="aspect-square"]';

test('/en/gallery carga con el contenido en inglés', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('A taste of the terrain');
  await expect(page.getByAltText('Enduro trail photo 1', { exact: true })).toBeVisible();
});

test('/es/gallery carga con el contenido en español', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/es/gallery/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Una muestra del terreno');
  await expect(page.getByAltText('Foto de ruta de enduro 1', { exact: true })).toBeVisible();
});

test('/de/gallery carga con el contenido en alemán', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/de/gallery/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Ein Vorgeschmack auf das Gelände',
  );
  await expect(page.getByAltText('Enduro-Trail-Foto 1', { exact: true })).toBeVisible();
});

test('el nav del Header marca "Gallery" como página activa', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  const galleryLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
    name: 'Gallery',
  });
  await expect(galleryLink).toHaveAttribute('aria-current', 'page');
});

test('el grid arranca con 25 fotos', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  await expect(page.locator(PHOTO_TILE)).toHaveCount(25);
});

test(
  'el scroll infinito carga una tanda más al llegar al final del grid',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');
    await expect(page.locator(PHOTO_TILE)).toHaveCount(25);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await expect(page.locator(PHOTO_TILE)).toHaveCount(40, { timeout: 5000 });
  },
);

// TD.11 — Lightbox: clicar una foto del grid abre un visor a pantalla
// completa con overlay/scrim detrás. Un solo `Lightbox` compartido (T
// controlado desde `GalleryGrid`) recibe la foto clicada; se prueban dos
// fotos distintas para confirmar que el índice viaja correctamente, no solo
// la primera.
test(
  'click en una foto abre el lightbox con overlay y la imagen correspondiente',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');

    await page.getByRole('button', { name: 'Enduro trail photo 5' }).click();
    const dialog = page.getByRole('dialog', { name: 'Enduro trail photo 5' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.locator('[data-slot="lightbox-backdrop"]')).toBeVisible();
    await expect(dialog.getByAltText('Enduro trail photo 5', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Close image viewer' }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('button', { name: 'Enduro trail photo 12' }).click();
    const dialog2 = page.getByRole('dialog', { name: 'Enduro trail photo 12' });
    await expect(dialog2.getByAltText('Enduro trail photo 12', { exact: true })).toBeVisible();
  },
);

test(
  'Escape cierra el lightbox y devuelve el foco a la miniatura clicada',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');

    const thumbnail = page.getByRole('button', { name: 'Enduro trail photo 3' });
    await thumbnail.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(thumbnail).toBeFocused();
  },
);

test(
  'click en el overlay fuera de la imagen cierra el lightbox',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');

    await page.getByRole('button', { name: 'Enduro trail photo 1', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Esquina superior-izquierda del viewport: fuera de la caja del Popup
    // (`inset-6`/`inset-10`) y muy lejos del centro donde se pinta la foto —
    // aterriza en el scrim (`data-slot="lightbox-backdrop"`).
    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).toBeHidden();
  },
);

test(
  'el foco queda atrapado dentro del lightbox mientras está abierto',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');

    await page.getByRole('button', { name: 'Enduro trail photo 1', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press('Tab');
      // El propio mecanismo de focus-trap de Base UI usa "focus guards"
      // (`<span data-base-ui-focus-guard>`) FUERA del Popup para atrapar el
      // Tab en los bordes y redirigirlo de vuelta dentro — son parte del
      // trap, no una fuga (por eso también cuentan como "dentro" a efectos
      // de este assert). Lo que el test realmente descarta es que el foco
      // llegue a contenido real de la página detrás del diálogo (aquí, una
      // miniatura del grid).
      const focusTrapped = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return false;
        if (el.closest('[data-slot="lightbox"]')) return true;
        return 'baseUiFocusGuard' in (el as HTMLElement).dataset;
      });
      expect(focusTrapped).toBe(true);
      const focusOnThumbnail = await page.evaluate(
        () => document.activeElement?.className.includes('aspect-square') ?? false,
      );
      expect(focusOnThumbnail).toBe(false);
    }
  },
);

// TD.13 — navegación anterior/siguiente: flechas de ratón + teclado
// (ArrowLeft/ArrowRight), sin wrap-around (primera/última foto sin el botón
// correspondiente).
test('el botón "siguiente" avanza a la foto correcta', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  await page.getByRole('button', { name: 'Enduro trail photo 5', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByAltText('Enduro trail photo 5', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Next photo' }).click();
  await expect(dialog.getByAltText('Enduro trail photo 6', { exact: true })).toBeVisible();
});

test('el botón "anterior" retrocede a la foto correcta', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/gallery/');

  await page.getByRole('button', { name: 'Enduro trail photo 5', exact: true }).click();
  const dialog = page.getByRole('dialog');

  await page.getByRole('button', { name: 'Previous photo' }).click();
  await expect(dialog.getByAltText('Enduro trail photo 4', { exact: true })).toBeVisible();
});

test(
  'ArrowRight y ArrowLeft del teclado navegan igual que los botones, sin perder el foco atrapado',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');

    await page.getByRole('button', { name: 'Enduro trail photo 5', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByAltText('Enduro trail photo 6', { exact: true })).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByAltText('Enduro trail photo 5', { exact: true })).toBeVisible();

    // Foco sigue dentro del lightbox tras navegar por teclado (no escapó al
    // resto de la página).
    const focusTrapped = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;
      if (el.closest('[data-slot="lightbox"]')) return true;
      return 'baseUiFocusGuard' in (el as HTMLElement).dataset;
    });
    expect(focusTrapped).toBe(true);
  },
);

test(
  'la primera foto no tiene botón "anterior" y la última no tiene botón "siguiente"',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.goto('/en/gallery/');

    await page.getByRole('button', { name: 'Enduro trail photo 1', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Previous photo' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Next photo' })).toBeVisible();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Enduro trail photo 1', exact: true }).click();
    // Navega desde la foto 1 hasta la última (122) pulsando ArrowRight 121
    // veces: comprueba el límite superior real sin depender de que el grid
    // ya haya cargado esa miniatura (el scroll infinito solo carga 25-40).
    for (let i = 0; i < 121; i += 1) {
      await page.keyboard.press('ArrowRight');
    }
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByAltText('Enduro trail photo 122', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next photo' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Previous photo' })).toBeVisible();
  },
);
