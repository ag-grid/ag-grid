import { existsSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import path from 'path';

// Shared between vitest.config.ts and vitest.chart-snapshots.config.ts - the two configs can't be
// merged into one (Vitest's CLI `--exclude` appends to rather than replaces a config's `exclude`,
// so a single config can't both exclude chart-snapshot tests by default and re-include them via a
// CLI filter for the dedicated target), but there's no reason for both to carry their own copy of
// the source-aliasing logic.

export type Alias = { find: string | RegExp; replacement: string };

/** Candidate entry-point filenames tried when resolving a package to source. */
const SOURCE_ENTRY_FILES = ['src/index.ts', 'src/index.tsx', 'src/main.ts', 'src/main.tsx'] as const;

/** Pin react/react-dom to the versions installed in `thisDir`'s node_modules. */
export function createReactAliases(thisDir: string): Alias[] {
    return [
        { find: 'react', replacement: path.resolve(thisDir, 'node_modules/react') },
        { find: 'react-dom', replacement: path.resolve(thisDir, 'node_modules/react-dom') },
    ];
}

/** Recursively discover packages under `dir` and alias them to their source entry. */
export async function loadSourceCodeAliases(aliases: Alias[], dir: string, depth = 0): Promise<void> {
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
