import { beforeEach, describe, expect, it } from '@jest/globals';

import type { ZipFile } from './zipContainer';
import { getHeaderAndContent } from './zipContainerHelper';

describe('getHeaderAndContent', () => {
    const testPath: string = 'test-path/file-name.csv';
    let currentFile: ZipFile | undefined = undefined;

    beforeEach(() => {
        currentFile = {
            content: ';base64,' + btoa('test'),
            type: 'file',
            isBase64: true,
            path: testPath,
            created: new Date(),
        };
    });

    it('should append the right local file header', () => {
        const result = getHeaderAndContent(currentFile as ZipFile, 0);

        const expectedCommonHeaderSize = 26; // bytes
        const expectedLocalFileHeader =
            4 + // bytes - signature: PK\x03\x04
            expectedCommonHeaderSize +
            testPath.length;

        expect(result.localFileHeader.length).toEqual(expectedLocalFileHeader);
    });
});
