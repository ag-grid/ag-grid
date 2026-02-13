import { accessSync, constants as fsConstants } from 'fs';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const testingBehaviouralPath = path.resolve(fileURLToPath(import.meta.url), '../');

/** Resolve aliases — deduplicate react so ag-grid-react source code uses the same copy */
const resolveAlias: Record<string, string> = {
    react: path.resolve(testingBehaviouralPath, 'node_modules/react'),
    'react-dom': path.resolve(testingBehaviouralPath, 'node_modules/react-dom'),
};

/**
 * This behavioural test project can both use the source code and the bundles of the modules.
 * So we can have a faster development cycle running tests before the compilation steps is done,
 * and, we can still run the tests using the compiled code if needed by setting the environment variable
 * `TESTS_USE_SOURCE_CODE=false`, will make the project use the bundled dist code.
 *
 * Note that at the moment vitest is not correctly loading the sourcemaps of the bundled code, so it is recommended to use the source code.
 */

const ENTRY_FILES = ['src/index.ts', 'src/index.tsx', 'src/main.ts', 'src/main.tsx'] as const;

if (process.env.TESTS_USE_ORIGINAL_SOURCE_CODE !== 'false') {
    const workspaceRootPath = path.resolve(fileURLToPath(import.meta.url), '../../../');
    await loadSourceCodeAliases(resolveAlias, path.resolve(workspaceRootPath, 'packages'));
}

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.js',
        reporters: ['basic'],
        watch: false,
        pool: 'threads',
        dir: 'src',
        include: ['**/*.test.ts', '**/*.test.tsx'],
        benchmark: {
            include: ['**/*.bench.ts'],
        },
    },
    resolve: {
        alias: resolveAlias,
    },
    clearScreen: false,
});

/** Scans package directories and maps package names to their TypeScript source entry points. */
async function loadSourceCodeAliases(aliases: Record<string, string>, rootDir: string, depth = 0): Promise<void> {
    const entries = await readdir(rootDir, { withFileTypes: true });
    const tasks: Promise<void>[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        const dirPath = path.resolve(rootDir, entry.name);
        const pkgJsonPath = path.join(dirPath, 'package.json');

        if (fileExists(pkgJsonPath)) {
            tasks.push(registerPackageAlias(aliases, dirPath, pkgJsonPath));
        } else if (depth < 2) {
            tasks.push(loadSourceCodeAliases(aliases, dirPath, depth + 1));
        }
    }

    await Promise.all(tasks);
}

async function registerPackageAlias(aliases: Record<string, string>, dirPath: string, pkgJsonPath: string) {
    const { name } = JSON.parse(await readFile(pkgJsonPath, 'utf-8'));
    if (!name || name in aliases) {
        return;
    }

    for (const entryFile of ENTRY_FILES) {
        const entryPath = path.resolve(dirPath, entryFile);
        if (fileExists(entryPath)) {
            aliases[name] = entryPath;
            return;
        }
    }
}

function fileExists(filePath: string): boolean {
    try {
        accessSync(filePath, fsConstants.F_OK);
        return true;
    } catch {
        return false;
    }
}
