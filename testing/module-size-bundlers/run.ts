import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

import { APPS, appName, appSource } from './apps';
import { BUNDLERS } from './bundlers';

/** Same shape as testing/module-size results, plus the bundler, so the PR report can show both. */
interface ModuleSizeResult {
    modules: string[];
    bundler: string;
    selfSize: number;
    gzipSelfSize: number;
    fileSize: number;
    gzipSize: number;
}

const buildRoot = path.join(import.meta.dirname, '.build');
const outputFile = path.join(import.meta.dirname, 'module-size-results-bundlers.json');

const toKb = (bytes: number) => parseFloat((bytes / 1024).toFixed(2));

function measure(files: string[]): { fileSize: number; gzipSize: number } {
    if (files.length === 0) {
        throw new Error('The build emitted no JavaScript');
    }
    const contents = Buffer.concat(files.sort().map((file) => fs.readFileSync(file)));
    return { fileSize: toKb(contents.length), gzipSize: toKb(zlib.gzipSync(contents).length) };
}

async function run() {
    fs.rmSync(buildRoot, { recursive: true, force: true });
    const results: ModuleSizeResult[] = [];

    for (const bundler of BUNDLERS) {
        let base: { fileSize: number; gzipSize: number } | undefined;

        for (const app of APPS) {
            const appDir = path.join(buildRoot, bundler.name.replace(/\W+/g, '-'), appName(app).join('+') || 'base');
            fs.mkdirSync(appDir, { recursive: true });
            const entry = path.join(appDir, 'main.tsx');
            fs.writeFileSync(entry, appSource(app));

            const { fileSize, gzipSize } = measure(await bundler.build(entry, path.join(appDir, 'dist')));
            // The baseline app reports its full size, as in testing/module-size, so shared-code regressions stay visible.
            const subtract = base ?? { fileSize: 0, gzipSize: 0 };
            base ??= { fileSize, gzipSize };

            console.log(
                `${bundler.name}: ${appName(app).join(', ') || 'no modules'}: ${fileSize} kB | gzip ${gzipSize} kB`
            );
            results.push({
                modules: appName(app),
                bundler: bundler.name,
                selfSize: parseFloat((fileSize - subtract.fileSize).toFixed(2)),
                gzipSelfSize: parseFloat((gzipSize - subtract.gzipSize).toFixed(2)),
                fileSize,
                gzipSize,
            });
        }
    }

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`Results (${results.length}) saved to ${path.basename(outputFile)}`);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
