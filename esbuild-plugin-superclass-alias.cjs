const fs = require('fs/promises');
const path = require('path');

const { parse } = require('acorn');

/**
 * Makes the bundled ESM tree shakeable by consumers whose bundler does not scope-hoist it.
 *
 * We ship one bundled ESM file per package, so a consumer's bundler sees a single module and
 * all dead-code elimination falls to its minifier. esbuild emits our classes as
 *
 *     var GridChartComp = class extends BeanStub { ... };
 *
 * where `BeanStub` is an import binding. When webpack cannot scope-hoist us into the consumer's
 * scope — which it refuses to do for any module referenced across a chunk boundary, and
 * `splitChunks: { chunks: 'all' }` creates exactly that — it rewrites the reference to
 * `ns.BeanStub`. A property access may invoke a getter, so terser will not drop the class, and
 * our feature classes reference each other in cycles: retaining one retains its whole subsystem.
 * 256 of ag-grid-enterprise's 355 `extends` sites are cross-package, so this retains most of the
 * package regardless of which modules the application registered.
 *
 * Hoisting the superclass into a local binding costs one statement webpack keeps, and leaves
 * every class extending a plain identifier, which a minifier will drop:
 *
 *     var __agSuperclass_BeanStub = BeanStub;
 *     var GridChartComp = class extends __agSuperclass_BeanStub { ... };
 */

/**
 * Superclasses are only aliased when they come from one of these packages.
 *
 * The alias reads the binding while the module body runs, so it captures a final value only if the
 * exporting module has already been evaluated. Our packages form a DAG — ag-stack, then
 * ag-grid-community, then ag-grid-enterprise, then the framework wrappers — and neither package
 * below imports one above it, so nothing here can be part of a cycle. Anything imported from
 * elsewhere is left as it is rather than assumed safe.
 */
const ALIASABLE_SOURCES = new Set(['ag-stack', 'ag-grid-community']);

const ALIAS_PREFIX = '__agSuperclass_';

function walk(node, visit) {
    visit(node);
    for (const key of Object.keys(node)) {
        const value = node[key];
        if (Array.isArray(value)) {
            for (const child of value) {
                if (child && typeof child.type === 'string') walk(child, visit);
            }
        } else if (value && typeof value.type === 'string') {
            walk(value, visit);
        }
    }
}

/**
 * @param {string} code bundled ESM
 * @returns {{ code: string, sites: number, aliases: number, skipped: string[] }}
 */
function aliasImportedSuperclasses(code) {
    if (code.includes(ALIAS_PREFIX)) {
        throw new Error(`bundle already contains the ${ALIAS_PREFIX} prefix; pick another to stay collision-free`);
    }

    const ast = parse(code, { ecmaVersion: 'latest', sourceType: 'module' });

    /** local binding name -> package it was imported from */
    const importedFrom = new Map();
    for (const node of ast.body) {
        if (node.type !== 'ImportDeclaration') continue;
        for (const specifier of node.specifiers) {
            importedFrom.set(specifier.local.name, node.source.value);
        }
    }

    const edits = [];
    const aliases = new Map();
    const skipped = new Set();
    walk(ast, (node) => {
        if (node.type !== 'ClassDeclaration' && node.type !== 'ClassExpression') return;
        const superClass = node.superClass;
        if (!superClass || superClass.type !== 'Identifier') return;
        const source = importedFrom.get(superClass.name);
        if (source === undefined) return; // declared in this bundle, so already a plain identifier
        if (!ALIASABLE_SOURCES.has(source)) {
            skipped.add(source);
            return;
        }
        const alias = `${ALIAS_PREFIX}${superClass.name}`;
        aliases.set(superClass.name, alias);
        edits.push({ start: superClass.start, end: superClass.end, text: alias });
    });

    if (edits.length === 0) {
        return { code, sites: 0, aliases: 0, preambleLines: 0, skipped: [...skipped] };
    }

    // Right to left, so earlier offsets stay valid.
    edits.sort((a, b) => b.start - a.start);
    let out = code;
    for (const edit of edits) {
        out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    }

    // Imports are hoisted and their modules evaluated before this body runs, so the top of the
    // file is the earliest point every binding is readable, and it precedes every class.
    const preamble = [...aliases].map(([name, alias]) => `var ${alias} = ${name};`).join('\n');

    return {
        code: `${preamble}\n${out}`,
        sites: edits.length,
        aliases: aliases.size,
        preambleLines: aliases.size,
        skipped: [...skipped],
    };
}

/**
 * Keeps an emitted source map pointing at the right lines.
 *
 * Only the default (non-production) build emits a map for the unminified ESM — production and
 * staging turn source maps off, so nothing we publish has one — but the docs site serves those
 * files locally and a map off by 254 lines is worse than no map at all.
 *
 * A leading `;` per preamble line shifts every mapping down by one line, which is the whole of the
 * structural change. Renaming a superclass in place still shifts columns after it on that one
 * line; that is a handful of class-heritage lines and not worth a full remap to correct.
 */
async function shiftSourceMapLines(mapFile, lines) {
    let raw;
    try {
        raw = await fs.readFile(mapFile, 'utf-8');
    } catch (e) {
        if (e.code === 'ENOENT') return false; // production builds emit no map
        throw e;
    }
    const map = JSON.parse(raw);
    map.mappings = ';'.repeat(lines) + map.mappings;
    await fs.writeFile(mapFile, JSON.stringify(map));
    return true;
}

/**
 * Rewrites the ESM outputs in place. Must be registered before the minification plugin: esbuild
 * runs onEnd callbacks in registration order, and the .min.mjs — the only ESM artefact we publish
 * a source map for — is generated from whatever is on disk by then.
 *
 * @type {import('esbuild').Plugin}
 */
const superclassAliasPlugin = {
    name: 'superclass-alias-plugin',
    setup(build) {
        build.initialOptions.metafile = true;

        build.onEnd(async (result) => {
            if (!result.metafile) {
                return; // esbuild has already reported its own failure; do not mask it
            }

            const esmOutputs = Object.keys(result.metafile.outputs).filter((f) => f.endsWith('.esm.mjs'));

            await Promise.all(
                esmOutputs.map(async (outputFile) => {
                    const resolved = path.resolve(outputFile);
                    const { code, sites, aliases, preambleLines, skipped } = aliasImportedSuperclasses(
                        await fs.readFile(resolved, 'utf-8')
                    );

                    if (sites > 0) {
                        await fs.writeFile(resolved, code);
                        await shiftSourceMapLines(`${resolved}.map`, preambleLines);
                    }
                    console.log(
                        `superclass-alias: ${path.basename(resolved)} aliased ${sites} superclass ` +
                            `reference(s) across ${aliases} import(s)` +
                            (skipped.length ? `; left alone: ${skipped.join(', ')}` : '')
                    );
                })
            );
        });
    },
};

module.exports = { superclassAliasPlugin, aliasImportedSuperclasses };
