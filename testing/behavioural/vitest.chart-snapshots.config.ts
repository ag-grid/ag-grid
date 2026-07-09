import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

import { createReactAliases, loadSourceCodeAliases } from './vitest.source-aliases';

// Separate from vitest.config.ts on purpose: chart-snapshot tests render via a real Skia
// rasterizer, whose text/AA output is not pixel-identical across host OSes, so they must only
// ever run inside the pinned Linux container (see docker/run-chart-snapshots.sh) - never picked
// up by the regular, cross-platform `test` target. Vitest's CLI `--exclude` appends to rather than
// replaces a config's `exclude`, so excluding these from the main config and re-including them
// here via a CLI filter isn't possible with one shared config; hence this file duplicates the
// `test`/`include` block, not the source-aliasing logic (shared via vitest.source-aliases.ts) or
// the benchmark/browser-mode machinery that main config also carries.
process.env.TZ = 'UTC';

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(thisDir, '../..');

const aliases = createReactAliases(thisDir);

const packagesDir = path.resolve(repoRoot, 'packages');
if (existsSync(packagesDir)) {
    await loadSourceCodeAliases(aliases, packagesDir);
}
aliases.sort((a, b) => String(a.find).localeCompare(String(b.find)));

export default defineConfig({
    esbuild: { target: 'esnext', jsx: 'automatic' },
    resolve: { alias: aliases },
    cacheDir: path.resolve(thisDir, 'node_modules', '.vite-chart-snapshots'),
    clearScreen: false,
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.resolve(thisDir, 'vitest.setup.ts')],
        reporters: ['basic'],
        watch: false,
        root: repoRoot,
        dir: path.resolve(thisDir, 'src'),
        include: ['**/*.chart-snapshot.test.ts'],
    },
});
