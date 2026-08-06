const esbuild = require('esbuild');
const fs = require('fs/promises');
const path = require('path');

const rootConfig = require('../../esbuild.config.cjs');
const { multiFileEsmPlugin } = require('../../esbuild-plugin-multi-file-esm.cjs');

/** The unbundled entry, and the minified bundle produced from it. */
const ENTRY_NAME = 'main';

/**
 * Bare (non-relative) specifiers in the emitted tree; everything else is a sibling
 * file. Side-effect imports have no `from`, and missing one would leave a package
 * to be inlined into the bundle rather than kept external.
 */
const BARE_SPECIFIER = /\b(?:from|import)\s*"([^".][^"]*)"/g;

/**
 * Collects the packages the emitted tree still imports, so they can be kept external
 * when it is bundled back up. Reading them off the tree rather than repeating the
 * list keeps the two from falling out of step.
 *
 * @param {string} dir
 * @param {string} outExtension
 * @returns {Promise<string[]>}
 */
async function collectExternals(dir, outExtension, found = new Set()) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await collectExternals(entryPath, outExtension, found);
        } else if (entry.name.endsWith(outExtension)) {
            const source = await fs.readFile(entryPath, 'utf-8');
            for (const [, specifier] of source.matchAll(BARE_SPECIFIER)) {
                found.add(specifier);
            }
        }
    }
    return [...found];
}

/**
 * Rebuilds the emitted ESM tree into the single minified file we have always
 * published as `main.esm.min.mjs`.
 *
 * Bundling the *output* rather than the sources is what keeps this honest: it can
 * only ever contain what we actually ship, so it cannot diverge from the tree the
 * way a second source-level build could. It also needs no CSS handling, since
 * stylesheets are already plain JS modules by this point.
 *
 * Everything the tree imports by bare specifier (ag-grid-community, ag-stack)
 * stays external, matching the bundled build this replaces.
 *
 * @type {import('esbuild').Plugin}
 */
const minifiedBundlePlugin = {
    name: 'minified-esm-bundle',
    setup(build) {
        const { initialOptions } = build;

        build.onEnd(async (result) => {
            if (result.errors.length) {
                return; // esbuild reports its own errors; bail rather than mask them.
            }

            const outdir = path.resolve(initialOptions.outdir);
            const outExtension = initialOptions.outExtension['.js'];

            // `.min` goes before the final extension, not before the whole of
            // `.esm.mjs`: main.esm.mjs -> main.esm.min.mjs, matching every other package.
            const entryFile = path.join(outdir, ENTRY_NAME + outExtension);
            const { name, ext } = path.parse(entryFile);

            await esbuild.build({
                entryPoints: [entryFile],
                outfile: path.join(outdir, `${name}.min${ext}`),
                bundle: true,
                minify: true,
                format: 'esm',
                platform: initialOptions.platform,
                target: initialOptions.target,
                // Listed explicitly rather than via `packages: 'external'`, which the
                // workspace tsconfig's path mappings override — esbuild would then
                // follow ag-grid-community back to its TypeScript sources.
                external: await collectExternals(outdir, outExtension),
                sourcemap: initialOptions.sourcemap,
                logLevel: 'warning',
            });
        });
    },
};

// Drop the shared minification plugin: it minifies every emitted file, which for an
// unbundled build would mean a `.min` sibling for all 600-odd of them. The single
// bundled artifact consumers actually expect is produced above instead.
const plugins = rootConfig.plugins.filter((p) => p.name !== 'minification-plugin');

plugins.push(multiFileEsmPlugin({ entry: ENTRY_NAME }), minifiedBundlePlugin);

module.exports = {
    ...rootConfig,
    plugins,
};
