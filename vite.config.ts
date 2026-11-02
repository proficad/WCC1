/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    // model/ and editor/ are DOM-free (PRD T2), so plain Node is enough.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
