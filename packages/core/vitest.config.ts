import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'core:unit',
    include: ['src/**/*.test.ts'],
    exclude: ['**/*.live.test.ts', '**/node_modules/**'],
    environment: 'node',
  },
});
