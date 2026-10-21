import { defineConfig } from 'vitest/config';

export default defineConfig({
    root: import.meta.dirname,
    test: {
        name: 'eslint-rules',
        globals: true,
        environment: 'node',
        pool: 'threads',
        include: ['*.test.mjs'],
        reporters: ['default'],
    },
});
