import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        root: thisDir,
        dir: path.resolve(thisDir, 'src'),
        include: ['**/*.test.ts'],
        watch: false,
        reporters: ['basic'],
        // Converting the full public API with TypeDoc takes several seconds per package.
        testTimeout: 120_000,
    },
});
