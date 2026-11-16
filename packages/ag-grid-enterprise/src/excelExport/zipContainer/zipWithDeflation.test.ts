import { inflateRawSync } from 'node:zlib';

import { ZipContainer } from './zipContainer';

const readUInt16LE = (buffer: Uint8Array, offset: number): number => buffer[offset] | (buffer[offset + 1] << 8);
const readUInt32LE = (buffer: Uint8Array, offset: number): number =>
    buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24);

/** The archive's first `count` local entries, each inflated from the compressed size its header records. */
const readLocalEntries = (archive: Uint8Array, count: number) => {
    const entries: { name: string; content: string; compressedSize: number; end: number }[] = [];
    let offset = 0;
    for (let i = 0; i < count; ++i) {
        const nameLength = readUInt16LE(archive, offset + 26);
        const compressedSize = readUInt32LE(archive, offset + 18);
        const contentStart = offset + 30 + nameLength + readUInt16LE(archive, offset + 28);
        entries.push({
            name: new TextDecoder().decode(archive.subarray(offset + 30, offset + 30 + nameLength)),
            content: inflateRawSync(archive.subarray(contentStart, contentStart + compressedSize)).toString('utf8'),
            compressedSize,
            end: contentStart + compressedSize,
        });
        offset = contentStart + compressedSize;
    }
    return entries;
};

describe('When adding a file to a zip container with deflation', () => {
    const testPath: string = 'test-path/file-name.csv';
    const smallContent = 'aaaaaaaaaaaaaaaaaaaa';
    const largeContent = 'aaaaaaaaaaaaaaaaaaaa'.repeat(1000);

    it('preserves entry order and contents across compression batches', async () => {
        const zipContainer = new ZipContainer();
        const contents = Array.from({ length: 9 }, (_, index) => `${index}:\u00e9`.repeat(30000));
        for (let i = 0; i < contents.length; ++i) {
            zipContainer.addFile(`sheet${i}\u00e9.xml`, contents[i]);
        }
        const archive = new Uint8Array(await (await zipContainer.getZipFile()).arrayBuffer());
        const entries = readLocalEntries(archive, contents.length);
        expect(entries.map(({ name, content }) => ({ name, content }))).toEqual(
            contents.map((content, i) => ({ name: `sheet${i}\u00e9.xml`, content }))
        );
        expect(entries[entries.length - 1].end).toBe(readUInt32LE(archive, archive.length - 22 + 16));
    });

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

        const [entry] = readLocalEntries(new Uint8Array(await result.arrayBuffer()), 1);

        expect(result.type).toEqual('application/zip');
        expect(entry.content).toBe(smallContent);
        expect(entry.compressedSize).toBeLessThan(smallContent.length);
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader +
                expectedLocalFileHeader +
                entry.compressedSize +
                expectedCentralDirectoryEndSize
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

        const [entry] = readLocalEntries(new Uint8Array(await result.arrayBuffer()), 1);

        expect(result.type).toEqual('application/zip');
        expect(entry.content).toBe(largeContent);
        expect(entry.compressedSize).toBeLessThan(largeContent.length);
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader +
                expectedLocalFileHeader +
                entry.compressedSize +
                expectedCentralDirectoryEndSize
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

        const [entry1, entry2] = readLocalEntries(new Uint8Array(await result.arrayBuffer()), 2);

        expect(result.type).toEqual('application/zip');
        expect([entry1.content, entry2.content]).toEqual([smallContent, largeContent]);
        expect(entry1.compressedSize).toBeLessThan(smallContent.length);
        expect(entry2.compressedSize).toBeLessThan(largeContent.length);
        expect(result.size).toEqual(
            expectedCentralDirectoryHeader1 +
                expectedCentralDirectoryHeader2 +
                expectedLocalFileHeader1 +
                expectedLocalFileHeader2 +
                entry1.compressedSize +
                entry2.compressedSize +
                expectedCentralDirectoryEndSize
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
