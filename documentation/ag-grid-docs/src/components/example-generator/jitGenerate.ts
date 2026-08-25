import { getExampleRootFileUrl, getRootUrl } from '@utils/pages';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

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

const PLUGIN_DIST = 'plugins/ag-grid-generate-example-files/dist';

let generator:
    | {
          generateFiles: GenerateFiles;
          gridOptionsTypes: Record<string, unknown>;
      }
    | undefined;

/**
 * Loaded lazily, and via an absolute path built at runtime, so that vite never tries to resolve or
 * bundle the plugin into the production output.
 */
function loadGenerator() {
    if (generator) {
        return generator;
    }

    const require = createRequire(import.meta.url);
    const distRoot = path.join(getRootUrl().pathname, PLUGIN_DIST);

    const { generateFiles } = require(path.join(distRoot, 'src/executors/generate/executor.js'));
    const { getGridOptionsType } = require(path.join(distRoot, 'gridOptionsTypes/buildGridOptionsType.js'));

    // ~2s of typescript program construction, paid once per dev-server process.
    generator = { generateFiles, gridOptionsTypes: getGridOptionsType() };

    return generator;
}

const getSourcePath = ({ pageName, exampleName }: { pageName: string; exampleName: string }) =>
    path.join(process.cwd(), 'src/content/docs', pageName, '_examples', exampleName);

const getOutputPath = ({ pageName, exampleName }: { pageName: string; exampleName: string }) =>
    path.join(getExampleRootFileUrl().pathname, 'docs', pageName, '_examples', exampleName);

/**
 * Newest mtime across the example source folder, including the `provided/` framework overrides.
 */
async function getSourceModifiedTime(folderPath: string): Promise<number> {
    const entries = await fs.readdir(folderPath, { withFileTypes: true, recursive: true }).catch(() => undefined);
    if (!entries) {
        // No such example — let the caller surface the missing `contents.json` as it always has.
        return -1;
    }

    const stats = await Promise.all(
        entries
            .filter((entry) => entry.isFile())
            .map((entry) => fs.stat(path.join(entry.parentPath ?? folderPath, entry.name)))
    );

    return stats.reduce((newest, stat) => Math.max(newest, stat.mtimeMs), 0);
}

async function getGeneratedModifiedTime(outputPath: string): Promise<number> {
    const frameworks = await fs.readdir(outputPath, { withFileTypes: true }).catch(() => []);
    const contentsFiles = frameworks
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(outputPath, entry.name, 'contents.json'));

    if (contentsFiles.length === 0) {
        return 0;
    }

    const stats = await Promise.all(contentsFiles.map((file) => fs.stat(file).catch(() => undefined)));

    // Any missing framework output means the example has to be regenerated in full.
    return stats.some((stat) => stat === undefined)
        ? 0
        : stats.reduce((oldest, stat) => Math.min(oldest, stat!.mtimeMs), Infinity);
}

const inFlight = new Map<string, Promise<void>>();

async function generateExample(params: { pageName: string; exampleName: string }) {
    const sourcePath = getSourcePath(params);
    const outputPath = getOutputPath(params);

    const [sourceModified, generatedModified] = await Promise.all([
        getSourceModifiedTime(sourcePath),
        getGeneratedModifiedTime(outputPath),
    ]);

    if (sourceModified < 0 || generatedModified > sourceModified) {
        return;
    }

    const { generateFiles, gridOptionsTypes } = loadGenerator();
    const start = performance.now();

    await generateFiles(
        { mode: 'dev', examplePath: sourcePath, outputPath, inputs: [], output: '', writeFiles: false },
        gridOptionsTypes
    );

    // eslint-disable-next-line no-console
    console.log(
        `Generated example \x1b[32m${params.pageName}/${params.exampleName}\x1b[0m in ${Math.round(performance.now() - start)}ms`
    );
}

/**
 * Ensures `contents.json` exists and is newer than the example source, generating it if not.
 * Concurrent requests for the same example share a single generation.
 */
export async function ensureGeneratedExample(params: { pageName: string; exampleName: string }): Promise<void> {
    const key = `${params.pageName}/${params.exampleName}`;

    let pending = inFlight.get(key);
    if (!pending) {
        pending = generateExample(params).finally(() => inFlight.delete(key));
        inFlight.set(key, pending);
    }

    return pending;
}
