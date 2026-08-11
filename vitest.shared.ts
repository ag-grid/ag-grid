// Shared vitest helpers used by the root workspace config and the individual project configs, so the
// same behaviour applies whether a project runs via `./behave.sh` or standalone (e.g. benches.sh, nx).
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

/** Repo root. `__dirname` (not `import.meta`) because the package `tsconfig.spec` type-checks this as CJS. */
const repoRoot = __dirname;

/** Output-volume controls (`--no-diff`, `--stack-trace-len`, DEBUG_PRINT_LIMIT), shared by every unit project. */
export const outputSetupFile = path.resolve(repoRoot, 'vitest.output.setup.ts');

/** Diff options module (`--diff-lines`), shared by every unit project. */
export const diffConfigFile = path.resolve(repoRoot, 'vitest.diff.ts');

// Pin the timezone so date-sensitive tests behave identically on every machine. Set when any config
// imports this module (main process), before workers spawn and inherit the env.
process.env.TZ = 'UTC';

/** Candidate entry-point filenames tried when resolving a package to source. */
const SOURCE_ENTRY_FILES = ['src/index.ts', 'src/index.tsx', 'src/main.ts', 'src/main.tsx'] as const;

export type Alias = { find: string | RegExp; replacement: string };

/**
 * Alias every workspace package under `packagesDir` to its TS source entry, so tests import internal deps
 * (ag-stack, ag-grid-community, …) from source with no prior build — dist is absent in CI. Shared by the
 * package unit projects and the behavioural suite so both resolve internal packages identically. The
 * caller passes `packagesDir` (via `__dirname`) so this module needs no `import.meta` — the package
 * `tsconfig.spec` type-checks it as CommonJS, where `import.meta` is not allowed.
 */
export const packageSourceAliases = async (packagesDir: string): Promise<Alias[]> => {
    const aliases: Alias[] = [];
    if (existsSync(packagesDir)) {
        await loadSourceCodeAliases(aliases, packagesDir);
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
export const loadSourceCodeAliases = async (aliases: Alias[], dir: string, depth = 0): Promise<void> => {
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

/**
 * jsdom's CSS parser rejects the modern CSS (nested rules, @layer, color-mix) the Theming API and
 * ag-charts inject at runtime, emitting "Could not parse CSS stylesheet" on every <style> attach. Real
 * browsers accept it; the errors are harmless but flood output. Drop only those lines via `onConsoleLog`.
 */
export const dropCssParseErrors = (log: string): false | void => {
    if (log.includes('Could not parse CSS stylesheet')) {
        return false;
    }
};

/** Reporters for a vitest run: concise 'basic' output always, plus 'junit' in CI (pair with an outputFile). */
export const vitestReporters = (): string[] => (process.env.CI != null ? ['basic', 'junit'] : ['basic']);

/**
 * Vitest defaults to the `forks` pool; `threads` is measurably faster for these jsdom unit projects.
 * A workspace does NOT cascade the root config's pool to its projects, so each unit project sets it
 * (the behavioural project overrides to `forks` only for benchmark runs via benches.sh).
 */
export const UNIT_TEST_POOL = 'threads' as const;

export interface UnitProjectOptions {
    /** Vitest project name, used for --project filtering. */
    name: string;
    /** JUnit output path (relative to the project root) for standalone/nx runs. */
    junitFile: string;
    environment?: 'jsdom' | 'node';
    setupFiles?: string[];
}

/** Shared `test` config for the package (London-school) unit projects, keeping them consistent. */
export const unitProjectTestConfig = ({ name, junitFile, environment = 'jsdom', setupFiles }: UnitProjectOptions) => ({
    name,
    globals: true,
    environment,
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    css: false,
    watch: false,
    pool: UNIT_TEST_POOL,
    reporters: vitestReporters(),
    // Prepended, so a project's own setup still runs last and can override.
    setupFiles: [outputSetupFile, ...(setupFiles ?? [])],
    diff: diffConfigFile,
    outputFile: { junit: junitFile },
});
