import react from '@vitejs/plugin-react-swc';
import { existsSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const thisDir = path.dirname(fileURLToPath(import.meta.url));

/** Repo root — two levels up from testing/behavioural. Used to locate packages/ for source aliases. */
const repoRoot = path.resolve(thisDir, '../..');

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
if (process.env.TESTS_USE_ORIGINAL_SOURCE_CODE !== 'false') {
    const packagesDir = path.resolve(repoRoot, 'packages');
    if (existsSync(packagesDir)) {
        await loadSourceCodeAliases(aliases, packagesDir);
    }
}

export default defineConfig({
    plugins: [react({ include: /\.tsx$/ })],
    esbuild: { target: 'esnext' },
    resolve: { alias: aliases },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.resolve(thisDir, 'vitest.setup.ts')],
        reporters: ['basic'],
        watch: false,
        pool: 'threads',
        root: repoRoot,
        dir: path.resolve(thisDir, 'src'),
        include: ['**/*.test.ts', '**/*.test.tsx'],
        benchmark: { include: ['**/*.bench.ts'] },
        css: false,
    },
    clearScreen: false,
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
