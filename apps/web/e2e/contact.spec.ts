import { test, expect } from '@playwright/test';

// T1.3 — Página Contact. Verifica que la página carga en los 3 idiomas con
// su contenido traducido, que el nav del Header marca "contact" como
// activo, que el formulario válida los campos requeridos, y el flujo de
// envío completo interceptando el POST al endpoint de Formspree con
// `page.route()` (regla 10 del planning: nunca el endpoint real en CI) —
// se comprueba tanto el estado de éxito (200 simulado) como el de error
// (respuesta no-ok simulada). El mapa embebido (`MapEmbed interactive`,
// iframe real sin API key — ver map-embed.tsx) se comprueba presente en el
// DOM, sin verificar contenido de terceros (regla 10 del planning).

const FORMSPREE_PATTERN = '**/f/mykrjbra';

test('/en/contact carga con el contenido en inglés', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/contact/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ask for a custom quote');
  await expect(page.getByLabel('Name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Message')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
  await expect(page.getByText('Find us', { exact: true })).toBeVisible();
});

test('/es/contact carga con el contenido en español', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/es/contact/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Pide un presupuesto personalizado',
  );
  await expect(page.getByLabel('Nombre')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar mensaje' })).toBeVisible();
});

test('/de/contact carga con el contenido en alemán', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/de/contact/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Individuelles Angebot anfragen',
  );
  await expect(page.getByLabel('Name')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Nachricht senden' })).toBeVisible();
});

test('el nav del Header marca "Contact" como página activa', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/contact/');

  const contactLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
    name: 'Contact',
  });
  await expect(contactLink).toHaveAttribute('aria-current', 'page');
});

test('el mapa embebido está presente en el DOM', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/contact/');

  await expect(page.locator('iframe[title^="Google Maps"]')).toBeVisible();
});

test('los 3 campos del formulario son requeridos', { tag: ['@f1'] }, async ({ page }) => {
  await page.goto('/en/contact/');

  await expect(page.getByLabel('Name')).toHaveAttribute('required', '');
  await expect(page.getByLabel('Email')).toHaveAttribute('required', '');
  await expect(page.getByLabel('Message')).toHaveAttribute('required', '');
});

test('envío correcto muestra el mensaje de éxito', { tag: ['@f1'] }, async ({ page }) => {
  await page.route(FORMSPREE_PATTERN, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto('/en/contact/');
  await page.getByLabel('Name').fill('Jane Rider');
  await page.getByLabel('Email').fill('jane@example.com');
  await page.getByLabel('Message').fill('Group of 4, mid-September, intermediate level.');
  await page.getByRole('button', { name: 'Send message' }).click();

  await expect(
    page.getByText("Thanks — your message is on its way. We'll get back to you soon."),
  ).toBeVisible();
});

test(
  'envío fallido muestra el mensaje de error y deja el formulario reintentable',
  { tag: ['@f1'] },
  async ({ page }) => {
    await page.route(FORMSPREE_PATTERN, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false }),
      });
    });

    await page.goto('/en/contact/');
    await page.getByLabel('Name').fill('Jane Rider');
    await page.getByLabel('Email').fill('jane@example.com');
    await page.getByLabel('Message').fill('Group of 4, mid-September, intermediate level.');
    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(
      page.getByText('Something went wrong sending your message. Please try again in a moment.'),
    ).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send message' })).toBeVisible();
  },
);
