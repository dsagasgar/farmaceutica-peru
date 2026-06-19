/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['node_modules/zone.js/fesm2022/zone-testing.bundle.js', 'src/test.ts'],
    include: ['src/**/*.spec.ts'],
  },
});
