import { inflateRawSync } from 'node:zlib';

import { deflateLocalFile } from './compress';

describe('ZIP compression', () => {
    test('round trips UTF-8 strings', async () => {
        const value = 'Excel \u00e9\u4e2d\ud83d\ude00';
        const result = await deflateLocalFile(value);
        expect(result.size).toBe(result.content.length);
        expect(inflateRawSync(result.content).toString('utf8')).toBe(value);
    });

    test.each([0, 65535, 65536, 65537, 196615])('round trips %i bytes across stream chunks', async (length) => {
        const bytes = new Uint8Array(length);
        let seed = 0x12345678;
        for (let i = 0; i < length; ++i) {
            seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
            bytes[i] = seed >>> 24;
        }
        const result = await deflateLocalFile(bytes);
        expect(result.size).toBe(result.content.length);
        expect(new Uint8Array(inflateRawSync(result.content))).toEqual(bytes);
    });
});
