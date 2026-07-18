import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'web:unit',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    environment: 'node',
    // El control negativo de i18n invoca `next build` de verdad (T0.2) —
    // más lento que un test unitario normal, pero determinista y gratis:
    // se queda en `pnpm test` (gate) para proteger el invariante para
    // siempre, con timeout propio en vez de inflar el global.
    testTimeout: 60_000,
  },
});
