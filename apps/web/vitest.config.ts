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
    // T2.1: un 2º control negativo de build (`data/packages.build-negative`)
    // se suma al de i18n (`i18n/messages.build-negative`) — ambos mutan un
    // fichero DISTINTO pero invocan `pnpm --filter @app/web build` sobre el
    // MISMO paquete/`.next`. En paralelo (default de Vitest, un worker por
    // fichero de test) colisionan: el build de uno puede arrancar mientras
    // el fichero mutado por el otro sigue roto, produciendo un fallo cruzado
    // que no tiene nada que ver con la mutación de ese test (visto en vivo
    // al añadir el 2º control negativo). `fileParallelism: false` serializa
    // los ficheros de test — con solo 2 controles negativos de build en todo
    // `apps/web`, el coste de tiempo es aceptable frente a la alternativa
    // (falsos negativos por colisión de build compartido).
    fileParallelism: false,
  },
});
