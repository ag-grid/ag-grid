import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, test } from 'vitest';

import { inlineSqlHelpers } from './inlineSqlHelpers';

const SQL_SOURCE = `// File header, not part of any helper.

// Quotes an identifier.
export function quote(name) {
    return '"' + name + '"';
}

export function orderBy(columns) {
    return ' ORDER BY ' + columns.map(quote).join(', ');
}

export function limit(n) {
    return ' LIMIT ' + n;
}
`;

const tempDirs: string[] = [];

async function createExample(sqlSource = SQL_SOURCE) {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'inline-sql-helpers-'));
    tempDirs.push(root);
    await fs.mkdir(path.join(root, 'src', 'example-fake-servers'), { recursive: true });
    await fs.writeFile(path.join(root, 'src', 'example-fake-servers', 'sql.ts'), sqlSource);
    return path.join(root, 'src', 'content', 'docs', 'page', '_examples', 'example');
}

const inline = (folderPath: string, contents: string) =>
    inlineSqlHelpers({ folderPath, fileName: 'fakeServer.ts', contents });

afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('inlineSqlHelpers', () => {
    test('leaves a file without a helpers import untouched', async () => {
        const folderPath = await createExample();
        const contents = 'export function FakeServer() {}\n';

        expect(await inline(folderPath, contents)).toBe(contents);
    });

    test('replaces the import with the helpers and the helpers they call, in sql.ts order', async () => {
        const folderPath = await createExample();
        const result = await inline(
            folderPath,
            `import { orderBy } from '@example-fake-servers/sql';\n\nexport function FakeServer() {\n    return orderBy(['a']);\n}\n`
        );

        expect(result).not.toContain('@example-fake-servers/sql');
        expect(result).not.toContain('export function orderBy');
        expect(result.indexOf('function quote')).toBeGreaterThan(result.indexOf('export function FakeServer'));
        expect(result.indexOf('function quote')).toBeLessThan(result.indexOf('function orderBy'));
        expect(result).not.toContain('function limit');
    });

    test('keeps the comment directly above a helper but not the file header', async () => {
        const folderPath = await createExample();
        const result = await inline(folderPath, `import { quote } from '@example-fake-servers/sql';\n`);

        expect(result).toContain('// Quotes an identifier.\nfunction quote(name)');
        expect(result).not.toContain('File header');
    });

    test('picks up an edit to sql.ts made after it was first read', async () => {
        const folderPath = await createExample();
        const sqlPath = path.join(folderPath, '..', '..', '..', '..', '..', 'example-fake-servers', 'sql.ts');
        const importQuote = `import { quote } from '@example-fake-servers/sql';\n`;

        expect(await inline(folderPath, importQuote)).toContain(`'"' + name + '"'`);

        await fs.writeFile(sqlPath, SQL_SOURCE.replace(`'"' + name + '"'`, `'[' + name + ']'`));
        const later = new Date(Date.now() + 5000);
        await fs.utimes(sqlPath, later, later);

        expect(await inline(folderPath, importQuote)).toContain(`'[' + name + ']'`);
    });

    test('rejects an import of a name sql.ts does not declare', async () => {
        const folderPath = await createExample();

        await expect(inline(folderPath, `import { missing } from '@example-fake-servers/sql';\n`)).rejects.toThrow(
            "imports 'missing'"
        );
    });

    test('rejects an aliased import', async () => {
        const folderPath = await createExample();

        await expect(inline(folderPath, `import { quote as q } from '@example-fake-servers/sql';\n`)).rejects.toThrow(
            'aliased imports'
        );
    });

    test('rejects a sql.ts statement that is not a function declaration', async () => {
        const folderPath = await createExample(`export const LIMIT = 10;\n`);

        await expect(inline(folderPath, `import { quote } from '@example-fake-servers/sql';\n`)).rejects.toThrow(
            'may only contain named top-level function declarations'
        );
    });
});
