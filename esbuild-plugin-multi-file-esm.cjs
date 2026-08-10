/**
 * Makes an unbundled (`bundle: false`) esbuild run produce a publishable ESM tree.
 *
 * We ship bundled ESM everywhere else, which means a consumer's bundler sees a
 * single module and every elimination decision falls to their minifier. Without
 * scope hoisting — which webpack refuses whenever a module is referenced across a
 * chunk boundary, the default under `splitChunks: { chunks: 'all' }` — a minifier
 * cannot prove `class extends ns.BeanStub` pure, and our feature classes reference
 * each other in cycles, so retaining one retains the subsystem. Separately,
 * `allEnterpriseModule` imports `AllCommunityModule` for its `dependsOn`, and
 * webpack never revises that import edge once it proves the reference dead, so the
 * whole community graph stays pinned.
 *
 * Emitting one file per source module removes both: webpack drops unreferenced
 * files outright, without needing to prove anything about their contents.
 *
 * `bundle: false` leaves two gaps that this plugin fills, because esbuild resolves
 * nothing in that mode:
 *
 *   1. Relative specifiers keep their authored, extensionless form, which is not
 *      valid ESM. They get the output extension appended.
 *   2. `.css` imports are never loaded, so `onLoad` does not fire and the shared
 *      cssPlugin cannot see them. Each stylesheet is compiled to a sibling module
 *      exporting the processed text, matching what the bundled build inlines.
 */
const fs = require('fs/promises');
const path = require('path');

const { compileCssToText } = require('./esbuild-css-text.cjs');

/** Relative specifiers in esbuild output, covering `import`, `export … from` and side-effect imports. */
const RELATIVE_SPECIFIER = /\b(from|import)(\s*)"(\.[^"]*)"/g;

/** @param {import('esbuild').BuildOptions} options */
function outdirOf(options) {
    return options.outdir ? path.resolve(options.outdir) : undefined;
}

/**
 * @param {string} dir
 * @param {RegExp} match
 * @returns {Promise<string[]>}
 */
async function collectFiles(dir, match, found = []) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await collectFiles(entryPath, match, found);
        } else if (match.test(entry.name)) {
            found.push(entryPath);
        }
    }
    return found;
}

/**
 * Matches the modules this build emits.
 *
 * @param {string} outExtension
 * @returns {RegExp}
 */
function outputFileMatcher(outExtension) {
    return new RegExp(`${escapeExtension(outExtension)}$`);
}

/**
 * Matches everything this build owns in the output tree, which is what cleanup has to
 * remove: the emitted modules, the minified bundle a later plugin derives from them —
 * `.min` sits before the final extension, so `main.esm.mjs` becomes `main.esm.min.mjs`
 * and the module matcher above would miss it — and the sourcemaps of both.
 *
 * @param {string} outExtension
 * @returns {RegExp}
 */
function ownedFileMatcher(outExtension) {
    const ext = path.extname(outExtension);
    const base = outExtension.slice(0, -ext.length);
    return new RegExp(`${escapeExtension(base)}(\\.min)?${escapeExtension(ext)}(\\.map)?$`);
}

/**
 * @param {string} extension
 * @returns {string}
 */
function escapeExtension(extension) {
    return extension.replaceAll('.', '\\.');
}

/**
 * Deletes every file matching `match` under `dir`, plus any directory left empty by
 * doing so. Anything else is left alone.
 *
 * @param {string} dir
 * @param {RegExp} match
 * @returns {Promise<number>} how many files were removed
 */
async function removeMatchingFiles(dir, match) {
    let removed = 0;
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            removed += await removeMatchingFiles(entryPath, match);
            // Fails, harmlessly, while the directory still holds files we do not own.
            await fs.rmdir(entryPath).catch(() => {});
        } else if (match.test(entry.name)) {
            await fs.rm(entryPath);
            ++removed;
        }
    }
    return removed;
}

/**
 * Clears the ESM tree left by the previous run.
 *
 * The CJS target writes its bundle and the package manifest into this same
 * directory, so this build cannot let esbuild delete the output path wholesale
 * without destroying them — it removes only what it owns instead, which keeps the
 * two targets' ownership of the directory explicit.
 *
 * Doing it up front also means `rewriteSpecifiers` never meets a file from an
 * earlier run: those have already had their specifiers rewritten, and re-resolving
 * an extension that is already there would fail.
 *
 * @param {string} outdir
 * @param {string} outExtension
 * @returns {Promise<number>} how many files were removed
 */
async function cleanEsmTree(outdir, outExtension) {
    try {
        return await removeMatchingFiles(outdir, ownedFileMatcher(outExtension));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return 0; // Nothing built here yet.
        }
        throw error;
    }
}

/**
 * esbuild derives output paths from the lowest common ancestor of the entry points
 * when `outbase` is unset, so the source root has to be derived the same way for
 * output paths to line up.
 *
 * @param {(string | { in: string })[]} entryPoints
 * @returns {string}
 */
function sourceRootOf(entryPoints) {
    const dirs = entryPoints.map((entry) => path.dirname(path.resolve(typeof entry === 'string' ? entry : entry.in)));
    let root = dirs[0];
    for (let i = 1, len = dirs.length; i < len; ++i) {
        while (dirs[i] !== root && !dirs[i].startsWith(root + path.sep)) {
            root = path.dirname(root);
        }
    }
    return root;
}

/**
 * @param {string} sourceRoot
 * @param {string} outdir
 * @param {string} outExtension
 * @returns {Promise<number>} how many stylesheets were emitted
 */
async function emitCssModules(sourceRoot, outdir, outExtension) {
    const cssFiles = await collectFiles(sourceRoot, /\.css$/);
    await Promise.all(
        cssFiles.map(async (cssFile) => {
            const { css } = await compileCssToText(cssFile);
            const target = path.join(outdir, path.relative(sourceRoot, cssFile) + outExtension);
            await fs.mkdir(path.dirname(target), { recursive: true });
            await fs.writeFile(target, `export default ${JSON.stringify(css)};\n`);
        })
    );
    return cssFiles.length;
}

/**
 * Resolves against the emitted tree rather than the sources, so that generated
 * modules (the stylesheets above) resolve on the same terms as compiled ones.
 *
 * @param {Set<string>} emitted absolute paths of every file in the output tree
 * @param {string} fromDir
 * @param {string} specifier
 * @param {string} outExtension
 * @returns {string | null} the specifier to write, or null if nothing matched
 */
function resolveSpecifier(emitted, fromDir, specifier, outExtension) {
    for (const suffix of [outExtension, `/index${outExtension}`]) {
        if (emitted.has(path.resolve(fromDir, specifier + suffix))) {
            return specifier + suffix;
        }
    }
    return null;
}

/**
 * @param {string} outdir
 * @param {string} outExtension
 * @returns {Promise<number>} how many specifiers were rewritten
 */
async function rewriteSpecifiers(outdir, outExtension) {
    const files = await collectFiles(outdir, outputFileMatcher(outExtension));
    const emitted = new Set(files);
    const unresolved = [];
    let rewritten = 0;

    await Promise.all(
        files.map(async (file) => {
            const source = await fs.readFile(file, 'utf-8');
            const fromDir = path.dirname(file);
            const output = source.replace(RELATIVE_SPECIFIER, (whole, keyword, gap, specifier) => {
                const resolved = resolveSpecifier(emitted, fromDir, specifier, outExtension);
                if (!resolved) {
                    unresolved.push(`${path.relative(outdir, file)} -> ${specifier}`);
                    return whole;
                }
                ++rewritten;
                return `${keyword}${gap}"${resolved}"`;
            });
            if (output !== source) {
                await fs.writeFile(file, output);
            }
        })
    );

    if (unresolved.length) {
        throw new Error(
            `multi-file-esm: ${unresolved.length} relative import(s) did not resolve in the output tree, ` +
                `so the published ESM would fail to load:\n  ${unresolved.slice(0, 20).join('\n  ')}`
        );
    }
    return rewritten;
}

/**
 * Deletes everything the entry cannot reach.
 *
 * An unbundled build compiles every source file in the project, not just the ones
 * the package entry uses. That would publish the UMD entry points — which register
 * every module on import and pull in stylesheets from a package we do not depend on
 * — along with any stylesheet or module nothing imports. Walking out from the entry
 * keeps this correct as sources come and go, where an exclude list would rot.
 *
 * Safe because the sources contain no dynamic imports: every edge is statically
 * visible here.
 *
 * @param {string} outdir
 * @param {string} entryFile
 * @param {string} outExtension
 * @returns {Promise<number>} how many modules were removed
 */
async function pruneUnreachable(outdir, entryFile, outExtension) {
    const files = await collectFiles(outdir, outputFileMatcher(outExtension));
    const emitted = new Set(files);

    const reachable = new Set();
    const queue = [entryFile];
    while (queue.length) {
        const file = queue.pop();
        if (reachable.has(file) || !emitted.has(file)) {
            continue;
        }
        reachable.add(file);
        const source = await fs.readFile(file, 'utf-8');
        const fromDir = path.dirname(file);
        for (const [, , , specifier] of source.matchAll(RELATIVE_SPECIFIER)) {
            queue.push(path.resolve(fromDir, specifier));
        }
    }

    const orphans = files.filter((file) => !reachable.has(file));
    await Promise.all(orphans.flatMap((file) => [fs.rm(file), fs.rm(`${file}.map`, { force: true })]));
    return orphans.length;
}

/**
 * @param {{ entry: string }} options basename of the package entry, without extension
 * @returns {import('esbuild').Plugin}
 */
const multiFileEsmPlugin = ({ entry }) => ({
    name: 'multi-file-esm',
    setup(build) {
        const { initialOptions } = build;
        const outdir = outdirOf(initialOptions);
        const outExtension = initialOptions.outExtension?.['.js'];

        // A bundled build needs none of this, since esbuild resolves and inlines
        // everything itself. Refuse rather than no-op, so a build that picks this
        // plugin up by accident says so instead of silently publishing a tree with
        // unresolvable imports.
        if (initialOptions.bundle !== false || initialOptions.format !== 'esm' || !outdir || !outExtension) {
            throw new Error(
                'multi-file-esm: only applies to an unbundled ESM build, and requires `outdir` ' +
                    'plus an `outExtension` for ".js".'
            );
        }

        let cleaned = 0;

        build.onStart(async () => {
            cleaned = await cleanEsmTree(outdir, outExtension);
        });

        build.onEnd(async (result) => {
            if (result.errors.length) {
                return; // esbuild reports its own errors; bail rather than mask them.
            }

            const sourceRoot = sourceRootOf(initialOptions.entryPoints ?? []);
            const stylesheets = await emitCssModules(sourceRoot, outdir, outExtension);
            const rewritten = await rewriteSpecifiers(outdir, outExtension);
            const pruned = await pruneUnreachable(outdir, path.join(outdir, entry + outExtension), outExtension);

            if (process.env.AG_MULTI_FILE_ESM_DEBUG) {
                console.error(
                    `[multi-file-esm] ${cleaned} stale files cleared, ${stylesheets} stylesheets, ` +
                        `${rewritten} specifiers rewritten, ${pruned} unreachable modules removed in ${outdir}`
                );
            }
        });
    },
});

module.exports = { multiFileEsmPlugin };
