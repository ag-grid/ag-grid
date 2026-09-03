import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

const COMMUNITY_SRC = path.resolve(__dirname);
const MAIN_INTERNAL_PATH = path.join(COMMUNITY_SRC, 'main-internal.ts');

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
        const resolvedPath = path.resolve(COMMUNITY_SRC, modulePath + '.ts');
        const relativePath = path.relative(COMMUNITY_SRC, resolvedPath);

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

const MAIN_PATH = path.join(COMMUNITY_SRC, 'main.ts');

/**
 * Collects all exported names from a module entry-point file by examining
 * its export declarations.
 *
 * - Named re-exports (`export { Foo as Bar } from '...'`): adds the exported alias `Bar`.
 * - Wildcard re-exports (`export * from '...'`): expands the target file's direct declarations.
 * - Modules listed in `excludeModules` are skipped.
 */
function getExportedNamesFromModule(filePath: string, excludeModules: string[] = []): string[] {
    const { sourceFile } = getSourceFile(filePath);
    const names: string[] = [];
    const dir = path.dirname(filePath);

    for (const stmt of sourceFile.statements) {
        if (!ts.isExportDeclaration(stmt) || !stmt.moduleSpecifier) {
            continue;
        }
        if (!ts.isStringLiteral(stmt.moduleSpecifier)) {
            continue;
        }

        const modulePath = stmt.moduleSpecifier.text;
        if (excludeModules.includes(modulePath)) {
            continue;
        }

        if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
            for (const element of stmt.exportClause.elements) {
                names.push(element.name.text);
            }
        } else if (!stmt.exportClause) {
            // Wildcard re-export: expand the target file's direct declarations
            const resolvedPath = path.resolve(dir, modulePath + '.ts');
            names.push(...getExportedNamesFromFile(resolvedPath));
        }
    }

    return names;
}

const symbols = parseMainInternalExports();

describe('main-internal.ts JSDoc validation', () => {
    test('should have at least 450 symbols to validate', () => {
        expect(symbols.length).toBeGreaterThan(450);
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

describe('main.ts and main-internal.ts exports do not overlap', () => {
    // main.ts re-exports everything from main-internal.ts at the bottom, so we exclude
    // that re-export when collecting main.ts names to avoid false positives.
    const mainExportNames = getExportedNamesFromModule(MAIN_PATH, ['./main-internal']);
    const internalExportNames = getExportedNamesFromModule(MAIN_INTERNAL_PATH);

    const internalNamesSet = new Set(internalExportNames);
    const overlapping = mainExportNames.filter((name) => internalNamesSet.has(name));

    test('should have no overlapping exports between main.ts and main-internal.ts', () => {
        expect(overlapping).toEqual([]);
    });
});

const AG_GRID_INTERNAL = 'AG_GRID_INTERNAL';

function collectSourceFiles(dir: string, out: string[] = []): string[] {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            collectSourceFiles(fullPath, out);
        } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
            out.push(fullPath);
        }
    }
    return out;
}

function getDeclarationName(node: ts.Node): string | null {
    if (ts.isVariableStatement(node)) {
        const [declaration] = node.declarationList.declarations;
        return declaration && ts.isIdentifier(declaration.name) ? declaration.name.text : null;
    }
    const name = (node as ts.NamedDeclaration).name;
    return name && ts.isIdentifier(name) ? name.text : null;
}

function isExported(node: ts.Node): boolean {
    const mods = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
    return mods?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

/**
 * Finds every `AG_GRID_INTERNAL` annotation under `srcDir` that does not sit on a declaration
 * re-exported from `main-internal.ts`. This is the reverse of the forward check above: together
 * they make the annotation mean exactly "member of the published internal entry point".
 */
function findSurplusAnnotations(srcDir: string, internalSymbols: SymbolInfo[]): string[] {
    const exportedKeys = new Set(internalSymbols.map(({ sourceFilePath, originalName }) => `${sourceFilePath}::${originalName}`));
    const exportedNames = new Set(internalSymbols.map(({ originalName }) => originalName));
    const violations: string[] = [];

    for (const filePath of collectSourceFiles(srcDir)) {
        const text = fs.readFileSync(filePath, 'utf-8');
        // Cheap pre-filter: only parse files that actually carry the annotation.
        if (!text.includes(AG_GRID_INTERNAL)) {
            continue;
        }

        const { sourceFile } = getSourceFile(filePath);
        const relativePath = path.relative(srcDir, filePath);
        // A declaration and its `export` modifier share a full-start, so the same JSDoc is
        // reported twice. `forEachChild` visits parents first, so the first visit wins.
        const seenComments = new Set<number>();

        const report = (node: ts.Node, name: string, reason: string) => {
            const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
            violations.push(`${relativePath}:${line} ${name} (${reason})`);
        };

        const classify = (node: ts.Node) => {
            // `export { Foo } from './x'` has no name of its own; the forward check accepts an
            // annotation here, so the reverse check must too when a re-exported name is internal.
            if (ts.isExportDeclaration(node)) {
                const elements = node.exportClause && ts.isNamedExports(node.exportClause) ? node.exportClause.elements : [];
                if (elements.some((element) => exportedNames.has((element.propertyName ?? element.name).text))) {
                    return;
                }
                report(node, elements.map((element) => element.name.text).join(', ') || 'export', 'not re-exported from main-internal.ts');
                return;
            }

            const name = getDeclarationName(node);
            if (name == null) {
                report(node, ts.SyntaxKind[node.kind], 'annotated node is not a named declaration');
                return;
            }
            if (node.parent !== sourceFile) {
                report(node, name, 'not a top-level declaration');
                return;
            }
            if (!isExported(node)) {
                report(node, name, 'not exported');
                return;
            }
            if (!exportedKeys.has(`${filePath}::${name}`)) {
                report(node, name, 'not exported from main-internal.ts');
            }
        };

        const visit = (node: ts.Node) => {
            const annotated = ts
                .getLeadingCommentRanges(text, node.getFullStart())
                ?.find(
                    (comment) =>
                        comment.kind === ts.SyntaxKind.MultiLineCommentTrivia &&
                        text.startsWith('/**', comment.pos) &&
                        text.slice(comment.pos, comment.end).includes(AG_GRID_INTERNAL)
                );
            if (annotated && !seenComments.has(annotated.pos)) {
                seenComments.add(annotated.pos);
                classify(node);
            }
            ts.forEachChild(node, visit);
        };

        // Start from the statements: a SourceFile's full-start is 0, so it would claim the file's
        // first leading comment and the dedupe would then discard the real declaration's visit.
        sourceFile.statements.forEach(visit);
    }

    return violations;
}

// Run at module scope so the scan cost is load time rather than test time.
const surplusAnnotations = findSurplusAnnotations(COMMUNITY_SRC, symbols);

describe('AG_GRID_INTERNAL annotations are limited to main-internal.ts exports', () => {
    test('should have no AG_GRID_INTERNAL annotation outside the internal entry point', () => {
        expect(surplusAnnotations).toEqual([]);
    });
});
