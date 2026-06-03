import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const STACK_SRC = path.resolve(__dirname);
const MAIN_INTERNAL_PATH = path.join(STACK_SRC, 'main-internal.ts');

interface SymbolInfo {
    originalName: string;
    sourceFilePath: string;
    relativeSourcePath: string;
}

// Cache parsed source files for performance
const sourceFileCache = new Map<string, { text: string; sourceFile: ts.SourceFile }>();

function getSourceFile(filePath: string) {
    if (!sourceFileCache.has(filePath)) {
        const text = fs.readFileSync(filePath, 'utf-8');
        const sourceFile = ts.createSourceFile(path.basename(filePath), text, ts.ScriptTarget.Latest, true);
        sourceFileCache.set(filePath, { text, sourceFile });
    }
    return sourceFileCache.get(filePath)!;
}

function getExportedNamesFromFile(filePath: string): string[] {
    const { sourceFile } = getSourceFile(filePath);
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

function parseMainInternalExports(): SymbolInfo[] {
    const { sourceFile } = getSourceFile(MAIN_INTERNAL_PATH);
    const symbols: SymbolInfo[] = [];

    for (const stmt of sourceFile.statements) {
        if (!ts.isExportDeclaration(stmt) || !stmt.moduleSpecifier) {
            continue;
        }
        if (!ts.isStringLiteral(stmt.moduleSpecifier)) {
            continue;
        }

        const modulePath = stmt.moduleSpecifier.text;
        const resolvedPath = path.resolve(STACK_SRC, modulePath + '.ts');
        const relativePath = path.relative(STACK_SRC, resolvedPath);

        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
            for (const element of stmt.exportClause.elements) {
                const originalName = (element.propertyName || element.name).text;
                symbols.push({ originalName, sourceFilePath: resolvedPath, relativeSourcePath: relativePath });
            }
        } else if (!stmt.exportClause) {
            // Wildcard: export * from '...'
            const wildcardNames = getExportedNamesFromFile(resolvedPath);
            for (const name of wildcardNames) {
                symbols.push({ originalName: name, sourceFilePath: resolvedPath, relativeSourcePath: relativePath });
            }
        }
    }

    return symbols;
}

function findDeclarationNode(sourceFile: ts.SourceFile, symbolName: string): ts.Node | null {
    for (const stmt of sourceFile.statements) {
        if (
            ts.isClassDeclaration(stmt) ||
            ts.isInterfaceDeclaration(stmt) ||
            ts.isTypeAliasDeclaration(stmt) ||
            ts.isEnumDeclaration(stmt) ||
            ts.isFunctionDeclaration(stmt)
        ) {
            if (stmt.name?.text === symbolName) {
                return stmt;
            }
        }

        if (ts.isVariableStatement(stmt)) {
            for (const decl of stmt.declarationList.declarations) {
                if (ts.isIdentifier(decl.name) && decl.name.text === symbolName) {
                    return stmt; // VariableStatement, not the individual declarator
                }
            }
        }

        // Named re-exports: export { Foo } from '...' or export { Bar as Foo } from '...'
        if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
            for (const element of stmt.exportClause.elements) {
                if (element.name.text === symbolName) {
                    return stmt;
                }
            }
        }
    }

    return null;
}

function getJSDocForSymbol(filePath: string, symbolName: string): string | null {
    const { text, sourceFile } = getSourceFile(filePath);
    const node = findDeclarationNode(sourceFile, symbolName);
    if (!node) {
        return null;
    }

    const fullStart = node.getFullStart();
    const comments = ts.getLeadingCommentRanges(text, fullStart);
    if (!comments) {
        return null;
    }

    // Find the last JSDoc comment (/** ... */) before the declaration
    for (let i = comments.length - 1; i >= 0; i--) {
        const comment = comments[i];
        if (comment.kind === ts.SyntaxKind.MultiLineCommentTrivia) {
            const commentText = text.substring(comment.pos, comment.end);
            if (commentText.startsWith('/**')) {
                return commentText;
            }
        }
    }

    return null;
}

const symbols = parseMainInternalExports();

describe('main-internal.ts JSDoc validation', () => {
    test('should have at least 250 symbols to validate', () => {
        expect(symbols.length).toBeGreaterThan(250);
    });

    test.each(symbols)(
        '$originalName ($relativeSourcePath) should have AG_GRID_INTERNAL or @internal JSDoc',
        ({ originalName, sourceFilePath }) => {
            const jsDoc = getJSDocForSymbol(sourceFilePath, originalName);
            expect(jsDoc).toBeTruthy();
            expect(jsDoc!.includes('AG_GRID_INTERNAL') && jsDoc!.includes('@internal')).toBe(true);
        }
    );
});
