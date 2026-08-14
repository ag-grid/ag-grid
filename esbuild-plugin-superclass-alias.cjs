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
 * Most of ag-grid-enterprise's `extends` sites are cross-package, so this retains most of the
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
        if (!ts.isImportDeclaration(statement) || !statement.importClause) {
            continue;
        }
        const source = statement.moduleSpecifier.text;
        const { name, namedBindings } = statement.importClause;
        if (name) {
            importedFrom.set(name.text, source);
        }
        if (namedBindings && ts.isNamedImports(namedBindings)) {
            for (const element of namedBindings.elements) {
                importedFrom.set(element.name.text, source);
            }
        } else if (namedBindings && ts.isNamespaceImport(namedBindings)) {
            importedFrom.set(namedBindings.name.text, source);
        }
    }
    return importedFrom;
}

/**
 * Every name bound below the top level, so a superclass identifier matching one cannot be assumed
 * to be the import: `function make(BeanStub) { return class extends BeanStub {}; }` is legal, and
 * aliasing it would silently extend the wrong class.
 *
 * Deliberately coarse — one name shadowed anywhere disables aliasing for that name everywhere,
 * rather than tracking which scope each site sits in. esbuild renames nested bindings that would
 * shadow an import, so this is expected to match nothing; when it does match, we lose a little tree
 * shaking rather than emitting a class that extends the wrong base.
 */
function locallyBoundNames(sourceFile) {
    const names = new Set();

    const addBinding = (name) => {
        if (!name) {
            return;
        }
        if (ts.isIdentifier(name)) {
            names.add(name.text);
        } else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
            for (const element of name.elements) {
                if (ts.isBindingElement(element)) {
                    addBinding(element.name);
                }
            }
        }
    };

    const visit = (node, nested) => {
        if (ts.isFunctionLike(node)) {
            for (const parameter of node.parameters ?? []) {
                addBinding(parameter.name);
            }
        }
        // A named class or function expression binds its own name in a scope wrapping its body,
        // which is never the top-level scope — so unlike everything below, a top-level one still
        // shadows. In `var Foo = class BeanStub { m() { return class extends BeanStub {}; } }` the
        // inner clause extends Foo, not the import.
        if (node.name && ts.isIdentifier(node.name) && (ts.isClassExpression(node) || ts.isFunctionExpression(node))) {
            names.add(node.name.text);
        }
        if (nested) {
            if (ts.isVariableDeclaration(node)) {
                addBinding(node.name);
            } else if (ts.isCatchClause(node) && node.variableDeclaration) {
                addBinding(node.variableDeclaration.name);
            } else if (node.name && ts.isIdentifier(node.name) && (ts.isFunctionLike(node) || ts.isClassLike(node))) {
                names.add(node.name.text);
            }
        }
        const opensScope =
            nested ||
            ts.isFunctionLike(node) ||
            ts.isClassLike(node) ||
            ts.isBlock(node) ||
            ts.isCatchClause(node) ||
            ts.isForStatement(node) ||
            ts.isForInStatement(node) ||
            ts.isForOfStatement(node);
        ts.forEachChild(node, (child) => visit(child, opensScope));
    };
    visit(sourceFile, false);

    return names;
}

/**
 * TypeScript recovers from syntax errors rather than throwing, so a malformed bundle would
 * otherwise yield a partial tree and silently leave superclasses unaliased.
 */
function parseBundle(code, description) {
    const sourceFile = ts.createSourceFile('bundle.mjs', code, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);
    if (sourceFile.parseDiagnostics?.length) {
        const [first] = sourceFile.parseDiagnostics;
        throw new Error(
            `${description} did not parse cleanly: ${sourceFile.parseDiagnostics.length} diagnostic(s), first at ` +
                `position ${first.start}: ${ts.flattenDiagnosticMessageText(first.messageText, ' ')}`
        );
    }
    return sourceFile;
}

/**
 * Calls back with the superclass of every `class … extends <identifier>` in the tree. Anything but a
 * bare identifier is already opaque to a minifier, so it is not reported.
 */
function forEachExtendedIdentifier(sourceFile, callback) {
    const visit = (node) => {
        if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) {
            for (const heritage of node.heritageClauses ?? []) {
                if (heritage.token !== ts.SyntaxKind.ExtendsKeyword) {
                    continue;
                }
                const superClass = heritage.types[0]?.expression;
                if (superClass && ts.isIdentifier(superClass)) {
                    callback(superClass);
                }
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
}

/**
 * Re-parses a rewritten bundle and checks the invariants the rewrite is meant to hold: it still
 * parses, every alias is declared exactly once, and each declaration is reached by as many extends
 * sites as we edited. Returns the result it was given so it can gate every return path, rather than
 * sitting alongside one as a statement that is easy to omit.
 *
 * Without this, an edit landing at the wrong offset produces a bundle that throws on load in a
 * consumer's app off the back of a green build here.
 *
 * @param {{ code: string, sites: number, aliases: number }} result
 */
function verifyRewrite(result) {
    const { code, sites, aliases } = result;
    if (sites === 0) {
        return result; // nothing was edited, so the output is the input, already parsed above
    }

    const sourceFile = parseBundle(code, 'rewritten bundle');

    const declared = new Set();
    for (const statement of sourceFile.statements) {
        if (!ts.isVariableStatement(statement)) {
            continue;
        }
        for (const declaration of statement.declarationList.declarations) {
            if (!ts.isIdentifier(declaration.name) || !declaration.name.text.startsWith(ALIAS_PREFIX)) {
                continue;
            }
            if (declared.has(declaration.name.text)) {
                throw new Error(`alias ${declaration.name.text} is declared more than once`);
            }
            declared.add(declaration.name.text);
        }
    }

    let aliasedSites = 0;
    forEachExtendedIdentifier(sourceFile, (superClass) => {
        if (!superClass.text.startsWith(ALIAS_PREFIX)) {
            return;
        }
        if (!declared.has(superClass.text)) {
            throw new Error(`a class extends ${superClass.text}, which is never declared`);
        }
        aliasedSites++;
    });

    if (declared.size !== aliases) {
        throw new Error(`expected ${aliases} alias declaration(s), found ${declared.size}`);
    }
    if (aliasedSites !== sites) {
        throw new Error(`expected ${sites} aliased extends site(s), found ${aliasedSites}`);
    }

    return result;
}

/**
 * @param {string} code bundled ESM
 * @returns {{ code: string, sites: number, aliases: number, preambleLines: number, skipped: string[],
 *            shadowed: string[] }}
 */
function aliasImportedSuperclasses(code) {
    if (code.includes(ALIAS_PREFIX)) {
        throw new Error(`bundle already contains the ${ALIAS_PREFIX} prefix; pick another to stay collision-free`);
    }

    const sourceFile = parseBundle(code, 'bundle');

    const importedFrom = importedBindings(sourceFile);
    const locallyBound = locallyBoundNames(sourceFile);

    const edits = [];
    const aliases = new Map();
    const skipped = new Set();
    const shadowed = new Set();
    forEachExtendedIdentifier(sourceFile, (superClass) => {
        const source = importedFrom.get(superClass.text);
        // Declared in this bundle, so already a plain identifier.
        if (source === undefined) {
            return;
        }
        if (!ALIASABLE_SOURCES.has(source)) {
            skipped.add(source);
            return;
        }
        if (locallyBound.has(superClass.text)) {
            shadowed.add(superClass.text); // may not be the import; see locallyBoundNames
            return;
        }
        const alias = `${ALIAS_PREFIX}${superClass.text}`;
        aliases.set(superClass.text, alias);
        edits.push({ start: superClass.getStart(sourceFile), end: superClass.end, text: alias });
    });

    if (edits.length === 0) {
        return verifyRewrite({
            code,
            sites: 0,
            aliases: 0,
            preambleLines: 0,
            skipped: [...skipped],
            shadowed: [...shadowed],
        });
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

    return verifyRewrite({
        code: `${preamble}\n${out}`,
        sites: edits.length,
        aliases: aliases.size,
        preambleLines: aliases.size,
        skipped: [...skipped],
        shadowed: [...shadowed],
    });
}

/**
 * Keeps an emitted source map pointing at the right lines.
 *
 * Only the default (non-production) build emits a map for the unminified ESM — production and
 * staging turn source maps off, so nothing we publish has one — but the docs site serves those
 * files locally and a map off by the length of the preamble is worse than no map at all.
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
        // Production builds emit no map.
        if (e.code === 'ENOENT') {
            return false;
        }
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
                    const { code, sites, aliases, preambleLines, skipped, shadowed } = aliasImportedSuperclasses(
                        await fs.readFile(resolved, 'utf-8')
                    );

                    if (sites > 0) {
                        await fs.writeFile(resolved, code);
                        await shiftSourceMapLines(`${resolved}.map`, preambleLines);
                    }
                    console.log(
                        `superclass-alias: ${path.basename(resolved)} aliased ${sites} superclass ` +
                            `reference(s) across ${aliases} import(s)` +
                            (skipped.length ? `; left alone: ${skipped.join(', ')}` : '') +
                            (shadowed.length ? `; shadowed, so left alone: ${shadowed.join(', ')}` : '')
                    );
                })
            );
        });
    },
};

module.exports = { superclassAliasPlugin, aliasImportedSuperclasses };
