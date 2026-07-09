import { existsSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

// Pin the timezone so date tests behave the same on every machine, matching the packages/* vitest configs.
process.env.TZ = 'UTC';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

/** Repo root — two levels up from testing/behavioural. Used to locate packages/ for source aliases. */
const repoRoot = path.resolve(thisDir, '../..');

// Per-checkout dep cache: bench-compare points AG_BENCH_PACKAGES at base vs test, which changes the
// source aliases. Sharing one cacheDir makes each side invalidate the other's optimized deps (Vite
// re-optimizes on every side switch); a key per checkout keeps the two caches separate.
const benchCacheKey = process.env.AG_BENCH_PACKAGES
    ? path.basename(path.resolve(process.env.AG_BENCH_PACKAGES, '..'))
    : 'self';

type Alias = { find: string | RegExp; replacement: string };

/** Candidate entry-point filenames tried when resolving a package to source. */
const SOURCE_ENTRY_FILES = ['src/index.ts', 'src/index.tsx', 'src/main.ts', 'src/main.tsx'] as const;

// Pin react/react-dom to the versions installed in testing/behavioural/node_modules,
// preventing Vite from resolving them from the repo-root node_modules instead.
const aliases: Alias[] = [
    { find: 'react', replacement: path.resolve(thisDir, 'node_modules/react') },
    { find: 'react-dom', replacement: path.resolve(thisDir, 'node_modules/react-dom') },
];

// Point package names at TypeScript source so tests run against uncompiled code.
// AG_BENCH_PACKAGES overrides which checkout's `packages/` the grid imports resolve to — set by
// bench-compare.mjs on each base/test run so one checkout's benches can measure another's grid source.
if (process.env.TESTS_USE_ORIGINAL_SOURCE_CODE !== 'false') {
    const packagesDir = process.env.AG_BENCH_PACKAGES
        ? path.resolve(process.env.AG_BENCH_PACKAGES)
        : path.resolve(repoRoot, 'packages');
    if (existsSync(packagesDir)) {
        await loadSourceCodeAliases(aliases, packagesDir);
    }
}

// Sort to a stable order: aliases are registered concurrently (Promise.all) from an unordered readdir,
// so without this the array order varies per run → Vite sees a "changed" config and re-optimizes deps
// every run. Distinct package-name finds, so order doesn't affect resolution.
aliases.sort((a, b) => String(a.find).localeCompare(String(b.find)));

// The grid's Theming API imports CSS as a default-exported string (e.g. inject.ts:
// `import sharedCSS from './shared/shared.css'`) and injects it at runtime. Vite only produces that
// string for `.css?inline`; a bare `.css` import resolves to a styles side-effect with no default
// export. Route bare `.css` imports through `?inline` so theming works the same as a real build.
const cssInlinePlugin = {
    name: 'bench-css-inline',
    enforce: 'pre' as const,
    async resolveId(this: any, source: string, importer: string | undefined, options: any) {
        if (!source.endsWith('.css') || source.includes('?') || !importer) {
            return null;
        }
        const resolved = await this.resolve(`${source}?inline`, importer, { ...options, skipSelf: true });
        return resolved?.id ?? null;
    },
};

// Benchmarks default to a real Chromium (via Playwright) so layout-dependent work is measured
// against a real layout engine; `BENCH_NODE=1` (`./benches.sh --node`) opts back into node/jsdom.
// Tests (mode 'test') always use jsdom — only benchmark runs go to the browser.
// `BENCH_BROWSER_HEADED=1` (`./benches.sh --headed`) opens a visible window to watch the run.
export default defineConfig(({ mode }) => {
    const isBench = mode === 'benchmark';
    const browserEnabled = isBench && !process.env.BENCH_NODE;
    const browserHeadless = !process.env.BENCH_BROWSER_HEADED;

    // `--profile` (BENCH_PROFILE, node-only — browser mode doesn't use the forks pool) emits a V8 CPU
    // profile from the forked child. `--expose-gc` is always on so the harness can reclaim grids.
    const benchExecArgv = ['--expose-gc'];
    if (process.env.BENCH_PROFILE) {
        const profileDir = process.env.BENCH_PROFILE_DIR || path.resolve(thisDir, 'profiles');
        benchExecArgv.push('--cpu-prof', `--cpu-prof-dir=${profileDir}`);
    }

    return {
        esbuild: { target: 'esnext', jsx: 'automatic' },
        resolve: { alias: aliases },
        cacheDir: path.resolve(thisDir, 'node_modules', `.vite-bench-${benchCacheKey}`),
        // Pre-bundle deps imported by the shared setup file so Vite doesn't discover them mid-run and
        // reload (which corrupts an in-flight bench). jest-dom is pulled in by vitest.setup.ts.
        optimizeDeps: { include: ['@testing-library/jest-dom/matchers'] },
        plugins: browserEnabled ? [cssInlinePlugin] : [],
        // Cross-origin isolation → `crossOriginIsolated`, dropping Chromium's `performance.now()` clamp
        // from 100µs to 5µs (essential for fast micro-benches). Browser benches only; tests stay on jsdom.
        server: browserEnabled
            ? {
                  headers: {
                      'Cross-Origin-Opener-Policy': 'same-origin',
                      'Cross-Origin-Embedder-Policy': 'require-corp',
                  },
              }
            : undefined,
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: [path.resolve(thisDir, 'vitest.setup.ts')],
            reporters: ['basic'],
            watch: false,
            // jsdom's CSS parser rejects the modern CSS (nested rules, @layer, color-mix) that the Theming
            // API and ag-charts inject at runtime, emitting "Could not parse CSS stylesheet" on every <style>
            // attach. Real browsers accept it; the errors are harmless but flood CI (charts tests especially).
            // Drop only those lines — every other console message still comes through. A local counterpart in
            // theming/style-injection.test.ts swallows the same string where it needs to count occurrences.
            onConsoleLog(log) {
                if (log.includes('Could not parse CSS stylesheet')) {
                    return false;
                }
            },
            // Benchmarks run in a single forked child (clean process isolation, no file parallelism)
            // so runs don't contend for cores or pay worker-migration noise. `--expose-gc` lives here
            // (not in the shell wrappers) so `./benches.sh`, raw `vitest bench` and `bench-compare`
            // all behave identically — the harness reclaims destroyed grids between benches when gc
            // is present. Worker threads reject `--expose-gc`, hence forks. (Tests keep the defaults.)
            pool: isBench ? 'forks' : 'threads',
            fileParallelism: isBench ? false : undefined,
            poolOptions: isBench ? { forks: { singleFork: true, execArgv: benchExecArgv } } : undefined,
            root: repoRoot,
            dir: path.resolve(thisDir, 'src'),
            include: ['**/*.test.ts', '**/*.test.tsx'],
            benchmark: { include: ['**/*.bench.ts', '**/*.bench.tsx'] },
            css: browserEnabled,
            browser: {
                enabled: browserEnabled,
                provider: 'playwright',
                name: 'chromium',
                headless: browserHeadless,
                // No in-browser overlay — `--headed` shows the grid full-window, and `--ui` serves the
                // separate Vitest dashboard (the bench picker) at a localhost URL, not this overlay.
                ui: false,
                screenshotFailures: false,
                // Large, fixed viewport so the grid (sized 100vw×100vh) renders a representative number
                // of rows consistently across machines, and fills the window when headed.
                viewport: { width: 1600, height: 1200 },
                // expose-gc: window.gc for the harness to reclaim grids between benches. max-semi-space-size:
                // bigger young gen → fewer scavenge-GC spikes mid-measurement (the main residual noise).
                // vsync flags drop frame-rate jitter. NB: don't add a `--disable-features` — Chromium keeps
                // only the last occurrence, clobbering Playwright's noise-reduction defaults.
                providerOptions: {
                    launch: {
                        args: [
                            '--js-flags=--expose-gc --max-semi-space-size=256',
                            '--enable-benchmarking',
                            '--disable-frame-rate-limit',
                            '--disable-gpu-vsync',
                        ],
                    },
                },
            },
        },
        clearScreen: false,
    };
});

/** Recursively discover packages under `dir` and alias them to their source entry. */
async function loadSourceCodeAliases(aliases: Alias[], dir: string, depth = 0): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true });
    const tasks: Promise<void>[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory() || entry.isSymbolicLink()) {
            continue;
        }
        const name = entry.name;
        if (name === 'node_modules' || name === 'dist' || name === '.git' || name[0] === '.') {
            continue;
        }

        const dirPath = path.resolve(dir, name);
        const pkgJsonPath = path.join(dirPath, 'package.json');

        if (existsSync(pkgJsonPath)) {
            tasks.push(registerPackageAlias(aliases, dirPath, pkgJsonPath));
        } else if (depth < 2) {
            tasks.push(loadSourceCodeAliases(aliases, dirPath, depth + 1));
        }
    }
    await Promise.all(tasks);
}

async function registerPackageAlias(aliases: Alias[], dirPath: string, pkgJsonPath: string): Promise<void> {
    const { name } = JSON.parse(await readFile(pkgJsonPath, 'utf-8'));
    if (!name || aliases.some((a) => a.find === name)) {
        return;
    }

    for (const entry of SOURCE_ENTRY_FILES) {
        const entryPath = path.resolve(dirPath, entry);
        if (existsSync(entryPath)) {
            aliases.push({ find: name, replacement: entryPath });
            return;
        }
    }
}
