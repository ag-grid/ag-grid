import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        pool: 'threads',
        globals: true,
        include: ['e2e/**/*.test.ts'],
        watch: false,
    },
});
