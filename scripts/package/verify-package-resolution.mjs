// Type-checks an extracted package as installed, under node16 and bundler resolution with `skipLibCheck` off.
// Usage: verify-package-resolution.mjs [--dom-free <subpath>...] -- <extracted package dir>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';

const DOM_LIB = ['lib.es2023.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'];
const DOM_FREE_LIB = ['lib.es2022.d.ts', 'lib.webworker.d.ts'];
const RESOLUTIONS = [
    { label: 'node16', moduleResolution: ts.ModuleResolutionKind.Node16, module: ts.ModuleKind.Node16 },
    { label: 'bundler', moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext },
];

const { packageDir, domFreeSubpaths } = parseArgs(process.argv.slice(2));
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
const { name } = packageJson;

if (Object.keys({ ...packageJson.dependencies, ...packageJson.peerDependencies }).length > 0) {
    fail(`${name} has dependencies, which this check does not install`);
}

const subpaths = Object.keys(packageJson.exports ?? { '.': null })
    .filter((key) => key !== './package.json')
    .map((key) => key.replace(/^\.\/?/, ''));
for (const subpath of domFreeSubpaths) {
    if (!subpaths.includes(subpath)) {
        fail(`--dom-free ${subpath} is not an export of ${name}`);
    }
}

const errors = [];

const consumerDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-package-resolution-'));
try {
    const installedDir = path.join(consumerDir, 'node_modules', name);
    fs.mkdirSync(path.dirname(installedDir), { recursive: true });
    fs.symlinkSync(path.resolve(packageDir), installedDir, 'dir');

    const specifier = (subpath) => (subpath === '' ? name : `${name}/${subpath}`);
    for (const resolution of RESOLUTIONS) {
        errors.push(...typeCheck(consumerDir, resolution, subpaths.map(specifier), DOM_LIB));
    }
    if (domFreeSubpaths.length > 0) {
        const bundler = RESOLUTIONS.find(({ label }) => label === 'bundler');
        const domFree = { ...bundler, label: 'bundler, without DOM' };
        errors.push(...typeCheck(consumerDir, domFree, domFreeSubpaths.map(specifier), DOM_FREE_LIB));
    }
} finally {
    fs.rmSync(consumerDir, { recursive: true, force: true });
}

if (errors.length > 0) {
    fail(errors.join('\n'));
}
console.log(`[${name}] resolves and type-checks under ${RESOLUTIONS.map(({ label }) => label).join(', ')}`);

function parseArgs(args) {
    const separator = args.indexOf('--');
    const [dir] = separator === -1 ? [] : args.slice(separator + 1);
    const options = separator === -1 ? args : args.slice(0, separator);
    if (!dir || (options.length > 0 && options[0] !== '--dom-free')) {
        fail('usage: verify-package-resolution.mjs [--dom-free <subpath>...] -- <extracted package dir>');
    }
    return { packageDir: dir, domFreeSubpaths: options.slice(1) };
}

function typeCheck(dir, { label, moduleResolution, module }, specifiers, lib) {
    const checkFile = path.join(dir, 'check.ts');
    const source = specifiers.map((spec, i) => `import * as m${i} from '${spec}';\nexport { m${i} };`).join('\n');
    fs.writeFileSync(checkFile, source + '\n');

    const options = {
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        preserveSymlinks: true,
        types: [],
        lib,
        module,
        moduleResolution,
    };
    const program = ts.createProgram([checkFile], options);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    if (diagnostics.length === 0) {
        return [];
    }
    const host = {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => dir,
        getNewLine: () => '\n',
    };
    return [`[${name}] ${label} resolution:\n${ts.formatDiagnostics(diagnostics, host)}`];
}

function fail(message) {
    console.error(message);
    process.exit(1);
}
