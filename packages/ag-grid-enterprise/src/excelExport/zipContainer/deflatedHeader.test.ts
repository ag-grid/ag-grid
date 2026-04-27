import type { ZipFile } from './zipContainer';
import { getHeaders, preprocessFileForZip } from './zipContainerHelper';

describe('deflated headers', () => {
    const testPath: string = 'test-path/file-name.csv';
    let currentFile: ZipFile | undefined = undefined;

    beforeEach(() => {
        currentFile = {
            content: new Uint8Array([1, 2, 3]),
            type: 'file',
            isBase64: false,
            path: testPath,
            created: new Date(),
        };
    });

    it('should append the right local file header', async () => {
        const { rawContent, rawSize, deflatedSize, isCompressed } = await preprocessFileForZip(currentFile as ZipFile);
        const result = getHeaders(currentFile as ZipFile, isCompressed, 0, rawSize, rawContent, deflatedSize);

        const expectedCommonHeaderSize = 26; // bytes
        const expectedLocalFileHeader =
            4 + // bytes - signature: PK\x03\x04
            expectedCommonHeaderSize +
            testPath.length;

        expect(result.localFileHeader.length).toEqual(expectedLocalFileHeader);
    });
});
