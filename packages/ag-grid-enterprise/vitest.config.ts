import path from 'path';
import { defineConfig } from 'vitest/config';

process.env.TZ = 'UTC';

const reporters: string[] = ['default'];
if (process.env.CI != null) {
    reporters.push('junit');
}

export default defineConfig({
    resolve: {
        alias: {
            'ag-grid-community': path.resolve(__dirname, '../ag-grid-community/src/main.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        setupFiles: ['./vitest.setup.ts'],
        css: false,
        watch: false,
        reporters,
        outputFile: {
            junit: '../../reports/ag-grid-enterprise.xml',
        },
    },
});
