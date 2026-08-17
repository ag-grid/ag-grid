import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        pool: 'threads',
        globals: true,
        environment: 'node',
        root: thisDir,
        dir: path.resolve(thisDir, 'src'),
        include: ['**/*.test.ts'],
        watch: false,
        // The `basic` reporter v3 removed: the live per-file tree off, the end-of-run totals still on.
        reporters: [['default', { summary: false }]],
        // Converting the full public API with TypeDoc takes several seconds per package.
        testTimeout: 120_000,
    },
});
