const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const PROJECT_NAME = 'ag-grid-community';
const rootConfig = require('../../esbuild.config.cjs');

const isProduction = ['production', 'staging'].includes(process.env.NX_TASK_TARGET_CONFIGURATION ?? '');

// Exclude the minification plugin — we handle minification ourselves to control output filenames.
const plugins = rootConfig.plugins.filter((p) => p.name !== 'minification-plugin');

const sharedOptions = {
    bundle: true,
    format: 'cjs',
    platform: 'browser',
    target: 'es2020',
    tsconfig: path.resolve(__dirname, 'tsconfig.lib.json'),
    plugins,
};

const distDir = path.resolve(__dirname, 'dist');

async function minifyFile(inputFile, outputFile) {
    const contents = await fs.readFile(inputFile, 'utf-8');
    const result = await esbuild.transform(contents, { minify: true });
    await fs.writeFile(outputFile, result.code);
}

async function build() {
    if (isProduction) {
        console.log(`Building PRODUCTION UMDs for ${PROJECT_NAME}`);

        // Build both entry points in parallel
        await Promise.all([
            esbuild.build({
                ...sharedOptions,
                entryPoints: [path.resolve(__dirname, 'src/main-umd-styles.ts')],
                outfile: path.join(distDir, `${PROJECT_NAME}.js`),
            }),
            esbuild.build({
                ...sharedOptions,
                entryPoints: [path.resolve(__dirname, 'src/main-umd-noStyles.ts')],
                outfile: path.join(distDir, `${PROJECT_NAME}.noStyle.js`),
            }),
        ]);

        // Minify both to produce .min variants with correct naming
        await Promise.all([
            minifyFile(path.join(distDir, `${PROJECT_NAME}.js`), path.join(distDir, `${PROJECT_NAME}.min.js`)),
            minifyFile(
                path.join(distDir, `${PROJECT_NAME}.noStyle.js`),
                path.join(distDir, `${PROJECT_NAME}.min.noStyle.js`)
            ),
        ]);
    } else {
        console.log(`Building DEVELOPMENT UMDs for ${PROJECT_NAME}`);
        await esbuild.build({
            ...sharedOptions,
            entryPoints: [path.resolve(__dirname, 'src/main-umd-styles.ts')],
            outfile: path.join(distDir, `${PROJECT_NAME}.js`),
            sourcemap: 'inline',
        });
    }
}

build().catch((err) => {
    console.error(err);
    process.exit(1);
});
