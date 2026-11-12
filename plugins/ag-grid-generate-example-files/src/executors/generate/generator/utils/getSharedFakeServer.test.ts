import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { afterEach, describe, expect, test } from 'vitest';

import { resolveSharedFakeServer } from './getSharedFakeServer';

const tempDirs: string[] = [];

async function createExample() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'shared-fake-server-'));
    tempDirs.push(root);
    const serversDir = path.join(root, 'src', 'example-fake-servers');
    await fs.mkdir(serversDir, { recursive: true });
    await fs.writeFile(path.join(serversDir, 'standard.ts'), 'export function FakeServer() {}\n');
    await fs.writeFile(path.join(serversDir, 'pivot.ts'), 'export function FakeServer() {}\n');
    return path.join(root, 'src', 'content', 'docs', 'page', '_examples', 'example');
}

afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('resolveSharedFakeServer', () => {
    test('leaves an entry file without a shared server import untouched', async () => {
        const folderPath = await createExample();
        const entryFile = `import { FakeServer } from './fakeServer';\n`;

        expect(await resolveSharedFakeServer({ folderPath, entryFile, sourceFileList: ['main.ts'] })).toEqual({
            entryFile,
            sharedFiles: {},
        });
    });

    test('rewrites the import to ./fakeServer and supplies the shared server as fakeServer.ts', async () => {
        const folderPath = await createExample();
        const result = await resolveSharedFakeServer({
            folderPath,
            entryFile: `import { FakeServer } from '@example-fake-servers/standard';\n`,
            sourceFileList: ['main.ts'],
        });

        expect(result.entryFile).toBe(`import { FakeServer } from './fakeServer';\n`);
        expect(result.sharedFiles).toEqual({ 'fakeServer.ts': 'export function FakeServer() {}\n' });
    });

    test('rejects an example that imports two shared servers', async () => {
        const folderPath = await createExample();
        const entryFile = `import { A } from '@example-fake-servers/standard';\nimport { B } from '@example-fake-servers/pivot';\n`;

        await expect(resolveSharedFakeServer({ folderPath, entryFile, sourceFileList: ['main.ts'] })).rejects.toThrow(
            'more than one shared fake server'
        );
    });

    test('rejects an example that also has its own fakeServer.ts', async () => {
        const folderPath = await createExample();
        const entryFile = `import { FakeServer } from '@example-fake-servers/standard';\n`;

        await expect(
            resolveSharedFakeServer({ folderPath, entryFile, sourceFileList: ['main.ts', 'fakeServer.ts'] })
        ).rejects.toThrow('also has its own fakeServer.ts');
    });
});
