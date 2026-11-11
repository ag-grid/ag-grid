const fs = require('fs/promises');
const path = require('path');

const ts = require('typescript');

/**
 * Lets consumers drop module-level constants they never read from our bundled ESM.
 *
 * We ship one bundled ESM file per package, so a consumer's bundler drops a top-level statement
 * only if it can prove the statement free of side effects. Most bundlers cannot prove it for an
 * initialiser that calls a function, constructs an object or reads a property:
 *
 *     var COUNT_PROTO = Object.freeze({ ... });
 *     var OP_SYMBOLS_DESC = [...new Set(OP_DEFS.map((d) => d.symbol))].sort(...);
 *
 * Such a statement is kept along with everything it references, whether or not the application
 * registered the module that uses it. Annotating the initialiser as pure lets the bundler drop it
 * when the binding is unused:
 *
 *     var COUNT_PROTO = /* @__PURE__ *\/ Object.freeze({ ... });
 *     var OP_SYMBOLS_DESC = /* @__PURE__ *\/ (() => ([...new Set(...)].sort(...)))();
 *
 * Ported from the equivalent AG Charts pass (`esbuild.config.pure-toplevel.cjs` in ag-charts).
 *
 * The annotation asserts that dropping an initialiser is safe whenever nothing reads its binding.
 * That holds for our module-level constants: they build lookup tables, frozen prototypes, regexes
 * and theme parts, or register into state only their own binding's readers consult. An initialiser
 * that assigns, increments or deletes is left alone, as that is a side effect someone else may see.
 */

const ANNOTATION = '/* @__PURE__ */ ';
const PURE_COMMENT = /[@#]__PURE__/;

const isStatic = (node) => node.modifiers?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword) ?? false;

/**
 * The parts of `node` that run as the module loads. Function and method bodies run when called,
 * and instance field initialisers when constructed, but a computed member name (`[Symbol.iterator]`),
 * a static field initialiser and a static block all run when the class is defined.
 */
function eagerChildren(node) {
    if (ts.isClassStaticBlockDeclaration(node)) {
        return [node.body];
    }
    if (ts.isFunctionLike(node)) {
        return node.name && ts.isComputedPropertyName(node.name) ? [node.name] : [];
    }
    if (ts.isPropertyDeclaration(node) && !isStatic(node)) {
        return node.name && ts.isComputedPropertyName(node.name) ? [node.name] : [];
    }
    const children = [];
    ts.forEachChild(node, (child) => {
        children.push(child);
    });
    return children;
}

/** True if `match` holds for `node` or a descendant that runs as the module loads. */
function containsEager(node, match) {
    if (match(node)) {
        return true;
    }
    return eagerChildren(node).some((child) => containsEager(child, match));
}

const isCallLike = (node) =>
    ts.isCallExpression(node) || ts.isNewExpression(node) || ts.isTaggedTemplateExpression(node);

const isCallOrSpread = (node) => isCallLike(node) || ts.isSpreadElement(node) || ts.isSpreadAssignment(node);

/** What a bundler treats as a possible side effect: a call, a spread or a property read (any may run a getter). */
const mayHaveSideEffect = (node) =>
    containsEager(
        node,
        (n) => isCallOrSpread(n) || ts.isPropertyAccessExpression(n) || ts.isElementAccessExpression(n)
    );

/** `this.x` or `this[x]`. Eager code only reaches `this` in a static block or initialiser, where it is the class. */
const isOwnMember = (node) =>
    (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) &&
    node.expression.kind === ts.SyntaxKind.ThisKeyword;

/** A write someone else may observe: never annotated. A class setting its own statics is not one. */
function writesState(node) {
    return containsEager(node, (n) => {
        if (ts.isBinaryExpression(n)) {
            const op = n.operatorToken.kind;
            const isAssignment = op >= ts.SyntaxKind.FirstAssignment && op <= ts.SyntaxKind.LastAssignment;
            return isAssignment && !isOwnMember(n.left);
        }
        if (ts.isPrefixUnaryExpression(n) || ts.isPostfixUnaryExpression(n)) {
            const isUpdate = n.operator === ts.SyntaxKind.PlusPlusToken || n.operator === ts.SyntaxKind.MinusMinusToken;
            return isUpdate && !isOwnMember(n.operand);
        }
        return ts.isDeleteExpression(n);
    });
}

function hasPureAnnotation(code, init, sourceFile) {
    return PURE_COMMENT.test(code.slice(init.pos, init.getStart(sourceFile)));
}

function parseBundle(code, description) {
    const sourceFile = ts.createSourceFile('bundle.mjs', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
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
 * The edit that marks one top-level initialiser as droppable, or undefined if none is needed or
 * safe. A call is annotated in place when its callee and arguments are side-effect free, because a
 * bundler still evaluates the arguments of a pure call; anything else is wrapped in an annotated IIFE.
 */
function annotationFor(code, name, init, sourceFile) {
    if (!mayHaveSideEffect(init) || writesState(init)) {
        return undefined;
    }
    const alreadyPure = hasPureAnnotation(code, init, sourceFile);
    const start = alreadyPure ? init.pos : init.getStart(sourceFile);
    if (isCallLike(init)) {
        const callee = ts.isTaggedTemplateExpression(init) ? init.tag : init.expression;
        const args = ts.isTaggedTemplateExpression(init) ? [init.template] : (init.arguments ?? []);
        if (!containsEager(callee, isCallOrSpread) && !args.some(mayHaveSideEffect)) {
            return alreadyPure ? undefined : { start, end: start, text: ANNOTATION };
        }
    }
    // Replaces any existing annotation too: it covered only the call, not arguments such as a spread.
    const initCode = code.slice(init.getStart(sourceFile), init.end);
    // An anonymous class takes its `name` from the binding, so keep a binding of the same name.
    const wrapped =
        ts.isClassExpression(init) && !init.name
            ? `(() => { const ${name} = ${initCode}; return ${name}; })()`
            : `(() => (${initCode}))()`;
    return { start, end: init.end, text: `${alreadyPure ? ' ' : ''}${ANNOTATION}${wrapped}` };
}

/**
 * @param {string} code bundled ESM
 * @returns {{ code: string, annotated: number }}
 */
function annotatePureToplevel(code) {
    const sourceFile = parseBundle(code, 'bundle');

    const edits = [];
    for (const statement of sourceFile.statements) {
        if (!ts.isVariableStatement(statement)) {
            continue;
        }
        for (const declaration of statement.declarationList.declarations) {
            if (!declaration.initializer || !ts.isIdentifier(declaration.name)) {
                continue;
            }
            const edit = annotationFor(code, declaration.name.text, declaration.initializer, sourceFile);
            if (edit) {
                edits.push(edit);
            }
        }
    }
    if (edits.length === 0) {
        return { code, annotated: 0 };
    }

    // Right to left, so earlier offsets stay valid.
    edits.sort((a, b) => b.start - a.start);
    let out = code;
    for (const edit of edits) {
        out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    }

    // An edit at a wrong offset would ship a bundle that throws on load in a consumer's app.
    const rewritten = parseBundle(out, 'annotated bundle');
    if (rewritten.statements.length !== sourceFile.statements.length) {
        throw new Error(
            `expected ${sourceFile.statements.length} top-level statements, found ${rewritten.statements.length}`
        );
    }
    return { code: out, annotated: edits.length };
}

/**
 * Rewrites the ESM outputs in place. Edits stay on their original lines, so an emitted source map
 * stays line-accurate. Must be registered before the minification plugin, which minifies whatever
 * is on disk when its onEnd runs, and esbuild runs onEnd callbacks in registration order.
 *
 * @type {import('esbuild').Plugin}
 */
const pureToplevelPlugin = {
    name: 'pure-toplevel-plugin',
    setup(build) {
        build.initialOptions.metafile = true;

        build.onEnd(async (result) => {
            // On failure the outputs on disk are not the ones the metafile describes.
            if (result.errors?.length || !result.metafile) {
                return;
            }

            const esmOutputs = Object.keys(result.metafile.outputs).filter((f) => f.endsWith('.esm.mjs'));

            await Promise.all(
                esmOutputs.map(async (outputFile) => {
                    const resolved = path.resolve(outputFile);
                    let rewrite;
                    try {
                        rewrite = annotatePureToplevel(await fs.readFile(resolved, 'utf-8'));
                    } catch (e) {
                        throw new Error(`pure-toplevel failed for ${resolved}: ${e.message}`, { cause: e });
                    }
                    if (rewrite.annotated > 0) {
                        await fs.writeFile(resolved, rewrite.code);
                    }
                    console.log(
                        `pure-toplevel: ${path.basename(resolved)} annotated ${rewrite.annotated} top-level initialiser(s)`
                    );
                })
            );
        });
    },
};

module.exports = { pureToplevelPlugin, annotatePureToplevel };
