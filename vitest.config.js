import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'coverage/',
        '*.config.js',
        'sw.js'
      ]
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  define: {
    global: 'globalThis'
  }
});