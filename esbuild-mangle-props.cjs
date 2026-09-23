const fs = require('fs');
const path = require('path');

const ts = require('typescript');

/**
 * Shortens `private` class member names in the published bundles.
 *
 * A minifier renames locals but never properties, so every member name ships in full in every
 * package. esbuild's `mangleProps` renames properties, but only by name, across the whole bundle: it
 * cannot tell `this.rowCtrl` on our class from `params.rowCtrl` on an object someone handed us. So a
 * name is only renamed when nothing outside our own private members can ever refer to it:
 *
 * - it is declared `private` on a class somewhere in ag-stack, community or enterprise;
 * - it is never declared any other way in that source: not as a public or protected member, an
 *   interface or type member, an enum member, an object literal key, or a destructured key (other
 *   than one destructured from `this`);
 * - it is not a `data-ref` element field (initialised with `RefPlaceholder`), since those are
 *   assigned by name and the name may be built at runtime;
 * - it never appears inside a string or template literal there (covers `this['foo']`), nor anywhere
 *   in the framework wrappers, behavioural tests or AG Charts types;
 * - it is not a name from TypeScript's DOM/ECMAScript libs.
 *
 * The packages are built separately but share class hierarchies, so all three must rename
 * identically: the list and the names it maps to are computed from all three sources together
 * (see the `manglePropsSources` Nx input) and assigned deterministically.
 */

const ROOT = __dirname;

/** Packages whose `private` members are renamed; each is built with the same shared mapping. */
const MANGLED_PROJECTS = ['ag-stack', 'ag-grid-community', 'ag-grid-enterprise'];

/**
 * Code that consumes our packages; any identifier it mentions is left alone. The behavioural tests
 * are included because some reach into private members, and they can also run against the built
 * packages (`TESTS_USE_ORIGINAL_SOURCE_CODE=false`).
 */
const CONSUMER_DIRS = [
    'packages/ag-grid-react/src',
    'packages/ag-grid-angular/projects',
    'packages/ag-grid-vue3/src',
    'testing/behavioural/src',
    'testing/ag-test-utils/src',
];

/** Type definitions of the libraries enterprise hands objects to. */
const CHARTS_TYPE_DIRS = [
    'node_modules/ag-charts-community/dist/types',
    'node_modules/ag-charts-enterprise/dist/types',
    'node_modules/ag-charts-types',
];

/** Renamed members get this prefix, which no other property uses, so they cannot collide. */
const MANGLED_PREFIX = '$';

const FIRST_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NEXT_CHARS = FIRST_CHARS + '0123456789_';

const IDENTIFIER = /[A-Za-z_$][\w$]*/g;

function listFiles(dir, include) {
    const absDir = path.join(ROOT, dir);
    if (!fs.existsSync(absDir)) {
        return [];
    }
    return fs
        .readdirSync(absDir, { recursive: true })
        .filter((file) => include(file) && !file.split(path.sep).includes('node_modules'))
        .map((file) => path.join(absDir, file));
}

const isLibSource = (file) => /\.tsx?$/.test(file) && !/\.(test|spec)\.tsx?$/.test(file) && !/\.d\.ts$/.test(file);

function addIdentifiers(text, into) {
    for (const [identifier] of text.matchAll(IDENTIFIER)) {
        into.add(identifier);
    }
}

function hasPrivateModifier(node) {
    return !!ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword);
}

/** Name of a member or key, when it is written as a plain identifier. */
function identifierName(name) {
    return name && ts.isIdentifier(name) ? name.text : undefined;
}

function isClassMember(node) {
    return (
        ts.isPropertyDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isGetAccessorDeclaration(node) ||
        ts.isSetAccessorDeclaration(node)
    );
}

/**
 * Components assign `data-ref` elements to the property of the same name (`this[ref] = element`),
 * and ref names are sometimes built at runtime, so a ref field is never renamed however its ref is
 * written. Ref fields are the ones initialised with `RefPlaceholder`.
 */
function isElementRef(node) {
    return ts.isPropertyDeclaration(node) && identifierName(node.initializer) === 'RefPlaceholder';
}

/** Walks one source file, recording its private member names and every other kind of name in it. */
function scanSourceFile(file, privateNames, excludedNames, frequency) {
    const text = fs.readFileSync(file, 'utf8');
    const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

    const visit = (node) => {
        if (isClassMember(node) && ts.isClassLike(node.parent)) {
            const name = identifierName(node.name);
            if (name) {
                const renameable = hasPrivateModifier(node) && !isElementRef(node);
                (renameable ? privateNames : excludedNames).add(name);
            }
        } else if (ts.isParameter(node) && ts.isConstructorDeclaration(node.parent)) {
            // Parameter properties (`constructor(private foo)`) are members too.
            const name = identifierName(node.name);
            if (name && ts.getModifiers(node)?.length) {
                (hasPrivateModifier(node) ? privateNames : excludedNames).add(name);
            }
        } else if (
            ts.isPropertySignature(node) ||
            ts.isMethodSignature(node) ||
            ts.isEnumMember(node) ||
            ts.isPropertyAssignment(node) ||
            ts.isShorthandPropertyAssignment(node) ||
            ((ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node)) &&
                ts.isObjectLiteralExpression(node.parent))
        ) {
            const name = identifierName(node.name);
            if (name) {
                excludedNames.add(name);
            }
        } else if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
            // `const { foo } = this` reads our own member; any other source may be someone else's object.
            const declaration = node.parent.parent;
            const fromThis =
                ts.isVariableDeclaration(declaration) && declaration.initializer?.kind === ts.SyntaxKind.ThisKeyword;
            const name = identifierName(node.propertyName) ?? identifierName(node.name);
            if (name && !fromThis) {
                excludedNames.add(name);
            }
        } else if (
            ts.isStringLiteral(node) ||
            ts.isNoSubstitutionTemplateLiteral(node) ||
            ts.isTemplateHead(node) ||
            ts.isTemplateMiddle(node) ||
            ts.isTemplateTail(node)
        ) {
            addIdentifiers(node.text, excludedNames);
        } else if (ts.isIdentifier(node)) {
            frequency.set(node.text, (frequency.get(node.text) ?? 0) + 1);
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
}

function typeScriptLibNames() {
    const libDir = path.dirname(require.resolve('typescript/lib/lib.d.ts'));
    const names = new Set();
    for (const file of fs.readdirSync(libDir)) {
        if (/^lib\..*\.d\.ts$/.test(file)) {
            addIdentifiers(fs.readFileSync(path.join(libDir, file), 'utf8'), names);
        }
    }
    return names;
}

/** `$a`, `$b`, … `$Z`, `$aa`, … skipping any name already in use. */
function* shortNames(inUse) {
    for (let length = 1; ; length++) {
        const indices = new Array(length).fill(0);
        while (true) {
            const name =
                MANGLED_PREFIX +
                indices.map((index, position) => (position ? NEXT_CHARS : FIRST_CHARS)[index]).join('');
            if (!inUse.has(name)) {
                yield name;
            }
            let position = length - 1;
            while (position >= 0) {
                const alphabet = position ? NEXT_CHARS : FIRST_CHARS;
                if (++indices[position] < alphabet.length) {
                    break;
                }
                indices[position--] = 0;
            }
            if (position < 0) {
                break;
            }
        }
    }
}

let cached;

/**
 * The shared `mangleProps` / `mangleCache` esbuild options. The most frequently used names get the
 * shortest replacements; ties are broken by name so every build derives the same mapping.
 */
function getManglePropsOptions() {
    if (cached) {
        return cached;
    }

    const privateNames = new Set();
    const excludedNames = typeScriptLibNames();
    const frequency = new Map();

    for (const project of MANGLED_PROJECTS) {
        for (const file of listFiles(`packages/${project}/src`, isLibSource)) {
            scanSourceFile(file, privateNames, excludedNames, frequency);
        }
    }
    const inUse = new Set(frequency.keys());
    for (const file of [
        ...CONSUMER_DIRS.flatMap((dir) => listFiles(dir, (f) => /\.(tsx?|vue)$/.test(f))),
        ...CHARTS_TYPE_DIRS.flatMap((dir) => listFiles(dir, (f) => f.endsWith('.d.ts'))),
    ]) {
        addIdentifiers(fs.readFileSync(file, 'utf8'), excludedNames);
    }
    for (const name of excludedNames) {
        inUse.add(name);
    }

    const names = [...privateNames]
        .filter((name) => !excludedNames.has(name))
        .sort((a, b) => (frequency.get(b) ?? 0) - (frequency.get(a) ?? 0) || (a < b ? -1 : 1));

    const replacements = shortNames(inUse);
    const mangleCache = {};
    for (const name of names) {
        mangleCache[name] = replacements.next().value;
    }

    cached = {
        mangleProps: new RegExp(`^(?:${names.map((name) => name.replace(/\$/g, '\\$')).join('|')})$`),
        mangleCache,
    };
    return cached;
}

module.exports = { MANGLED_PROJECTS, getManglePropsOptions };
