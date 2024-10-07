import { describe, expect, it } from '@jest/globals';

import { ZipContainer } from './zipContainer';

describe('When adding a file to a zip container without deflation', () => {
    const testPath: string = 'test-path/file-name.csv';
    const smallContent = 'test-content';
    const largeContent = 'test-content'.repeat(1000);

    it('should handle a single small text header', () => {
        const zipContainer = new ZipContainer();
        zipContainer.addFile(testPath, smallContent, false);
        const result = zipContainer.getUncompressedZipFile();

        const expectedCommonHeaderSize = 26; // bytes
        const expectedLocalFileHeader =
            4 + // bytes - signature: PK\x03\x04
            expectedCommonHeaderSize +
            testPath.length;

        const expectedCentralDirectoryHeader =
            4 + // bytes - signature: PK\x01\x02
            16 + // bytes - central directory header
            expectedCommonHeaderSize + // Re-inserted inside the central directory
            testPath.length;

        const expectedCentralDirectoryEndSize =
            4 + // bytes - signature: PK\x05\x06
            18; // bytes - info about directory end

        expect(result.type).toEqual('application/zip');
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader +
                expectedLocalFileHeader +
                smallContent.length +
                expectedCentralDirectoryEndSize
        );
    });

    it('should handle a single large text header', () => {
        const zipContainer = new ZipContainer();
        zipContainer.addFile(testPath, largeContent, false);
        const result = zipContainer.getUncompressedZipFile();

        const expectedCommonHeaderSize = 26; // bytes
        const expectedLocalFileHeader =
            4 + // bytes - signature: PK\x03\x04
            expectedCommonHeaderSize +
            testPath.length;

        const expectedCentralDirectoryHeader =
            4 + // bytes - signature: PK\x01\x02
            16 + // bytes - central directory header
            expectedCommonHeaderSize + // Re-inserted inside the central directory
            testPath.length;

        const expectedCentralDirectoryEndSize =
            4 + // bytes - signature: PK\x05\x06
            18; // bytes - info about directory end

        expect(result.type).toEqual('application/zip');
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader +
                expectedLocalFileHeader +
                largeContent.length +
                expectedCentralDirectoryEndSize
        );
    });

    it('should handle multiple files', () => {
        const zipContainer = new ZipContainer();
        const testPath2: string = 'test-path/file-name2.csv';
        zipContainer.addFile(testPath, smallContent, false);
        zipContainer.addFile(testPath2, largeContent, false);
        const result = zipContainer.getUncompressedZipFile();

        const expectedCommonHeaderSize = 26; // bytes
        const expectedLocalFileHeader1 =
            4 + // bytes - signature: PK\x03\x04
            expectedCommonHeaderSize +
            testPath.length;

        const expectedLocalFileHeader2 =
            4 + // bytes - signature: PK\x03\x04
            expectedCommonHeaderSize +
            testPath2.length;

        const expectedCentralDirectoryHeader1 =
            4 + // bytes - signature: PK\x01\x02
            16 + // bytes - central directory header
            expectedCommonHeaderSize + // Re-inserted inside the central directory
            testPath2.length;

        const expectedCentralDirectoryHeader2 =
            4 + // bytes - signature: PK\x01\x02
            16 + // bytes - central directory header
            expectedCommonHeaderSize + // Re-inserted inside the central directory
            testPath.length;

        const expectedCentralDirectoryEndSize =
            4 + // bytes - signature: PK\x05\x06
            18; // bytes - info about directory end

        expect(result.type).toEqual('application/zip');
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader1 +
                expectedCentralDirectoryHeader2 +
                expectedLocalFileHeader1 +
                expectedLocalFileHeader2 +
                smallContent.length +
                largeContent.length +
                expectedCentralDirectoryEndSize
        );
    });
});
