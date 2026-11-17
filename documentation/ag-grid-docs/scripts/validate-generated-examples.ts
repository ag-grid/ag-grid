#!/usr/bin/env tsx
/* eslint-disable no-console */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, readFile, readdir, rm, writeFile } from 'fs/promises';
import { dirname, join, relative } from 'path';
import { fileURLToPath } from 'url';

import { stripOutExampleGeneratorCode } from '../src/components/example-runner/components/stripOutExampleGeneratorCode';

/**
 * Type-checks the framework variants `generate-examples` produces, i.e. the code users get in the
 * docs code viewer, Plunker and CodeSandbox, after the same harness stripping those apply. Each
 * framework's variants are written out as files and checked by one `tsc` run with `strict` on.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = join(__dirname, '..', '..', '..');
const GENERATED_ROOT = join(WORKSPACE_ROOT, 'dist', 'generated-examples', 'ag-grid-docs');
const DOCS_ROOT = join(__dirname, '..', 'src', 'content', 'docs');
const OUTPUT_ROOT = join(WORKSPACE_ROOT, 'tmp', 'generated-examples-type-check');
const TSC = join(WORKSPACE_ROOT, 'node_modules', '.bin', 'tsc');

const FRAMEWORK_OPTIONS: Record<string, Record<string, unknown>> = {
    typescript: {},
    reactFunctionalTs: { jsx: 'react-jsx' },
    angular: { experimentalDecorators: true, emitDecoratorMetadata: true },
    vue3: {},
};

// Globals the example page provides at runtime rather than through an import.
const RUNTIME_GLOBALS = `import type Ajv from 'ajv';

declare global {
    interface Window {
        agRandom(): number;
    }
    const ajv7: typeof Ajv;
    const alasql: any;
}
`;

const TYPE_CHECKED_FILE = /\.tsx?$/;
const SPEC_FILE = /\.spec\.tsx?$/;

// Generated output is not cleaned between runs, so start from the examples that exist in the source tree.
async function findExampleDirs(): Promise<string[]> {
    const exampleDirs: string[] = [];
    for (const page of await readdir(DOCS_ROOT, { withFileTypes: true })) {
        const examplesRoot = join(DOCS_ROOT, page.name, '_examples');
        if (page.isDirectory() && existsSync(examplesRoot)) {
            for (const example of await readdir(examplesRoot, { withFileTypes: true })) {
                if (example.isDirectory()) {
                    exampleDirs.push(join('docs', page.name, '_examples', example.name));
                }
            }
        }
    }
    return exampleDirs;
}

async function writeFramework(framework: string, exampleDirs: string[]): Promise<number> {
    const frameworkRoot = join(OUTPUT_ROOT, framework);
    let exampleCount = 0;
    for (const example of exampleDirs) {
        const contentsPath = join(GENERATED_ROOT, example, framework, 'contents.json');
        if (!existsSync(contentsPath)) {
            continue;
        }
        const { files, boilerPlateFiles } = JSON.parse(await readFile(contentsPath, 'utf8'));
        const exampleDir = join(frameworkRoot, example);
        const allFiles: Record<string, string> = { ...boilerPlateFiles, ...files };
        stripOutExampleGeneratorCode(allFiles);
        for (const fileName of Object.keys(allFiles)) {
            if (TYPE_CHECKED_FILE.test(fileName) && !SPEC_FILE.test(fileName)) {
                const filePath = join(exampleDir, fileName);
                await mkdir(dirname(filePath), { recursive: true });
                await writeFile(filePath, allFiles[fileName]);
            }
        }
        exampleCount++;
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

function typeCheck(framework: string): Promise<{ framework: string; output: string; failed: boolean }> {
    return new Promise((resolve) => {
        const child = spawn(TSC, ['-p', join(OUTPUT_ROOT, framework, 'tsconfig.json'), '--pretty', 'false']);
        let output = '';
        child.stdout.on('data', (chunk) => (output += chunk));
        child.stderr.on('data', (chunk) => (output += chunk));
        child.on('close', (code) => resolve({ framework, output, failed: code !== 0 }));
    });
}

async function main() {
    const frameworks = Object.keys(FRAMEWORK_OPTIONS);
    await rm(OUTPUT_ROOT, { recursive: true, force: true });
    const exampleDirs = await findExampleDirs();
    for (const framework of frameworks) {
        console.log(`${framework}: ${await writeFramework(framework, exampleDirs)} examples`);
    }

    const results = await Promise.all(frameworks.map(typeCheck));
    let errorCount = 0;
    for (const { framework, output, failed } of results) {
        const errors = output.split('\n').filter((line) => line.includes('error TS'));
        errorCount += errors.length;
        console.log(`\n${framework}: ${failed ? `${errors.length} errors` : 'OK'}`);
        errors.forEach((line) => console.log(`  ${relative(OUTPUT_ROOT, line)}`));
        if (failed && errors.length === 0) {
            console.log(output);
        }
    }

    if (results.some((result) => result.failed)) {
        console.error(`\nGenerated examples failed to type-check (${errorCount} errors).`);
        process.exit(1);
    }
}

main();
