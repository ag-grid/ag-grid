import { ZipContainer } from './zipContainer';

const readUInt16LE = (buffer: Uint8Array, offset: number): number => buffer[offset] | (buffer[offset + 1] << 8);
const readUInt32LE = (buffer: Uint8Array, offset: number): number =>
    buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24);

describe('When adding a file to a zip container with deflation', () => {
    const testPath: string = 'test-path/file-name.csv';
    const smallContent = 'aaaaaaaaaaaaaaaaaaaa'; // 20 bytes without deflation - Deflated size: 4 bytes
    const largeContent = 'aaaaaaaaaaaaaaaaaaaa'.repeat(1000); // 20kb without deflation - Deflated size: 38 bytes

    it('should handle a single small text header', async () => {
        const zipContainer = new ZipContainer();
        zipContainer.addFile(testPath, smallContent, false);
        const result = await zipContainer.getZipFile();

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

        // The 20 bytes 'aaa' string can be deflated to 4 bytes
        const deflationGains = smallContent.length - 4;

        expect(result.type).toEqual('application/zip');
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader +
                expectedLocalFileHeader +
                smallContent.length +
                expectedCentralDirectoryEndSize -
                deflationGains
        );
    });

    it('should handle a single large text header', async () => {
        const zipContainer = new ZipContainer();
        zipContainer.addFile(testPath, largeContent, false);
        const result = await zipContainer.getZipFile();

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

        // The 20kb 'aaaaaa' string can be deflated to 38 bytes !!!
        const deflationGains = largeContent.length - 38;

        expect(result.type).toEqual('application/zip');
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader +
                expectedLocalFileHeader +
                +largeContent.length +
                expectedCentralDirectoryEndSize -
                deflationGains
        );
    });

    it('should handle multiple files', async () => {
        const zipContainer = new ZipContainer();
        const testPath2: string = 'test-path/file-name2.csv';
        zipContainer.addFile(testPath, smallContent, false);
        zipContainer.addFile(testPath2, largeContent, false);
        const result = await zipContainer.getZipFile();

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

        // The 20 bytes 'aaa' string can be deflated to 4 bytes
        // The 20kb 'aaaaaa' string can be deflated to 38 bytes
        const deflationGains = smallContent.length + largeContent.length - 38 - 4;

        expect(result.type).toEqual('application/zip');
        expect(result.size).toEqual(
            +expectedCentralDirectoryHeader1 +
                expectedCentralDirectoryHeader2 +
                expectedLocalFileHeader1 +
                expectedLocalFileHeader2 +
                smallContent.length +
                largeContent.length +
                expectedCentralDirectoryEndSize -
                deflationGains
        );
    });

    it('aligns central directory entries with deflated local headers', async () => {
        const zipContainer = new ZipContainer();
        const testPath2: string = 'test-path/file-name2.csv';
        zipContainer.addFile(testPath, largeContent, false);
        zipContainer.addFile(testPath2, smallContent, false);
        const result = await zipContainer.getZipFile();
        const archive = new Uint8Array(await result.arrayBuffer());

        const endOfCentralDirectoryOffset = archive.length - 22; // end record has a fixed size in our writer
        const totalEntries = readUInt16LE(archive, endOfCentralDirectoryOffset + 8);
        const centralDirectorySize = readUInt32LE(archive, endOfCentralDirectoryOffset + 12);
        const centralDirectoryOffset = readUInt32LE(archive, endOfCentralDirectoryOffset + 16);

        expect(totalEntries).toBe(2);

        const decodeName = (start: number, length: number) =>
            Buffer.from(archive.slice(start, start + length)).toString('utf8');

        const localHeaders: {
            name: string;
            offset: number;
            compressedSize: number;
            uncompressedSize: number;
        }[] = [];

        let cursor = 0;
        for (let i = 0; i < totalEntries; i++) {
            expect(archive.slice(cursor, cursor + 4)).toEqual(Uint8Array.from([0x50, 0x4b, 0x03, 0x04]));
            const fileNameLength = readUInt16LE(archive, cursor + 26);
            const extraLength = readUInt16LE(archive, cursor + 28);
            const compressedSize = readUInt32LE(archive, cursor + 18);
            const uncompressedSize = readUInt32LE(archive, cursor + 22);
            const name = decodeName(cursor + 30, fileNameLength);

            localHeaders.push({ name, offset: cursor, compressedSize, uncompressedSize });
            cursor += 30 + fileNameLength + extraLength + compressedSize;
        }

        expect(cursor).toBe(centralDirectoryOffset);

        const centralEntries: {
            name: string;
            offset: number;
            compressedSize: number;
            uncompressedSize: number;
        }[] = [];

        cursor = centralDirectoryOffset;
        for (let i = 0; i < totalEntries; i++) {
            expect(archive.slice(cursor, cursor + 4)).toEqual(Uint8Array.from([0x50, 0x4b, 0x01, 0x02]));

            const fileNameLength = readUInt16LE(archive, cursor + 28);
            const extraLength = readUInt16LE(archive, cursor + 30);
            const commentLength = readUInt16LE(archive, cursor + 32);
            const compressedSize = readUInt32LE(archive, cursor + 20);
            const uncompressedSize = readUInt32LE(archive, cursor + 24);
            const offset = readUInt32LE(archive, cursor + 42);

            const name = decodeName(cursor + 46, fileNameLength);

            centralEntries.push({ name, offset, compressedSize, uncompressedSize });
            cursor += 46 + fileNameLength + extraLength + commentLength;
        }

        expect(cursor).toBe(endOfCentralDirectoryOffset);
        expect(centralDirectoryOffset + centralDirectorySize).toBe(endOfCentralDirectoryOffset);

        const localByName = new Map(localHeaders.map((header) => [header.name, header]));
        for (const entry of centralEntries) {
            const local = localByName.get(entry.name);
            expect(local).toBeDefined();
            expect(entry.offset).toBe(local!.offset);
            expect(entry.compressedSize).toBe(local!.compressedSize);
            expect(entry.uncompressedSize).toBe(local!.uncompressedSize);
            expect(entry.compressedSize).toBeLessThan(entry.uncompressedSize);
        }
    });
});
