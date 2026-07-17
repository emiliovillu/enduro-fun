// vitest.config.ts (raíz del monorepo) — testing/references/stack-setup.md §3.1
// Sin proyecto `integration` (no hay Postgres) ni `live` (no hay APIs de pago).
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['{packages,apps}/*/vitest.config.ts'],
  },
});
