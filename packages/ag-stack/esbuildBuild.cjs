const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const rootConfig = require('../../esbuild.config.cjs');

const PROJECT_NAME = process.env.NX_TASK_TARGET_PROJECT;
// `production` and `staging` nx configurations omit inline sourcemaps; every other configuration
// (default build, archive, etc.) keeps them for easier debugging. Minification runs unconditionally
// — the docs site's local /files/ endpoint serves .min.js in every non-dev environment.
const includeInlineSourcemap = !['production', 'staging'].includes(process.env.NX_TASK_TARGET_CONFIGURATION ?? '');

// Exclude the minification plugin — we handle minification ourselves to control output filenames.
const plugins = rootConfig.plugins.filter((p) => p.name !== 'minification-plugin');

// Mapping from esbuild entry point base names to desired output names.
const nameMap = {
    'main-umd': PROJECT_NAME,
};

/** @type {import('esbuild').Plugin} */
const umdPostBuildPlugin = {
    name: 'umd-post-build-plugin',
    setup(build) {
        build.initialOptions.metafile = true;

        if (includeInlineSourcemap) {
            build.initialOptions.sourcemap = 'inline';
        }

        build.onEnd(async (result) => {
            if (!result.metafile) return;

            // 1. Rename output files from entry-point names to project names.
            const outputFiles = Object.keys(result.metafile.outputs).filter((f) => !f.endsWith('.map'));
            const renamedFiles = [];

            for (const outputFile of outputFiles) {
                const dir = path.dirname(outputFile);
                const basename = path.basename(outputFile);
                let newBasename = basename;

                for (const [from, to] of Object.entries(nameMap)) {
                    if (basename.startsWith(from)) {
                        newBasename = basename.replace(from, to);
                        break;
                    }
                }

                const resolvedOutput = path.resolve(outputFile);
                const newPath = newBasename !== basename ? path.resolve(dir, newBasename) : resolvedOutput;

                if (newBasename !== basename) {
                    try {
                        await fs.rename(resolvedOutput, newPath);
                    } catch (e) {
                        if (e.code !== 'ENOENT') throw e;
                    }
                }

                renamedFiles.push(newPath);
            }

            // 2. Always produce .min variants so local /files/ consumers (default build preview,
            //    staging, archive) can request the minified bundle uniformly. The build cost is a
            //    single esbuild.transform pass per entry point.
            await Promise.all(
                renamedFiles.map(async (filePath) => {
                    const contents = await fs.readFile(filePath, 'utf-8');
                    const minified = await esbuild.transform(contents, { minify: true });
                    const parsed = path.parse(filePath);
                    // Match naming convention: ag-grid-community.min.js, ag-grid-community.min.noStyle.js
                    const baseParts = parsed.name.split('.');
                    const projectBase = baseParts[0]; // e.g. 'ag-grid-community'
                    const suffix = baseParts.slice(1).join('.'); // e.g. 'noStyle' or ''
                    const minName = suffix
                        ? `${projectBase}.min.${suffix}${parsed.ext}`
                        : `${projectBase}.min${parsed.ext}`;
                    await fs.writeFile(path.join(parsed.dir, minName), minified.code);
                })
            );
        });
    },
};

plugins.push(umdPostBuildPlugin);

module.exports = {
    ...rootConfig,
    plugins,
};
