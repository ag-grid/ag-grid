import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { describe, expect, test } from 'vitest';

const COMMUNITY_SRC = path.resolve(__dirname, '../../ag-grid-community/src');
const MAIN_PATH = path.join(COMMUNITY_SRC, 'main.ts');
const GENERATED_PATH = path.resolve(__dirname, 'community-public.ts');

const sourceFileCache = new Map<string, ts.SourceFile>();

function getSourceFile(filePath: string): ts.SourceFile {
    if (!sourceFileCache.has(filePath)) {
        const text = fs.readFileSync(filePath, 'utf-8');
        sourceFileCache.set(filePath, ts.createSourceFile(path.basename(filePath), text, ts.ScriptTarget.Latest, true));
    }
    return sourceFileCache.get(filePath)!;
}

function getExportedDeclarationsFromFile(filePath: string): string[] {
    const sourceFile = getSourceFile(filePath);
    const names: string[] = [];
    for (const stmt of sourceFile.statements) {
        const mods = ts.canHaveModifiers(stmt) ? ts.getModifiers(stmt) : undefined;
        const isExported = mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (!isExported) {
            continue;
        }
        if (
            ts.isClassDeclaration(stmt) ||
            ts.isInterfaceDeclaration(stmt) ||
            ts.isTypeAliasDeclaration(stmt) ||
            ts.isEnumDeclaration(stmt) ||
            ts.isFunctionDeclaration(stmt)
        ) {
            if (stmt.name) {
                names.push(stmt.name.text);
            }
        } else if (ts.isVariableStatement(stmt)) {
            for (const decl of stmt.declarationList.declarations) {
                if (ts.isIdentifier(decl.name)) {
                    names.push(decl.name.text);
                }
            }
        }
    }
    return names;
}

function getExpectedPublicExportNames(): Set<string> {
    const sourceFile = getSourceFile(MAIN_PATH);
    const names = new Set<string>();

    for (const stmt of sourceFile.statements) {
        if (!ts.isExportDeclaration(stmt) || !stmt.moduleSpecifier) {
            continue;
        }
        if (!ts.isStringLiteral(stmt.moduleSpecifier)) {
            continue;
        }
        const modulePath = stmt.moduleSpecifier.text;
        if (modulePath === './main-internal') {
            continue;
        }
        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
            for (const element of stmt.exportClause.elements) {
                names.add(element.name.text);
            }
        } else if (!stmt.exportClause) {
            const resolvedPath = path.resolve(COMMUNITY_SRC, modulePath + '.ts');
            for (const name of getExportedDeclarationsFromFile(resolvedPath)) {
                names.add(name);
            }
        }
    }

    return names;
}

function getGeneratedExportNames(): Set<string> {
    const sourceFile = getSourceFile(GENERATED_PATH);
    const names = new Set<string>();

    for (const stmt of sourceFile.statements) {
        if (!ts.isExportDeclaration(stmt)) {
            continue;
        }
        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
            for (const element of stmt.exportClause.elements) {
                names.add(element.name.text);
            }
        }
    }

    return names;
}

describe('community-public.ts staleness check', () => {
    const expected = getExpectedPublicExportNames();
    const actual = getGeneratedExportNames();

    test('generated file should include all public exports from community main.ts', () => {
        const missing = [...expected].filter((name) => !actual.has(name)).sort();
        expect(missing).toEqual([]);
    });

    test('generated file should not include extra exports beyond community main.ts', () => {
        const extra = [...actual].filter((name) => !expected.has(name)).sort();
        expect(extra).toEqual([]);
    });

    test('generated file should not include any internal (_-prefixed) exports', () => {
        const internal = [...actual].filter((name) => name.startsWith('_')).sort();
        expect(internal).toEqual([]);
    });
});
