import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    esbuild: { target: 'esnext' },
    resolve: {
        alias: [
            {
                // _copiedFromCore files are gitignored copies generated from ag-grid-community source.
                // Redirect them directly to the community source to avoid requiring the generation step.
                find: /^.*\/_copiedFromCore\/(.*)/,
                replacement: path.resolve(__dirname, '../../packages/ag-grid-community/src/$1'),
            },
        ],
    },
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
