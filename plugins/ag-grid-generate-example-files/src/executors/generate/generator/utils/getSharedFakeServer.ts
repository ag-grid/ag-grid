import fs from 'fs/promises';
import path from 'path';

import type { FileContents } from '../types';

export const SHARED_FAKE_SERVER_FILE_NAME = 'fakeServer.ts';

const SQL_HELPERS_NAME = 'sql';

const SHARED_FAKE_SERVER_IMPORT = /(from\s+)(['"])@example-fake-servers\/([\w-]+)\2/g;

const DOCS_CONTENT_SEGMENT = path.join('src', 'content', 'docs');

/**
 * The docs site's `src/example-fake-servers` folder, found from an example's folder path.
 */
export function getExampleFakeServersDir(folderPath: string): string {
    const docsContentIndex = folderPath.lastIndexOf(DOCS_CONTENT_SEGMENT);
    if (docsContentIndex === -1) {
        throw new Error(`Unable to locate the shared fake servers from example path: ${folderPath}`);
    }
    return path.join(folderPath.slice(0, docsContentIndex), 'src', 'example-fake-servers');
}

/**
 * Examples import a shared fake server through the `@example-fake-servers/<name>` alias so the
 * example source type-checks in place. The generated output gets a local `fakeServer.ts` instead,
 * imported as `./fakeServer`, so the code viewer and the exported Plunker/CodeSandbox projects
 * show and run the same file as an example with its own server.
 */
export async function resolveSharedFakeServer({
    folderPath,
    entryFile,
    sourceFileList,
}: {
    folderPath: string;
    entryFile: string;
    sourceFileList: string[];
}): Promise<{ entryFile: string; sharedFiles: FileContents }> {
    const serverNames = new Set([...entryFile.matchAll(SHARED_FAKE_SERVER_IMPORT)].map((match) => match[3]));
    if (serverNames.size === 0) {
        return { entryFile, sharedFiles: {} };
    }
    if (serverNames.has(SQL_HELPERS_NAME)) {
        throw new Error(
            `The entry file imports the shared SQL helpers, which are only inlined into other files. Import them from a ${SHARED_FAKE_SERVER_FILE_NAME} instead: ${folderPath}`
        );
    }
    if (serverNames.size > 1) {
        throw new Error(
            `Example imports more than one shared fake server (${[...serverNames].join(', ')}): ${folderPath}`
        );
    }
    if (sourceFileList.includes(SHARED_FAKE_SERVER_FILE_NAME)) {
        throw new Error(
            `Example imports a shared fake server but also has its own ${SHARED_FAKE_SERVER_FILE_NAME}: ${folderPath}`
        );
    }

    const [serverName] = serverNames;
    const sharedServerPath = path.join(getExampleFakeServersDir(folderPath), `${serverName}.ts`);

    return {
        entryFile: entryFile.replace(SHARED_FAKE_SERVER_IMPORT, "$1'./fakeServer'"),
        sharedFiles: { [SHARED_FAKE_SERVER_FILE_NAME]: await fs.readFile(sharedServerPath, 'utf-8') },
    };
}
