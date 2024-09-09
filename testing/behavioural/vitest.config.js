import pluginReact from '@vitejs/plugin-react';
import { existsSync } from 'fs';
import { readFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

const workspaceRootPath = path.resolve(fileURLToPath(import.meta.url), '../../../');

/** Resolve aliases */
const resolveAlias = {};

/**
 * This behavioural test project can both use the source code and the bundles of the modules.
 * So we can have a faster development cycle running tests before the compilation steps is done,
 * and, we can still run the tests using the compiled code if needed by setting the environment variable
 * `TESTS_USE_SOURCE_CODE=false`, will make the project use the bundled dist code.
 *
 * Note that at the moment vitest is not correctly loading the sourcemaps of the bundled code, so it is recommended to use the source code.
 */
const TESTS_USE_ORIGINAL_SOURCE_CODE = process.env.TESTS_USE_ORIGINAL_SOURCE_CODE !== 'false';

if (TESTS_USE_ORIGINAL_SOURCE_CODE) {
    await loadSourceCodeAliases(['community-modules', 'enterprise-modules', 'packages']); // Load the projects source code
}

export default defineConfig({
    plugins: [pluginReact()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './vitest.setup.js',
    },
    resolve: {
        alias: resolveAlias,
    },
    clearScreen: false,
});

async function loadSourceCodeAliases(modulesDirectories) {
    const processedPaths = new Set();
    const processSourceDirectory = async (name, level) => {
        let promises = [];
        const modulePath = path.resolve(name);
        if (!processedPaths.has(modulePath)) {
            processedPaths.add(modulePath);
            const content = await readdir(modulePath, { withFileTypes: true });
            for (const dir of content) {
                if (dir.isDirectory()) {
                    const packageJsonPath = path.resolve(modulePath, dir.name, 'package.json');
                    if (existsSync(packageJsonPath)) {
                        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
                        if (!(packageJson.name in resolveAlias)) {
                            const mainFiles = ['src/index.ts', 'src/index.tsx', 'src/main.ts', 'src/main.tsx'];
                            for (const mainFile of mainFiles) {
                                let mainTsPath = path.resolve(modulePath, dir.name, mainFile);
                                if (existsSync(mainTsPath)) {
                                    resolveAlias[packageJson.name] = mainTsPath;
                                    break;
                                }
                            }
                        }
                    } else if (level < 2) {
                        promises.push(processSourceDirectory(path.resolve(modulePath, dir.name), level + 1));
                    }
                }
            }
        }
        await Promise.all(promises);
    };

    await Promise.all(
        modulesDirectories.map((name) => processSourceDirectory(path.resolve(workspaceRootPath, name), 0))
    );
}
