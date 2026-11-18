const fs = require('node:fs');
const path = require('node:path');

const { syncDirectory } = require('../../../../scripts/package/sync-directory.cjs');

const esbuildPackageDir = path.dirname(require.resolve('@nx/esbuild/package.json'));
const { executors } = require('@nx/esbuild/executors.json');
const esbuildExecutor = require(path.join(esbuildPackageDir, executors.esbuild.implementation)).default;

async function* esbuildStagedExecutor(options, context) {
    // esbuild's own watch rebuilds formats apart: a copy could read another format's half-written files.
    if (options.watch) {
        yield* esbuildExecutor({ ...options, deleteOutputPath: false }, context);
        return;
    }
    const outputDir = path.resolve(context.root, options.outputPath);
    const target = context.targetName ?? 'build';
    const configuration = context.configurationName ?? 'default';
    // A sibling keeps source maps' relative paths valid once copied.
    const parentDir = path.dirname(outputDir);
    fs.mkdirSync(parentDir, { recursive: true });
    const stagingDir = fs.mkdtempSync(path.join(parentDir, `.build-staging-${path.basename(outputDir)}-`));
    // Watch builds skip steps such as minification, so they keep the files a full build wrote.
    const isWatch = configuration === 'watch' || target.endsWith(':watch');
    const outputPath = path.relative(context.root, stagingDir);
    // The executor also reads `outputPath` from the context's target options (its `getOutfile`).
    const stagedContext = {
        ...context,
        target: { ...context.target, options: { ...context.target.options, outputPath } },
    };
    const resultPerFormat = [];
    try {
        for await (const result of esbuildExecutor({ ...options, outputPath, deleteOutputPath: true }, stagedContext)) {
            resultPerFormat.push(result);
        }
        if (resultPerFormat.length > 0 && resultPerFormat.every((result) => result.success)) {
            // Keeps `dist/package` and `dist/types` beside the UMD builds that share `dist/`.
            syncDirectory(stagingDir, outputDir, { deleteStale: !isWatch, keepTopLevelFolders: true });
        }
    } finally {
        fs.rmSync(stagingDir, { recursive: true, force: true });
    }
    yield* resultPerFormat;
}

module.exports = esbuildStagedExecutor;
