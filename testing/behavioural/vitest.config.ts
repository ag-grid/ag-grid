import { appendFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';
import type { ViteUserConfig } from 'vitest/config';
import type { BrowserCommand, TestSequencerConstructor, TestSpecification } from 'vitest/node';

import {
    TEST_TIMEOUT_MS,
    UNIT_TEST_ENVIRONMENT,
    diffConfigFile,
    packageSourceAliases,
    sortAliases,
    vitestReporters,
} from '../shared/vitest/shared';
import type { Alias } from '../shared/vitest/shared';

// The timezone is pinned by the shared config imported above, which every unit project goes through.

const thisDir = path.dirname(fileURLToPath(import.meta.url));

/** Repo root — two levels up from testing/behavioural. Used to locate packages/ for source aliases. */
const repoRoot = path.resolve(thisDir, '../..');

// Set by bench-compare.mjs to another checkout's `packages/`, so one checkout's benches can measure
// another's grid source. Its parent is that checkout's root, which holds the matching community-modules/.
const benchPackages = process.env.AG_BENCH_PACKAGES;
const benchRoot = benchPackages ? path.resolve(benchPackages, '..') : repoRoot;

// One Vite dep cache per checkout and per side: base and test alias different sources, so a shared cache is
// re-optimised on every switch, and a paired run's two concurrent processes must not share one.
const benchSide = process.env.AG_BENCH_SIDE;
const benchCacheKey = `${benchPackages ? path.basename(benchRoot) : 'self'}${benchSide ? `-${benchSide}` : ''}`;

// Set by bench-compare: the turn server that pairs the two sides in time, and the file receiving every
// call's time.
const benchTurnUrl = process.env.AG_BENCH_TURN_URL;
const benchSamplesPath = process.env.AG_BENCH_SAMPLES;
// `./benches.sh --profile`: each bench's measured run is CPU-profiled through CDP into this directory.
const benchProfileDir = process.env.BENCH_PROFILE
    ? process.env.BENCH_PROFILE_DIR || path.resolve(thisDir, 'src/benchmarks/tmp/profiles')
    : undefined;
const pairedTinybenchPath = path.resolve(thisDir, 'src/benchmarks/paired-tinybench.ts');

// Serves paired-tinybench.ts for the runner's `tinybench` import; the module itself still gets the real one.
const pairedTinybenchPlugin = {
    name: 'bench-paired-tinybench',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string | undefined) {
        if (source !== 'tinybench' || importer?.split('?')[0] === pairedTinybenchPath) {
            return null;
        }
        return pairedTinybenchPath;
    },
};

/** Bench name occurrences per `file::name`, so two same-named benches in one file get distinct keys. */
const benchTurnCounts = new Map<string, number>();

interface BenchTurn {
    granted: boolean;
    paired: boolean;
    profile: boolean;
}

// A bench always runs inside a test file, so its path is set; '' only satisfies the type.
const benchId = (testPath: string | undefined, name: string): string =>
    `${path.relative(repoRoot, testPath ?? '')}::${name}`;

/** Long-polls the turn server (it answers within ~20s) — short of any RPC timeout between browser and node. */
async function waitBenchTurn(): Promise<BenchTurn> {
    const response = await fetch(`${benchTurnUrl}/wait?side=${benchSide}`);
    const body = (await response.json()) as { granted: boolean };
    return { granted: body.granted, paired: true, profile: !!benchProfileDir };
}

const benchTurn: BrowserCommand<[name: string]> = async ({ testPath }, name) => {
    const id = benchId(testPath, name);
    const count = (benchTurnCounts.get(id) ?? 0) + 1;
    benchTurnCounts.set(id, count);
    if (!benchTurnUrl) {
        return { granted: true, paired: false, profile: !!benchProfileDir };
    }
    await fetch(`${benchTurnUrl}/request?side=${benchSide}&key=${encodeURIComponent(`${id}#${count}`)}`);
    return waitBenchTurn();
};

/** One NDJSON line per bench: its key and each slice's call times, run-length encoded. */
const benchSamples: BrowserCommand<[name: string, slices: number[][]]> = async ({ testPath }, name, slices) => {
    if (!benchSamplesPath) {
        return;
    }
    const id = benchId(testPath, name);
    await appendFile(benchSamplesPath, `${JSON.stringify([`${id}#${benchTurnCounts.get(id)}`, slices])}\n`);
};

/** One `.cpuprofile` per bench, named after its file and bench (and its occurrence, from the second), for DevTools. */
const benchProfile: BrowserCommand<[name: string, profile: string]> = async ({ testPath }, name, profile) => {
    const occurrence = benchTurnCounts.get(benchId(testPath, name)) ?? 1;
    const benchFile = path.basename(testPath ?? '').replace(/\.bench\.tsx?$/, '');
    const file = `${benchFile}--${name}${occurrence > 1 ? `-${occurrence}` : ''}`.replace(/[^\w.-]+/g, '-');
    await mkdir(benchProfileDir!, { recursive: true });
    await writeFile(path.join(benchProfileDir!, `${file}.cpuprofile`), profile);
};

// Paths, not cache stats, order the files: both paired sides must reach each bench in the same order.
const benchSequencer = async (): Promise<TestSequencerConstructor> => {
    const vitestNode = await import('vitest/node');
    return class BenchSequencer extends vitestNode.BaseSequencer {
        public override async sort(files: TestSpecification[]): Promise<TestSpecification[]> {
            return [...files].sort((a, b) => a.moduleId.localeCompare(b.moduleId));
        }
    };
};

// Flips the grid's FAST_TEST_TIMINGS flag to true for this suite: hard-coded UX delays (menu activation,
// drag intervals, announcements) are wall-clock a headless test would otherwise sit through. Matched on the
// relative specifier every importer of the flag writes, so nothing else named the same can be caught.
const fastTestTimingsAlias: Alias = {
    find: /^(\.\.?\/)+fastTestTimings$/,
    replacement: path.resolve(thisDir, '../ag-test-utils/src/fastTestTimings.ts'),
};

// Pin react/react-dom to the versions installed in testing/behavioural/node_modules,
// preventing Vite from resolving them from the repo-root node_modules instead.
const aliases: Alias[] = [
    { find: 'react', replacement: path.resolve(thisDir, 'node_modules/react') },
    { find: 'react-dom', replacement: path.resolve(thisDir, 'node_modules/react-dom') },
    fastTestTimingsAlias,
];

// Point package names at TypeScript source so tests run against uncompiled code, both halves of one
// source tree (never a mix of two checkouts): packages/ for the grid, community-modules/ for the locales,
// whose published `exports` point at a dist/ no test run builds.
if (process.env.TESTS_USE_ORIGINAL_SOURCE_CODE !== 'false') {
    aliases.push(...(await packageSourceAliases(benchRoot)));
}

sortAliases(aliases);

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

// Benchmarks run in a real Chromium (via Playwright) so layout-dependent work is measured against a real
// layout engine. Tests (mode 'test') always use happy-dom — only benchmark runs go to the browser.
// `BENCH_BROWSER_HEADED=1` (`./benches.sh --headed`) opens a visible window to watch the run.
export default defineConfig(async ({ mode }): Promise<ViteUserConfig> => {
    const isBench = mode === 'benchmark';
    const browserHeadless = !process.env.BENCH_BROWSER_HEADED;

    // Imported here rather than at module scope: it pulls in playwright, which every `./behave.sh`
    // run would otherwise load for a browser it never starts.
    const browserProvider = isBench ? (await import('@vitest/browser-playwright')).playwright : undefined;
    // Every bench run gets the Task subclass: its warmup, slices and profiling apply outside bench-compare too.
    const benchPlugins = isBench ? [cssInlinePlugin, pairedTinybenchPlugin] : [];

    return {
        // No `esbuild`/`oxc` block: Vite 8 transforms with oxc, whose defaults are already `target: esnext`
        // and `jsx: { runtime: 'automatic' }`, and an `esbuild` block alongside oxc is warned about and ignored.

        // A benchmark measures the shipped grid, so it keeps the real delays; only tests get the fast ones.
        resolve: { alias: isBench ? aliases.filter((alias) => alias !== fastTestTimingsAlias) : aliases },
        cacheDir: path.resolve(thisDir, 'node_modules', `.vite-bench-${benchCacheKey}`),
        plugins: benchPlugins,
        // Cross-origin isolation → `crossOriginIsolated`, dropping Chromium's `performance.now()` clamp
        // from 100µs to 5µs (essential for fast micro-benches). Browser benches only; tests stay on happy-dom.
        server: isBench
            ? {
                  headers: {
                      'Cross-Origin-Opener-Policy': 'same-origin',
                      'Cross-Origin-Embedder-Policy': 'require-corp',
                  },
              }
            : undefined,
        test: {
            name: 'behavioural',
            globals: true,
            environment: UNIT_TEST_ENVIRONMENT,
            // Benchmarks measure rather than assert, so only tests carry the cap.
            testTimeout: isBench ? undefined : TEST_TIMEOUT_MS,
            setupFiles: [path.resolve(thisDir, 'vitest.setup.ts')],
            diff: diffConfigFile,
            reporters: vitestReporters(),
            watch: false,
            pool: 'threads',
            // One bench file at a time, so files don't contend for cores. (Tests keep the defaults.)
            fileParallelism: isBench ? false : undefined,
            maxWorkers: isBench ? 1 : undefined,
            root: repoRoot,
            dir: path.resolve(thisDir, 'src'),
            include: ['**/*.test.ts', '**/*.test.tsx'],
            benchmark: { include: ['**/*.bench.ts', '**/*.bench.tsx'] },
            sequence: isBench ? { sequencer: await benchSequencer() } : undefined,
            css: isBench,
            browser: {
                enabled: isBench,
                // expose-gc: window.gc for the harness to collect before each measured run. max-semi-space-size:
                // bigger young gen → fewer scavenge-GC spikes mid-measurement (the main residual noise).
                // vsync flags drop frame-rate jitter. NB: don't add a `--disable-features` — Chromium keeps
                // only the last occurrence, clobbering Playwright's noise-reduction defaults.
                provider: browserProvider?.({
                    launchOptions: {
                        args: [
                            '--js-flags=--expose-gc --max-semi-space-size=256',
                            '--enable-benchmarking',
                            '--disable-frame-rate-limit',
                            '--disable-gpu-vsync',
                        ],
                    },
                }),
                instances: [{ browser: 'chromium' }],
                headless: browserHeadless,
                // No in-browser overlay — `--headed` shows the grid full-window, and `--ui` serves the
                // separate Vitest dashboard (the bench picker) at a localhost URL, not this overlay.
                ui: false,
                screenshotFailures: false,
                // Large, fixed viewport so the grid (sized 100vw×100vh) renders a representative number
                // of rows consistently across machines, and fills the window when headed.
                viewport: { width: 1600, height: 1200 },
                commands: isBench ? { benchTurn, benchTurnWait: waitBenchTurn, benchSamples, benchProfile } : undefined,
            },
        },
        clearScreen: false,
    };
});
