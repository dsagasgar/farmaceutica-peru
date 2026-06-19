<<<<<<< HEAD
import { defineConfig } from 'vitest/config';
import { resolve, relative } from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'resolve-relative-paths',
      configResolved(resolvedConfig) {
        if (resolvedConfig.test && resolvedConfig.test.include) {
          const projectRoot = resolve(process.cwd());
          resolvedConfig.test.include = resolvedConfig.test.include.map(pattern => {
            const absolutePattern = resolve(pattern);
            let relativePath = relative(projectRoot, absolutePattern).replace(/\\/g, '/');
            return relativePath;
          });
          console.log('Successfully relativized include patterns:', resolvedConfig.test.include);
        }
      }
    }
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
  },
});
=======
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
>>>>>>> 0652eeafdcae90cc961c68f508293576b946145a
