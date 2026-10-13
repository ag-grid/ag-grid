import { getCrcFromCrc32Table } from './crcTable';

function referenceCrc(bytes: Uint8Array): number {
    let crc = -1;
    for (const byte of bytes) {
        crc ^= byte;
        for (let bit = 0; bit < 8; ++bit) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }
    return crc ^ -1;
}

describe('ZIP CRC-32', () => {
    test('matches the standard check value and encodes strings as UTF-8', () => {
        expect(getCrcFromCrc32Table('123456789') >>> 0).toBe(0xcbf43926);
        const text = 'Excel \u00e9\u4e2d\ud83d\ude00';
        expect(getCrcFromCrc32Table(text)).toBe(referenceCrc(new TextEncoder().encode(text)));
    });

    test.each([0, 1, 7, 8, 9, 15, 16, 17, 255, 256, 1025, 65537])(
        'matches a bitwise CRC for %i bytes, including unaligned views',
        (length) => {
            const buffer = new Uint8Array(length + 5);
            let seed = 0x12345678;
            for (let i = 0; i < buffer.length; ++i) {
                seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
                buffer[i] = seed >>> 24;
            }
            const bytes = buffer.subarray(3, length + 3);
            expect(getCrcFromCrc32Table(bytes)).toBe(referenceCrc(bytes));
        }
    );
});
