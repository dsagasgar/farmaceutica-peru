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
