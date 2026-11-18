#!/usr/bin/env tsx
/* eslint-disable no-console */
import { spawn } from 'child_process';
import { existsSync, globSync } from 'fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { dirname, join, posix, relative, sep } from 'path';
import { fileURLToPath } from 'url';

import { stripOutExampleGeneratorCode } from '../src/components/example-runner/components/stripOutExampleGeneratorCode';
import { isSpecFile } from '../src/components/example-runner/utils/isSpecFile';

/**
 * Type-checks the framework variants `generate-examples` produces, i.e. the code users get in the
 * docs code viewer, Plunker and CodeSandbox, after the same harness stripping those apply. Each
 * framework's variants are written out as files and checked by one `tsc` run with `strict` on.
 * Angular and Vue templates are strings to `tsc`, so their bindings are not checked.
 *
 * Pass example paths (`docs/<page>/_examples/<example>`) or example names to check only those.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, '..', '..', '..');
const GENERATED_ROOT = join(WORKSPACE_ROOT, 'dist', 'generated-examples', 'ag-grid-docs');
const SRC_ROOT = join(__dirname, '..', 'src');
const TSC = join(WORKSPACE_ROOT, 'node_modules', '.bin', 'tsc');

const FRAMEWORK_OPTIONS: Record<string, Record<string, unknown>> = {
    typescript: {},
    reactFunctionalTs: { jsx: 'react-jsx' },
    angular: { experimentalDecorators: true, emitDecoratorMetadata: true },
    vue3: {},
};

// Globals the example page provides at runtime rather than through an import: the seeded `agRandom` the generator
// swaps in for `Math.random`, and `alasql` from its extra in `Extras.astro`.
const RUNTIME_GLOBALS = `declare global {
    interface Window {
        agRandom(): number;
    }
    const alasql: any;
}

export {};
`;

const TYPE_CHECKED_FILE = /\.tsx?$/;

// Generated output is not cleaned between runs, so start from the source tree, using the generator's
// rule that an example is an `_examples` folder with a `main.ts`. IDs use `/` on every platform.
function findExampleDirs(): string[] {
    return globSync('**/_examples/*/main.ts', { cwd: SRC_ROOT })
        .map((entryFile) => posix.dirname(entryFile.split(sep).join('/')))
        .map((exampleDir) => exampleDir.split('/').slice(1).join('/'))
        .sort();
}

// A filter with a slash is a path to an example (or a page of examples); one without is an example name.
function matchesFilter(exampleDir: string, filter: string): boolean {
    const path = filter.replace(/\\/g, '/').replace(/\/+$/, '');
    return path.includes('/') ? `${exampleDir}/`.startsWith(`${path}/`) : exampleDir.endsWith(`/${path}`);
}

async function writeFramework(
    outputRoot: string,
    framework: string,
    exampleDirs: string[],
    missing: string[]
): Promise<number> {
    const frameworkRoot = join(outputRoot, framework);
    let exampleCount = 0;
    for (const example of exampleDirs) {
        const contentsPath = join(GENERATED_ROOT, example, framework, 'contents.json');
        if (!existsSync(contentsPath)) {
            missing.push(relative(WORKSPACE_ROOT, contentsPath));
            continue;
        }
        const { excluded, files, boilerPlateFiles } = JSON.parse(await readFile(contentsPath, 'utf8'));
        if (excluded) {
            continue;
        }
        const exampleDir = join(frameworkRoot, example);
        const allFiles: Record<string, string> = { ...boilerPlateFiles, ...files };
        stripOutExampleGeneratorCode(allFiles);
        for (const fileName of Object.keys(allFiles)) {
            if (TYPE_CHECKED_FILE.test(fileName) && !isSpecFile(fileName)) {
                const filePath = join(exampleDir, fileName);
                await mkdir(dirname(filePath), { recursive: true });
                await writeFile(filePath, allFiles[fileName]);
            }
        }
        exampleCount++;
    }
    if (exampleCount === 0) {
        return 0;
    }

    await writeFile(join(frameworkRoot, 'runtime-globals.d.ts'), RUNTIME_GLOBALS);
    const tsconfig = {
        compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'bundler',
            moduleDetection: 'force',
            lib: ['ES2023', 'DOM', 'DOM.Iterable'],
            strict: true,
            skipLibCheck: true,
            noEmit: true,
            useDefineForClassFields: false,
            allowImportingTsExtensions: true,
            types: ['node'],
            typeRoots: [join(WORKSPACE_ROOT, 'node_modules', '@types')],
            ...FRAMEWORK_OPTIONS[framework],
        },
        include: ['**/*.ts', '**/*.tsx'],
    };
    await writeFile(join(frameworkRoot, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
    return exampleCount;
}

function typeCheck(
    outputRoot: string,
    framework: string
): Promise<{ framework: string; output: string; failed: boolean }> {
    return new Promise((resolve) => {
        // Run from the scratch directory so diagnostics name files as `<framework>/docs/<page>/...`.
        const child = spawn(TSC, ['-p', join(framework, 'tsconfig.json'), '--pretty', 'false'], { cwd: outputRoot });
        let output = '';
        child.stdout.on('data', (chunk) => (output += chunk));
        child.stderr.on('data', (chunk) => (output += chunk));
        child.on('close', (code) => resolve({ framework, output, failed: code !== 0 }));
    });
}

async function main() {
    const filters = process.argv.slice(2);
    const exampleDirs = findExampleDirs().filter(
        (exampleDir) => filters.length === 0 || filters.some((filter) => matchesFilter(exampleDir, filter))
    );
    if (exampleDirs.length === 0) {
        console.error(`No examples match ${filters.join(', ')}`);
        process.exitCode = 1;
        return;
    }

    // A directory per run, so concurrent runs never delete or compile each other's files.
    await mkdir(join(WORKSPACE_ROOT, 'tmp'), { recursive: true });
    const outputRoot = await mkdtemp(join(WORKSPACE_ROOT, 'tmp', 'generated-examples-type-check-'));
    try {
        const frameworks: string[] = [];
        const missing: string[] = [];
        for (const framework of Object.keys(FRAMEWORK_OPTIONS)) {
            const exampleCount = await writeFramework(outputRoot, framework, exampleDirs, missing);
            console.log(`${framework}: ${exampleCount} examples`);
            if (exampleCount > 0) {
                frameworks.push(framework);
            }
        }
        if (missing.length > 0) {
            console.error(`\nMissing generated output, so run generate-examples first:`);
            missing.forEach((contentsPath) => console.error(`  ${contentsPath}`));
            process.exitCode = 1;
            return;
        }

        if (frameworks.length === 0) {
            console.error('\nEvery selected example excludes all of these frameworks, so there is nothing to check.');
            process.exitCode = 1;
            return;
        }

        const results = await Promise.all(frameworks.map((framework) => typeCheck(outputRoot, framework)));
        let errorCount = 0;
        for (const { framework, output, failed } of results) {
            const errors = output.split('\n').filter((line) => line.includes('error TS'));
            errorCount += errors.length;
            console.log(`\n${framework}: ${failed ? `${errors.length} errors` : 'OK'}`);
            errors.forEach((line) => console.log(`  ${line}`));
            if (failed && errors.length === 0) {
                console.log(output);
            }
        }

        if (results.some((result) => result.failed)) {
            console.error(`\nGenerated examples failed to type-check (${errorCount} errors).`);
            process.exitCode = 1;
        }
    } finally {
        await rm(outputRoot, { recursive: true, force: true });
    }
}

main();
