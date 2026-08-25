import { getExampleRootFileUrl, getRootUrl } from '@utils/pages';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Dev-only just-in-time example generation.
 *
 * The `generate-examples` nx target fans out to ~1,100 per-example tasks; hashing and restoring
 * them costs well over a minute of `nx dev` startup even when every one is a cache hit, where
 * generating a single example in-process takes tens of milliseconds.
 *
 * Output goes to the same `dist/generated-examples` location, in the same format, as the nx
 * executor, so nothing downstream of `contents.json` has to know which of the two produced it.
 */

type GenerateFiles = (
    options: {
        mode: 'dev' | 'prod';
        examplePath: string;
        outputPath: string;
        inputs: string[];
        output: string;
        writeFiles: boolean;
    },
    gridOptionsTypes: Record<string, unknown>
) => Promise<unknown>;

type ExampleParams = { pageName: string; exampleName: string; framework: string };

const PLUGIN_DIST = 'plugins/ag-grid-generate-example-files/dist';

/**
 * Everything, beyond the example's own source, that generation reads and that therefore has to
 * invalidate output. Mirrors the `inputs` of the nx `generate-example` target
 * (`plugins/ag-grid-task-autogen/src/generate-example-files.ts`), which is the definition of
 * up-to-date that the executor's own caching uses:
 *
 *  - the compiled generator, plus the `GridOptions` type source it builds its type lookup from
 *  - the angular boilerplate, copied verbatim into every angular example
 *  - the grid's public type declarations, which that type lookup resolves against
 */
const GENERATOR_INPUTS = [
    PLUGIN_DIST,
    'plugins/ag-grid-generate-example-files/gridOptionsTypes',
    'documentation/ag-grid-docs/public/example-runner',
    'packages/ag-grid-community/dist/types',
];

/**
 * Records, per example, the generator inputs that produced the output on disk, so that a generator
 * change invalidates it. Per example rather than once globally: a single shared stamp cannot be
 * advanced without either lying about the examples it has not regenerated yet, or re-regenerating
 * the ones it has. Kept in a sibling folder rather than inside the output so that what the JIT path
 * leaves in `docs/` stays byte-identical to what the nx executor produces.
 */
const STAMPS_DIR = '.jit-generator-stamps';

const getWorkspaceRoot = () => fileURLToPath(getRootUrl());
const getGeneratedRoot = () => fileURLToPath(getExampleRootFileUrl());
const getPluginDistRoot = () => path.join(getWorkspaceRoot(), PLUGIN_DIST);

let generator: { generateFiles: GenerateFiles; gridOptionsTypes: Record<string, unknown> } | undefined;

/**
 * Loaded lazily, and via an absolute path built at runtime, so that vite never tries to resolve or
 * bundle the plugin into the production output.
 */
function loadGenerator() {
    if (!generator) {
        const require = createRequire(import.meta.url);
        const distRoot = getPluginDistRoot();

        const { generateFiles } = require(path.join(distRoot, 'src/executors/generate/executor.js'));
        const { getGridOptionsType } = require(path.join(distRoot, 'gridOptionsTypes/buildGridOptionsType.js'));

        // ~2s of typescript program construction, paid once per dev-server process.
        generator = { generateFiles, gridOptionsTypes: getGridOptionsType() };
    }

    return generator;
}

async function listFiles(folderPath: string) {
    const entries = await fs.readdir(folderPath, { withFileTypes: true, recursive: true }).catch(() => undefined);

    return entries?.map((entry) => ({ entry, entryPath: path.join(entry.parentPath ?? folderPath, entry.name) }));
}

/**
 * Content hash rather than mtime: a cached nx rebuild of the generator, or of the grid types,
 * rewrites its output with fresh mtimes but identical contents, which would otherwise invalidate
 * every example on every restart.
 */
async function hashGeneratorInputs() {
    const workspaceRoot = getWorkspaceRoot();
    const hash = createHash('sha1');

    for (const input of GENERATOR_INPUTS) {
        const inputRoot = path.join(workspaceRoot, input);
        const files = (await listFiles(inputRoot)) ?? [];

        const filePaths = files
            .filter(({ entry }) => entry.isFile())
            .map(({ entryPath }) => entryPath)
            .sort();

        for (const filePath of filePaths) {
            hash.update(path.relative(workspaceRoot, filePath));
            hash.update(await fs.readFile(filePath));
        }
    }

    return hash.digest('hex');
}

let generatorHash: Promise<string> | undefined;

/**
 * Hashed once per process. `loadGenerator` caches both the compiled generator and its `GridOptions`
 * type program, so a generator change mid-session cannot take effect without a restart in any case,
 * and re-hashing on every request would only slow each one down to no purpose.
 */
function getGeneratorHash() {
    generatorHash ??= hashGeneratorInputs();

    return generatorHash;
}

const getSourcePath = ({ pageName, exampleName }: ExampleParams) =>
    path.join(process.cwd(), 'src/content/docs', pageName, '_examples', exampleName);

const getOutputPath = ({ pageName, exampleName }: ExampleParams) =>
    path.join(getGeneratedRoot(), 'docs', pageName, '_examples', exampleName);

const getStampPath = ({ pageName, exampleName }: ExampleParams) =>
    path.join(getGeneratedRoot(), STAMPS_DIR, pageName, `${exampleName}.txt`);

/**
 * Directories are stated alongside files so that deleting a source file, which leaves every
 * surviving file's mtime untouched, still counts as a modification.
 */
async function getSourceModifiedTime(folderPath: string): Promise<number> {
    const entries = await listFiles(folderPath);
    if (!entries) {
        // No such example — let the caller surface the missing `contents.json` as it always has.
        return -1;
    }

    const stats = await Promise.all([folderPath, ...entries.map(({ entryPath }) => entryPath)].map((p) => fs.stat(p)));

    return stats.reduce((newest, stat) => Math.max(newest, stat.mtimeMs), 0);
}

const inFlight = new Map<string, Promise<void>>();

async function generateExample(params: ExampleParams) {
    const sourcePath = getSourcePath(params);
    const outputPath = getOutputPath(params);
    const stampPath = getStampPath(params);

    const [sourceModified, generated, currentHash, stampedHash] = await Promise.all([
        getSourceModifiedTime(sourcePath),
        fs.stat(path.join(outputPath, params.framework, 'contents.json')).catch(() => undefined),
        getGeneratorHash(),
        fs.readFile(stampPath, 'utf-8').catch(() => undefined),
    ]);

    if (sourceModified < 0) {
        return;
    }

    // With no stamp the output came from an nx build, whose own input hashing already kept it current.
    const generatorMatchesOutput = stampedHash === undefined || stampedHash === currentHash;

    if (generated && generated.mtimeMs > sourceModified && generatorMatchesOutput) {
        return;
    }

    const { generateFiles, gridOptionsTypes } = loadGenerator();
    const start = performance.now();

    await generateFiles(
        { mode: 'dev', examplePath: sourcePath, outputPath, inputs: [], output: '', writeFiles: false },
        gridOptionsTypes
    );

    await fs.mkdir(path.dirname(stampPath), { recursive: true });
    await fs.writeFile(stampPath, currentHash);

    // eslint-disable-next-line no-console
    console.log(
        `Generated example \x1b[32m${params.pageName}/${params.exampleName}\x1b[0m in ${Math.round(performance.now() - start)}ms`
    );
}

/**
 * Ensures the requested framework's `contents.json` exists and is newer than the example source,
 * generating it if not. Freshness is re-checked on every call so that editing an example mid-session
 * is picked up; concurrent requests for the same example share a single generation.
 */
export async function ensureGeneratedExample(params: ExampleParams): Promise<void> {
    const exampleKey = `${params.pageName}/${params.exampleName}`;

    let pending = inFlight.get(exampleKey);
    if (!pending) {
        pending = generateExample(params).finally(() => inFlight.delete(exampleKey));
        inFlight.set(exampleKey, pending);
    }

    return pending;
}
