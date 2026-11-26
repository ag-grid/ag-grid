import ts from 'typescript';

import type { FileContents } from '../types';

const INTERFACES_FILE_NAME = 'interfaces.ts';
const INTERFACES_MODULE = './interfaces';

interface SharedInterface {
    declaration: string;
    /** Shared interfaces the declaration refers to. */
    requires: string[];
}

/**
 * Row types example sources use without declaring them, as they are global to the examples
 * (`documentation/ag-grid-docs/src/types/index.d.ts`). Generated examples are standalone projects,
 * so they get these from a generated `interfaces.ts` instead. Keep the two in sync.
 */
const SHARED_INTERFACES: Record<string, SharedInterface> = {
    IOlympicData: {
        declaration: `export interface IOlympicData {
    athlete: string;
    age: number;
    country: string;
    year: number;
    date: string;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}`,
        requires: [],
    },
    IOlympicDataWithId: {
        declaration: `export interface IOlympicDataWithId extends IOlympicData {
    id: number;
}`,
        requires: ['IOlympicData'],
    },
    ICallRecord: {
        declaration: `export interface ICallRecord {
    name: string;
    callId: number;
    duration: number;
    switchCode: string;
    direction: string;
    number: string;
}`,
        requires: [],
    },
    IAccount: {
        declaration: `export interface IAccount {
    name: string;
    account: number;
    calls: number;
    minutes: number;
    callRecords: ICallRecord[];
}`,
        requires: ['ICallRecord'],
    },
};

const isSharedInterface = (name: string) => Object.hasOwn(SHARED_INTERFACES, name);

// Code the example runner strips from what users see, e.g. `/** ENABLE AG-TEST-ID START **/ … END **/`
const HARNESS_BLOCK = /\/\*\* ([A-Z0-9 -]+) START \*\*\/[\s\S]*?\/\*\* \1 END \*\*\//g;

const isTypeScriptFile = (fileName: string) => /\.tsx?$/.test(fileName) && !/\.(spec|d)\.tsx?$/.test(fileName);

function parse(fileName: string, code: string): ts.SourceFile {
    const scriptKind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, scriptKind);
}

interface SharedInterfaceUsage {
    /** Shared interfaces the file refers to without declaring or importing them. */
    undeclared: string[];
    /** Names the file imports from `./interfaces`. */
    importedFromInterfaces: string[];
    /** Type names the file declares. */
    declared: Set<string>;
}

export function getSharedInterfaceUsage(fileName: string, code: string): SharedInterfaceUsage {
    const declared = new Set<string>();
    const imported = new Set<string>();
    const importedFromInterfaces: string[] = [];
    const referenced = new Set<string>();

    const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node)) {
            const names = getImportedNames(node);
            names.forEach((name) => imported.add(name));
            if (ts.isStringLiteral(node.moduleSpecifier) && node.moduleSpecifier.text === INTERFACES_MODULE) {
                importedFromInterfaces.push(...names);
            }
            return;
        }
        if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isClassDeclaration(node)) {
            if (node.name) {
                declared.add(node.name.text);
            }
        } else if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
            referenced.add(node.typeName.text);
        } else if (ts.isExpressionWithTypeArguments(node) && ts.isIdentifier(node.expression)) {
            referenced.add(node.expression.text);
        }
        ts.forEachChild(node, visit);
    };
    visit(parse(fileName, code));

    const undeclared = [...referenced].filter(
        (name) => isSharedInterface(name) && !declared.has(name) && !imported.has(name)
    );
    return { undeclared, importedFromInterfaces, declared };
}

function getImportedNames(node: ts.ImportDeclaration): string[] {
    const clause = node.importClause;
    if (!clause) {
        return [];
    }
    const names = clause.name ? [clause.name.text] : [];
    const bindings = clause.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
        names.push(...bindings.elements.map((element) => element.name.text));
    } else if (bindings && ts.isNamespaceImport(bindings)) {
        names.push(bindings.name.text);
    }
    return names;
}

/**
 * Adds an import statement after the file's last import outside the example runner harness code,
 * or after its directives (e.g. `'use client'`) when it has no imports.
 */
export function addImportStatement(fileName: string, code: string, importStatement: string): string {
    const harnessBlocks = [...code.matchAll(HARNESS_BLOCK)].map((match) => [
        match.index,
        match.index + match[0].length,
    ]);
    const isInHarness = (node: ts.Node) =>
        harnessBlocks.some(([start, end]) => node.getStart() >= start && node.getStart() < end);

    const statements = parse(fileName, code).statements;
    const imports = statements.filter((node) => ts.isImportDeclaration(node) && !isInHarness(node));
    const directives = statements.filter(
        (node, index) =>
            ts.isExpressionStatement(node) &&
            ts.isStringLiteral(node.expression) &&
            statements.slice(0, index).every((previous) => ts.isExpressionStatement(previous))
    );
    const anchor = imports.at(-1) ?? directives.at(-1);
    if (!anchor) {
        return `${importStatement}\n${code}`;
    }
    return `${code.slice(0, anchor.end)}\n${importStatement}${code.slice(anchor.end)}`;
}

function withRequiredInterfaces(names: Iterable<string>): string[] {
    const required = new Set<string>();
    const add = (name: string) => {
        if (!required.has(name)) {
            required.add(name);
            SHARED_INTERFACES[name].requires.forEach(add);
        }
    };
    [...names].filter(isSharedInterface).forEach(add);
    // Declaration order follows the table, so the output is stable
    return Object.keys(SHARED_INTERFACES).filter((name) => required.has(name));
}

/**
 * Generated TypeScript examples refer to the shared row interfaces as if they were global. Imports
 * them from `interfaces.ts` where they are used, and adds the declarations that file is missing.
 */
export function addSharedInterfaces(files: FileContents): void {
    const needed = new Set<string>();

    for (const fileName of Object.keys(files)) {
        if (!isTypeScriptFile(fileName) || fileName === INTERFACES_FILE_NAME) {
            continue;
        }
        const { undeclared, importedFromInterfaces } = getSharedInterfaceUsage(fileName, files[fileName]);
        importedFromInterfaces.forEach((name) => needed.add(name));
        if (undeclared.length > 0) {
            const importStatement = `import type { ${undeclared.sort().join(', ')} } from '${INTERFACES_MODULE}';`;
            files[fileName] = addImportStatement(fileName, files[fileName], importStatement);
            undeclared.forEach((name) => needed.add(name));
        }
    }

    const interfacesFile = files[INTERFACES_FILE_NAME];
    let declaredInInterfacesFile = new Set<string>();
    if (interfacesFile) {
        const usage = getSharedInterfaceUsage(INTERFACES_FILE_NAME, interfacesFile);
        usage.undeclared.forEach((name) => needed.add(name));
        declaredInInterfacesFile = usage.declared;
    }

    const declarations = withRequiredInterfaces(needed)
        .filter((name) => !declaredInInterfacesFile.has(name))
        .map((name) => SHARED_INTERFACES[name].declaration);
    if (declarations.length > 0) {
        files[INTERFACES_FILE_NAME] = [interfacesFile?.trimEnd(), ...declarations]
            .filter(Boolean)
            .join('\n\n')
            .concat('\n');
    }
}
