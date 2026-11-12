import fs from 'fs/promises';
import path from 'path';
import ts from 'typescript';

import { getExampleFakeServersDir } from './getSharedFakeServer';

const SQL_HELPERS_IMPORT = /import\s*\{([^}]*)\}\s*from\s*['"]@example-fake-servers\/sql['"];?[ \t]*\r?\n?/g;

interface SqlHelper {
    /** The function declaration source, without `export` */
    text: string;
    /** Names of the other helpers this one calls */
    dependencies: string[];
}

const helpersByFile = new Map<string, Promise<Map<string, SqlHelper>>>();

function parseSqlHelpers(sqlFilePath: string, source: string): Map<string, SqlHelper> {
    const sourceFile = ts.createSourceFile(sqlFilePath, source, ts.ScriptTarget.Latest, true);
    const declarations = new Map<string, ts.FunctionDeclaration>();

    for (const statement of sourceFile.statements) {
        if (!ts.isFunctionDeclaration(statement) || !statement.name) {
            throw new Error(
                `${sqlFilePath} may only contain named top-level function declarations, found: ${statement.getText(sourceFile).slice(0, 60)}`
            );
        }
        declarations.set(statement.name.text, statement);
    }

    const helpers = new Map<string, SqlHelper>();
    for (const [name, declaration] of declarations) {
        const dependencies = new Set<string>();
        const visit = (node: ts.Node) => {
            if (ts.isIdentifier(node) && node.text !== name && declarations.has(node.text)) {
                dependencies.add(node.text);
            }
            ts.forEachChild(node, visit);
        };
        visit(declaration.body!);

        const declarationStart = declaration.getStart(sourceFile);
        helpers.set(name, {
            text:
                source.slice(getCommentsStart(source, declaration), declarationStart) +
                source.slice(declarationStart, declaration.end).replace(/^export\s+/, ''),
            dependencies: [...dependencies],
        });
    }
    return helpers;
}

/**
 * Where the comment lines directly above a declaration begin. Comments separated from it by a blank
 * line, such as the file header, are not included.
 */
function getCommentsStart(source: string, declaration: ts.Node): number {
    const declarationStart = declaration.getStart();
    const comments = ts.getLeadingCommentRanges(source, declaration.getFullStart()) ?? [];
    let start = declarationStart;
    for (let i = comments.length - 1; i >= 0; i--) {
        const gap = source.slice(comments[i].end, start);
        if (gap.trim() !== '' || (gap.match(/\n/g)?.length ?? 0) > 1) {
            break;
        }
        start = comments[i].pos;
    }
    return start;
}

function loadSqlHelpers(folderPath: string): Promise<Map<string, SqlHelper>> {
    const sqlFilePath = path.join(getExampleFakeServersDir(folderPath), 'sql.ts');
    let helpers = helpersByFile.get(sqlFilePath);
    if (!helpers) {
        helpers = fs.readFile(sqlFilePath, 'utf-8').then((source) => parseSqlHelpers(sqlFilePath, source));
        helpersByFile.set(sqlFilePath, helpers);
    }
    return helpers;
}

/**
 * Replaces `import { a, b } from '@example-fake-servers/sql'` with the source of `a` and `b`, and of
 * any helper they call, appended to the file. The generated example is then one self-contained file.
 */
export async function inlineSqlHelpers({
    folderPath,
    fileName,
    contents,
}: {
    folderPath: string;
    fileName: string;
    contents: string;
}): Promise<string> {
    const imports = [...contents.matchAll(SQL_HELPERS_IMPORT)];
    if (imports.length === 0) {
        return contents;
    }

    const helpers = await loadSqlHelpers(folderPath);
    const needed = new Set<string>();
    const add = (name: string) => {
        if (needed.has(name)) {
            return;
        }
        const helper = helpers.get(name);
        if (!helper) {
            throw new Error(`${fileName} imports '${name}', which is not a function in example-fake-servers/sql.ts`);
        }
        needed.add(name);
        helper.dependencies.forEach(add);
    };
    for (const [, importedNames] of imports) {
        for (const specifier of importedNames.split(',')) {
            const name = specifier.trim();
            if (name.includes(' ')) {
                throw new Error(
                    `${fileName} imports '${name}': aliased imports from example-fake-servers/sql are not supported`
                );
            }
            if (name) {
                add(name);
            }
        }
    }

    // Keep the helpers in the order they are declared in sql.ts
    const inlined = [...helpers].filter(([name]) => needed.has(name)).map(([, helper]) => helper.text);

    return contents.replace(SQL_HELPERS_IMPORT, '').trimEnd() + '\n\n' + inlined.join('\n\n') + '\n';
}
