import { defineConfig } from 'vitest/config';

export default defineConfig({
    root: __dirname,
    test: {
        environment: 'node',
        pool: 'threads',
        include: ['scripts/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
        // Each watch test spawns real processes and waits on builds that take seconds.
        testTimeout: 60_000,
        reporters: ['default'],
        coverage: { reportsDirectory: '../../coverage/ag-shared', provider: 'v8' },
    },
});
