import { defineConfig } from 'vitest/config';

process.env.TZ = 'UTC';

const reporters: string[] = ['default'];
if (process.env.CI != null) {
    reporters.push('junit');
}

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.ts'],
        exclude: ['**/node_modules/**', '**/dist/**'],
        css: false,
        watch: false,
        reporters,
        outputFile: {
            junit: '../../reports/ag-stack.xml',
        },
    },
});
