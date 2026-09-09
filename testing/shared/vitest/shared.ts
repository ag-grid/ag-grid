// Shared vitest helpers used by the root workspace config and the individual project configs, so the
// same behaviour applies whether a project runs via `./behave.sh` or standalone (e.g. benches.sh, nx).
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

import { TEST_TIMEOUT_MS } from './timings';

/** Output-volume controls (`--no-diff`, `--stack-trace-len`, DEBUG_PRINT_LIMIT), shared by every unit project. */
const outputSetupFile = path.resolve(__dirname, 'output.setup.ts');

/** Diff options module (`--diff-lines`), shared by every unit project. */
export const diffConfigFile = path.resolve(__dirname, 'diff.ts');

// Pin the timezone so date-sensitive tests behave identically on every machine. Set when any config
// imports this module (main process), before workers spawn and inherit the env.
process.env.TZ = 'UTC';

const isCI = process.env.CI != null;

/** Candidate entry-point filenames tried when resolving a package to source. */
const SOURCE_ENTRY_FILES = ['src/index.ts', 'src/index.tsx', 'src/main.ts', 'src/main.tsx'] as const;

// Both are scanned: `@ag-grid-community/locale` lives in the second, and its published `exports` point at
// a `dist/` no test run builds, so without the alias a test can only reach the locales by relative path.
const SOURCE_PACKAGE_DIRS = ['packages', 'community-modules'] as const;

export type Alias = { find: string | RegExp; replacement: string };

/**
 * Alias every workspace package under `repoRoot` to its TS source entry, so tests import internal deps from
 * source with no prior build - dist is absent in CI. `repoRoot` is passed rather than derived, so this
 * module needs no `import.meta`: the package `tsconfig.spec` type-checks it as CommonJS, which forbids it.
 */
export const packageSourceAliases = async (repoRoot: string): Promise<Alias[]> => {
    const aliases: Alias[] = [];
    for (const dir of SOURCE_PACKAGE_DIRS) {
        const sourceDir = path.resolve(repoRoot, dir);
        if (existsSync(sourceDir)) {
            await loadSourceCodeAliases(aliases, sourceDir);
        }
    }
    sortAliases(aliases);
    return aliases;
};

/**
 * Sort aliases into a stable order. Discovery runs concurrently (`Promise.all`) over an unordered
 * `readdir`, so without this the array order varies per run → Vite sees a "changed" config and
 * re-optimizes deps every time. Distinct package-name finds, so order doesn't affect resolution.
 */
export const sortAliases = (aliases: Alias[]): void => {
    aliases.sort((a, b) => String(a.find).localeCompare(String(b.find)));
};

/** Recursively discover packages under `dir` and alias each package name to its source entry. */
const loadSourceCodeAliases = async (aliases: Alias[], dir: string, depth = 0): Promise<void> => {
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
};

// A string `find` also matches `<name>/<subpath>`, so a package aliased here must be imported by bare name
// only; the packages that are imported by subpath (`ag-test-utils`, styles) live outside SOURCE_PACKAGE_DIRS.
const registerPackageAlias = async (aliases: Alias[], dirPath: string, pkgJsonPath: string): Promise<void> => {
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
};

/** Warns about tests approaching `TEST_TIMEOUT_MS`; an absolute path so it resolves from any project root. */
const slowTestsReporter = path.resolve(__dirname, 'slow-tests.reporter.ts');

/**
 * Where a local run's machine-readable results go, set by `scripts/gate/gates/behave.mjs` beside that run's
 * log so a failure can be read back exactly rather than scraped from console output. Absent = no json reporter.
 */
export const resultJsonFile = process.env.AG_RESULT_JSON;

type Reporters = NonNullable<NonNullable<ViteUserConfig['test']>['reporters']>;

/** Reporters for a vitest run: concise output always, plus 'junit' in CI (pair with an outputFile). */
export const vitestReporters = (): Reporters => [
    // `summary` is the live per-file tree the runner redraws as it goes; the end-of-run totals are not
    // part of it and still print. This is `basic`, which v3 removed.
    ['default', { summary: false }],
    ...(isCI ? (['junit'] as const) : []),
    slowTestsReporter,
    ...(resultJsonFile ? (['json'] as const) : []),
];

// Re-exported for the configs, which already import this module; the definitions live in a node-free file
// because `output.setup.ts` also loads them inside a browser worker (see timings.ts).
export * from './timings';

/** `threads` is measurably faster here than vitest's default `forks`, and a project cannot inherit it. */
const UNIT_TEST_POOL = 'threads' as const;

/**
 * The DOM every suite that needs one runs on, named once for the same reason as the pool above: a project
 * cannot inherit it from the root config, so the behavioural project sets it alongside the package ones.
 */
export const UNIT_TEST_ENVIRONMENT = 'happy-dom' as const;

export interface UnitProjectOptions {
    /** Vitest project name, used for --project filtering. */
    name: string;
    /** JUnit output path (relative to the project root) for standalone/nx runs. */
    junitFile: string;
    environment?: typeof UNIT_TEST_ENVIRONMENT | 'node';
    setupFiles?: string[];
}

/** Shared `test` config for the package (London-school) unit projects, keeping them consistent. */
export const unitProjectTestConfig = ({
    name,
    junitFile,
    environment = UNIT_TEST_ENVIRONMENT,
    setupFiles,
}: UnitProjectOptions) => ({
    name,
    globals: true,
    environment,
    testTimeout: TEST_TIMEOUT_MS,
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    css: false,
    watch: false,
    pool: UNIT_TEST_POOL,
    // Isolation stays on. `isolate: false` was measured here and rejected: ~1s on a standalone package
    // run, nothing on the full suite (behavioural files bound the wall), which does not pay for requiring
    // every unit file to own its global state.
    reporters: vitestReporters(),
    // Prepended, so a project's own setup still runs last and can override; `list` is what makes the order
    // real rather than a wish. Only honoured when this project IS the root config, hence the root's copy.
    setupFiles: [outputSetupFile, ...(setupFiles ?? [])],
    sequence: { setupFiles: 'list' as const },
    diff: diffConfigFile,
    // The json path is mapped here too, not only in the root config: `vitestReporters()` adds the reporter
    // whenever AG_RESULT_JSON is set, and an unmapped outputFile makes it dump the whole report to stdout.
    outputFile: { junit: junitFile, ...(resultJsonFile ? { json: resultJsonFile } : {}) },
});
