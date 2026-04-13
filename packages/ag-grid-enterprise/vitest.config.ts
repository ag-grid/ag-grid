import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: { target: 'esnext' },
    resolve: {
        alias: {
            'ag-grid-community': path.resolve(__dirname, '../ag-grid-community/src/main.ts'),
        },
    },
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
