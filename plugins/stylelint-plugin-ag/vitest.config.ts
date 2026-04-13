import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        reporters: ['default'],
        watch: false,
        pool: 'threads',
        root: path.resolve(__dirname, '../..'),
        dir: __dirname,
        include: ['rules/**/*.test.mjs'],
    },
});
