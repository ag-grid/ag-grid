import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: { target: 'esnext' },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
        reporters: ['default'],
        watch: false,
        pool: 'threads',
        root: path.resolve(__dirname, '../..'),
        dir: __dirname,
        include: ['src/**/*.test.ts'],
        css: false,
    },
});
