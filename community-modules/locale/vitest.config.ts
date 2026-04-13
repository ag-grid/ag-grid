import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: { target: 'esnext' },
    test: {
        globals: true,
        environment: 'node',
        reporters: ['default'],
        watch: false,
        pool: 'threads',
        root: path.resolve(__dirname, '../..'),
        dir: __dirname,
        include: ['src/**/*.test.ts'],
    },
});
