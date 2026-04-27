import { defineConfig } from 'vitest/config';

const reporters: string[] = ['default'];
if (process.env.CI != null) {
    reporters.push('junit');
}

export default defineConfig({
    test: {
        globals: true,
        include: ['src/**/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        watch: false,
        reporters,
        outputFile: {
            junit: '../../reports/ag-grid-generate-example-files.xml',
        },
    },
});
