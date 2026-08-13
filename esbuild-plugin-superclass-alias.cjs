const fs = require('fs/promises');
const path = require('path');

const ts = require('typescript');

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

/** local binding name -> package it was imported from, for every top-level import. */
function importedBindings(sourceFile) {
    const importedFrom = new Map();
    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
        const source = statement.moduleSpecifier.text;
        const { name, namedBindings } = statement.importClause;
        if (name) importedFrom.set(name.text, source);
        if (namedBindings && ts.isNamedImports(namedBindings)) {
            for (const element of namedBindings.elements) importedFrom.set(element.name.text, source);
        } else if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            importedFrom.set(namedBindings.name.text, source);
        }
    }
    return importedFrom;
}

/**
 * @param {string} code bundled ESM
 * @returns {{ code: string, sites: number, aliases: number, preambleLines: number, skipped: string[] }}
 */
function aliasImportedSuperclasses(code) {
    if (code.includes(ALIAS_PREFIX)) {
        throw new Error(`bundle already contains the ${ALIAS_PREFIX} prefix; pick another to stay collision-free`);
    }

    const sourceFile = ts.createSourceFile('bundle.mjs', code, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);

    // TypeScript recovers from syntax errors rather than throwing, so a malformed bundle would
    // otherwise yield a partial tree and silently leave superclasses unaliased.
    if (sourceFile.parseDiagnostics?.length) {
        const [first] = sourceFile.parseDiagnostics;
        throw new Error(
            `bundle did not parse cleanly: ${sourceFile.parseDiagnostics.length} diagnostic(s), first at ` +
                `position ${first.start}: ${ts.flattenDiagnosticMessageText(first.messageText, ' ')}`
        );
    }

    const importedFrom = importedBindings(sourceFile);

    const edits = [];
    const aliases = new Map();
    const skipped = new Set();
    const visit = (node) => {
        if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
            for (const heritage of node.heritageClauses ?? []) {
                if (heritage.token !== ts.SyntaxKind.ExtendsKeyword) continue;
                const superClass = heritage.types[0]?.expression;
                // Anything but a bare identifier is already opaque to a minifier, so leave it alone.
                if (!superClass || !ts.isIdentifier(superClass)) continue;
                const source = importedFrom.get(superClass.text);
                if (source === undefined) continue; // declared in this bundle, so already a plain identifier
                if (!ALIASABLE_SOURCES.has(source)) {
                    skipped.add(source);
                    continue;
                }
                const alias = `${ALIAS_PREFIX}${superClass.text}`;
                aliases.set(superClass.text, alias);
                edits.push({ start: superClass.getStart(sourceFile), end: superClass.end, text: alias });
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);

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
