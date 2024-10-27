// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        'tests/**/*',
        '__mocks__/**/*',
      ],
    },
    globals: true,
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 10000,
  },
});
