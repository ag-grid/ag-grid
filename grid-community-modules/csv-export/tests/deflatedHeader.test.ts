import { beforeAll, beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import {ZipFile} from '../src/csvExport/zipContainer/zipContainer';
import {getDeflatedHeaderAndContent, getHeaderAndContent} from '../src/csvExport/zipContainer/zipContainerHelper';

describe('getDeflatedHeaderAndContent', () => {
    let testPath: string = 'test-path/file-name.csv';
    let currentFile: ZipFile | undefined = undefined;
    let deflationPerformed: boolean = false

    beforeEach(() => {
        currentFile = {
            content: new Uint8Array([1,2,3]),
            type: 'file',
            isBase64: false,
            path: testPath,
            created: new Date(),
        };

        deflationPerformed = false;
    });

    it('should append the right local file header', async () => {
        const result = await getDeflatedHeaderAndContent(currentFile, 0);

        const expectedCommonHeaderSize = 26; // bytes
        const expectedLocalFileHeader =
            4 // bytes - signature: PK\x03\x04
            + expectedCommonHeaderSize
            + testPath.length;

        expect(result.localFileHeader.length).toEqual(expectedLocalFileHeader);
    });
});
