import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/simulation/**/*.test.ts'],
    reporters: ['verbose'],
    testTimeout: 20_000,
  },
});
