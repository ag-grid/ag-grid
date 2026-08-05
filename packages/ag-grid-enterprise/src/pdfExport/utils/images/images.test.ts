import { constants, deflateSync } from 'node:zlib';

import { inflateZlib } from './inflate';
import { decodeJpeg } from './jpeg';
import { decodePng } from './png';

describe('PDF image decoders', () => {
    it('reads JPEG dimensions and colour space without decoding its pixels', () => {
        const jpeg = Uint8Array.from([
            0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x02, 0x00, 0x03, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9,
        ]);

        const image = decodeJpeg(jpeg);

        expect(image).toMatchObject({
            width: 3,
            height: 2,
            colorSpace: 'DeviceGray',
            bitsPerComponent: 8,
            filter: 'DCTDecode',
        });
        expect(image.data).toBe(jpeg);
    });

    it('decodes PNG colour and alpha samples', () => {
        const png = createPng(1, 1, 6, Uint8Array.from([0, 255, 32, 16, 128]));

        const image = decodePng(png);

        expect(image).toMatchObject({
            width: 1,
            height: 1,
            colorSpace: 'DeviceRGB',
            bitsPerComponent: 8,
        });
        expect(Array.from(image.data)).toEqual([255, 32, 16]);
        expect(Array.from(image.alpha!)).toEqual([128]);
    });

    it.each([
        {
            bitDepth: 1,
            packedSamples: [0xa0],
            palette: [0, 0, 0, 255, 0, 0],
            expected: [255, 0, 0, 0, 0, 0, 255, 0, 0],
        },
        {
            bitDepth: 2,
            packedSamples: [0x6c],
            palette: [0, 0, 0, 255, 0, 0, 255, 204, 0, 255, 255, 255],
            expected: [255, 0, 0, 255, 204, 0, 255, 255, 255],
        },
        {
            bitDepth: 4,
            packedSamples: [0x12, 0x30],
            palette: [0, 0, 0, 255, 0, 0, 255, 204, 0, 255, 255, 255],
            expected: [255, 0, 0, 255, 204, 0, 255, 255, 255],
        },
    ])('decodes $bitDepth-bit indexed PNG colour samples', ({ bitDepth, packedSamples, palette, expected }) => {
        const png = createPng(3, 1, 3, Uint8Array.from([0, ...packedSamples]), 0, bitDepth, Uint8Array.from(palette));

        const image = decodePng(png);

        expect(image).toMatchObject({
            width: 3,
            height: 1,
            colorSpace: 'DeviceRGB',
            bitsPerComponent: 8,
        });
        expect(Array.from(image.data)).toEqual(expected);
    });

    it('rejects JPEG frames that DCTDecode cannot render', () => {
        const jpeg = Uint8Array.from([
            0xff, 0xd8, 0xff, 0xc3, 0x00, 0x0b, 0x08, 0x00, 0x02, 0x00, 0x03, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9,
        ]);

        expect(() => decodeJpeg(jpeg)).toThrow(
            'AG Grid: PDF Export supports baseline, extended and progressive JPEG images only.'
        );
    });

    it('rejects PNG images above the supported pixel count', () => {
        const png = createPng(3000, 3000, 6, Uint8Array.from([0, 255, 32, 16, 128]));

        expect(() => decodePng(png)).toThrow('AG Grid: PDF PNG images are limited to 4,000,000 pixels.');
    });

    it.each([0, 1, 2, 3, 4])('recovers multi-row RGBA pixels through filter type %d', (filterType) => {
        const width = 3;
        const height = 3;
        const bytesPerPixel = 4;
        const raw = pseudoRandomBytes(width * height * bytesPerPixel);
        for (let pixel = 0; pixel < width * height; pixel++) {
            raw[pixel * bytesPerPixel + 3] = 255 - pixel * 20;
        }
        const filtered = filterScanlines(raw, width, height, bytesPerPixel, filterType);

        const image = decodePng(createEncodedPng(width, height, 6, filtered));

        const expectedColors: number[] = [];
        const expectedAlpha: number[] = [];
        for (let pixel = 0; pixel < width * height; pixel++) {
            expectedColors.push(
                raw[pixel * bytesPerPixel],
                raw[pixel * bytesPerPixel + 1],
                raw[pixel * bytesPerPixel + 2]
            );
            expectedAlpha.push(raw[pixel * bytesPerPixel + 3]);
        }
        expect(Array.from(image.data)).toEqual(expectedColors);
        expect(Array.from(image.alpha!)).toEqual(expectedAlpha);
    });

    it('concatenates image data across multiple IDAT chunks', () => {
        const width = 3;
        const height = 3;
        const bytesPerPixel = 4;
        const raw = pseudoRandomBytes(width * height * bytesPerPixel);
        const filtered = filterScanlines(raw, width, height, bytesPerPixel, 2);

        const single = decodePng(createEncodedPng(width, height, 6, filtered));
        const split = decodePng(createEncodedPng(width, height, 6, filtered, { idatChunkCount: 3 }));

        expect(Array.from(split.data)).toEqual(Array.from(single.data));
        expect(Array.from(split.alpha ?? [])).toEqual(Array.from(single.alpha ?? []));
    });

    it('marks matching greyscale pixels transparent via tRNS', () => {
        const png = createEncodedPng(2, 1, 0, Uint8Array.from([0, 10, 20]), {
            transparency: Uint8Array.from([0, 20]),
        });

        const image = decodePng(png);

        expect(image.colorSpace).toBe('DeviceGray');
        expect(Array.from(image.data)).toEqual([10, 20]);
        expect(Array.from(image.alpha!)).toEqual([255, 0]);
    });

    it('extracts the alpha channel from greyscale-alpha PNG images', () => {
        const png = createEncodedPng(2, 1, 4, Uint8Array.from([0, 10, 255, 20, 64]));

        const image = decodePng(png);

        expect(image.colorSpace).toBe('DeviceGray');
        expect(Array.from(image.data)).toEqual([10, 20]);
        expect(Array.from(image.alpha!)).toEqual([255, 64]);
    });

    it('marks matching RGB pixels transparent via tRNS', () => {
        const png = createEncodedPng(2, 1, 2, Uint8Array.from([0, 1, 2, 3, 4, 5, 6]), {
            transparency: Uint8Array.from([0, 4, 0, 5, 0, 6]),
        });

        const image = decodePng(png);

        expect(Array.from(image.data)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(Array.from(image.alpha!)).toEqual([255, 0]);
    });

    it('applies palette transparency via tRNS', () => {
        const png = createEncodedPng(2, 1, 3, Uint8Array.from([0, 0, 1]), {
            palette: Uint8Array.from([255, 0, 0, 0, 255, 0]),
            transparency: Uint8Array.from([255, 64]),
        });

        const image = decodePng(png);

        expect(Array.from(image.data)).toEqual([255, 0, 0, 0, 255, 0]);
        expect(Array.from(image.alpha!)).toEqual([255, 64]);
    });

    it('rejects CMYK and 12-bit JPEG frames', () => {
        const cmyk = Uint8Array.from([
            0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x02, 0x00, 0x03, 0x04, 0x01, 0x11, 0x00, 0xff, 0xd9,
        ]);
        const twelveBit = Uint8Array.from([
            0xff, 0xd8, 0xff, 0xc0, 0x00, 0x0b, 0x0c, 0x00, 0x02, 0x00, 0x03, 0x01, 0x01, 0x11, 0x00, 0xff, 0xd9,
        ]);

        expect(() => decodeJpeg(cmyk)).toThrow('AG Grid: PDF Export supports 8-bit greyscale and RGB JPEG images.');
        expect(() => decodeJpeg(twelveBit)).toThrow(
            'AG Grid: PDF Export supports 8-bit greyscale and RGB JPEG images.'
        );
    });

    it('rejects a JPEG segment that overruns the file', () => {
        const jpeg = Uint8Array.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0xff, 0x08]);

        expect(() => decodeJpeg(jpeg)).toThrow('AG Grid: PDF image contains an invalid JPEG segment.');
    });

    it('skips application segments before the JPEG frame', () => {
        const jpeg = Uint8Array.from([
            0xff, 0xd8, 0xff, 0xe1, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x02, 0x00, 0x03, 0x01,
            0x01, 0x11, 0x00, 0xff, 0xd9,
        ]);

        expect(decodeJpeg(jpeg)).toMatchObject({ width: 3, height: 2, colorSpace: 'DeviceGray' });
    });

    it('rejects interlaced PNG images', () => {
        const png = createPng(1, 1, 6, Uint8Array.from([0, 255, 32, 16, 255]), 1);

        expect(() => decodePng(png)).toThrow(
            'PDF Export supports non-interlaced, 8-bit PNG images and 1-, 2-, or 4-bit indexed PNG images.'
        );
    });
});

describe('PDF zlib inflate', () => {
    const roundTrip = (data: Uint8Array, deflated: Uint8Array): void => {
        expect(Array.from(inflateZlib(deflated, data.length))).toEqual(Array.from(data));
    };

    it('round-trips fixed-Huffman blocks', () => {
        const data = pseudoRandomBytes(2048);
        roundTrip(data, new Uint8Array(deflateSync(data, { strategy: constants.Z_FIXED })));
    });

    it('round-trips dynamic-Huffman blocks with back-references', () => {
        const data = new TextEncoder().encode('AG Grid PDF export round trip. '.repeat(600));
        roundTrip(data, new Uint8Array(deflateSync(data)));
    });

    it('round-trips long runs through maximum-length matches', () => {
        const data = new Uint8Array(100_000);
        roundTrip(data, new Uint8Array(deflateSync(data)));
    });

    it('round-trips multi-block stored streams', () => {
        // level 0 emits stored blocks, and >65,535 bytes forces more than one block.
        const data = pseudoRandomBytes(100_000);
        roundTrip(data, new Uint8Array(deflateSync(data, { level: 0 })));
    });

    it('round-trips literal-heavy high-entropy data', () => {
        const data = pseudoRandomBytes(8192);
        roundTrip(data, new Uint8Array(deflateSync(data)));
    });

    it('rejects truncated compressed data', () => {
        const data = new TextEncoder().encode('AG Grid PDF export round trip. '.repeat(600));
        const truncated = new Uint8Array(deflateSync(data)).subarray(0, 64);

        expect(() => inflateZlib(truncated, data.length)).toThrow(
            'AG Grid: PDF PNG image compressed data ended unexpectedly.'
        );
    });

    it('rejects a corrupted checksum', () => {
        const data = pseudoRandomBytes(512);
        const deflated = new Uint8Array(deflateSync(data));
        deflated[deflated.length - 1] ^= 0xff;

        expect(() => inflateZlib(deflated, data.length)).toThrow(
            'AG Grid: PDF PNG image data failed its zlib checksum.'
        );
    });

    it('rejects output beyond the expected size', () => {
        const data = new Uint8Array(100);

        expect(() => inflateZlib(new Uint8Array(deflateSync(data)), 10)).toThrow(
            'AG Grid: PDF PNG image data exceeds its expected dimensions.'
        );
    });

    it('rejects a back-reference before the stream start', () => {
        const writer = new BitWriter();
        writer.writeBits(1, 1); // final block
        writer.writeBits(1, 2); // fixed Huffman tables
        writer.writeCode(0x30 + 65, 8); // literal 'A'
        writer.writeCode(1, 7); // length symbol 257: match length 3
        writer.writeCode(3, 5); // distance symbol 3: distance 4, beyond the single written byte

        expect(() => inflateZlib(writer.toZlibStream(), 16)).toThrow(
            'AG Grid: PDF PNG image contains an invalid DEFLATE back-reference.'
        );
    });

    it('rejects an over-subscribed dynamic Huffman table', () => {
        const writer = new BitWriter();
        writer.writeBits(1, 1); // final block
        writer.writeBits(2, 2); // dynamic Huffman tables
        writer.writeBits(0, 5); // 257 literal/length codes
        writer.writeBits(0, 5); // 1 distance code
        writer.writeBits(15, 4); // all 19 code-length entries follow
        for (let index = 0; index < 19; index++) {
            // three one-bit codes over-subscribe the code-length table
            writer.writeBits(index < 3 ? 1 : 0, 3);
        }

        expect(() => inflateZlib(writer.toZlibStream(), 16)).toThrow(
            'AG Grid: PDF PNG image contains an over-subscribed Huffman table.'
        );
    });
});

/**
 * Writes the LSB-first DEFLATE bit stream used to hand-craft malformed fixtures
 * that no real compressor emits.
 */
class BitWriter {
    private readonly bits: number[] = [];

    public writeBits(value: number, count: number): void {
        for (let index = 0; index < count; index++) {
            this.bits.push((value >>> index) & 1);
        }
    }

    /** Huffman codes are written to the stream most-significant bit first. */
    public writeCode(code: number, length: number): void {
        for (let index = length - 1; index >= 0; index--) {
            this.bits.push((code >>> index) & 1);
        }
    }

    public toZlibStream(): Uint8Array {
        const payload = new Uint8Array(Math.ceil(this.bits.length / 8));
        for (let index = 0; index < this.bits.length; index++) {
            if (this.bits[index]) {
                payload[index >> 3] |= 1 << (index & 7);
            }
        }
        // decoding fails before the trailing Adler-32 placeholder is read
        return Uint8Array.from([0x78, 0x01, ...payload, 0, 0, 0, 0]);
    }
}

function pseudoRandomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    let seed = 0x2f6e2b1;
    for (let index = 0; index < length; index++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        bytes[index] = (seed >>> 16) & 0xff;
    }
    return bytes;
}

function paethReference(left: number, above: number, upperLeft: number): number {
    const estimate = left + above - upperLeft;
    const leftDistance = Math.abs(estimate - left);
    const aboveDistance = Math.abs(estimate - above);
    const upperLeftDistance = Math.abs(estimate - upperLeft);
    if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) {
        return left;
    }
    return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

/**
 * Forward-filter raw pixels per the PNG specification, producing scanlines with
 * a leading filter byte per row. Predictors read original bytes, mirroring how
 * encoders filter before compression.
 */
function filterScanlines(
    raw: Uint8Array,
    width: number,
    height: number,
    bytesPerPixel: number,
    filterType: number
): Uint8Array {
    const stride = width * bytesPerPixel;
    const output = new Uint8Array((stride + 1) * height);

    for (let row = 0; row < height; row++) {
        output[row * (stride + 1)] = filterType;
        for (let column = 0; column < stride; column++) {
            const value = raw[row * stride + column];
            const left = column >= bytesPerPixel ? raw[row * stride + column - bytesPerPixel] : 0;
            const above = row > 0 ? raw[(row - 1) * stride + column] : 0;
            const upperLeft = row > 0 && column >= bytesPerPixel ? raw[(row - 1) * stride + column - bytesPerPixel] : 0;
            let predictor = 0;
            if (filterType === 1) {
                predictor = left;
            } else if (filterType === 2) {
                predictor = above;
            } else if (filterType === 3) {
                predictor = Math.floor((left + above) / 2);
            } else if (filterType === 4) {
                predictor = paethReference(left, above, upperLeft);
            }
            output[row * (stride + 1) + 1 + column] = (value - predictor + 256) & 0xff;
        }
    }

    return output;
}

function createEncodedPng(
    width: number,
    height: number,
    colorType: number,
    filteredScanlines: Uint8Array,
    options: { bitDepth?: number; palette?: Uint8Array; transparency?: Uint8Array; idatChunkCount?: number } = {}
): Uint8Array {
    const { bitDepth = 8, palette, transparency, idatChunkCount = 1 } = options;
    const chunks = [
        Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]),
        createChunk('IHDR', createIhdrData(width, height, bitDepth, colorType, 0)),
    ];
    if (palette) {
        chunks.push(createChunk('PLTE', palette));
    }
    if (transparency) {
        chunks.push(createChunk('tRNS', transparency));
    }

    const deflated = new Uint8Array(deflateSync(filteredScanlines));
    const chunkSize = Math.ceil(deflated.length / idatChunkCount);
    for (let start = 0; start < deflated.length; start += chunkSize) {
        chunks.push(createChunk('IDAT', deflated.subarray(start, Math.min(start + chunkSize, deflated.length))));
    }

    chunks.push(createChunk('IEND', new Uint8Array()));
    return concatenate(chunks);
}

function createIhdrData(
    width: number,
    height: number,
    bitDepth: number,
    colorType: number,
    interlace: number
): Uint8Array {
    return Uint8Array.from([
        (width >>> 24) & 0xff,
        (width >>> 16) & 0xff,
        (width >>> 8) & 0xff,
        width & 0xff,
        (height >>> 24) & 0xff,
        (height >>> 16) & 0xff,
        (height >>> 8) & 0xff,
        height & 0xff,
        bitDepth,
        colorType,
        0,
        0,
        interlace,
    ]);
}

function createPng(
    width: number,
    height: number,
    colorType: number,
    scanlines: Uint8Array,
    interlace = 0,
    bitDepth = 8,
    palette?: Uint8Array
): Uint8Array {
    const header = createIhdrData(width, height, bitDepth, colorType, interlace);
    const chunks = [Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]), createChunk('IHDR', header)];
    if (palette) {
        chunks.push(createChunk('PLTE', palette));
    }
    chunks.push(createChunk('IDAT', createStoredZlibStream(scanlines)), createChunk('IEND', new Uint8Array()));
    return concatenate(chunks);
}

function createStoredZlibStream(data: Uint8Array): Uint8Array {
    const length = data.length;
    const inverseLength = length ^ 0xffff;
    const checksum = calculateAdler32(data);
    return Uint8Array.from([
        0x78,
        0x01,
        0x01,
        length & 0xff,
        (length >>> 8) & 0xff,
        inverseLength & 0xff,
        (inverseLength >>> 8) & 0xff,
        ...data,
        (checksum >>> 24) & 0xff,
        (checksum >>> 16) & 0xff,
        (checksum >>> 8) & 0xff,
        checksum & 0xff,
    ]);
}

function createChunk(type: string, data: Uint8Array): Uint8Array {
    const length = data.length;
    return Uint8Array.from([
        (length >>> 24) & 0xff,
        (length >>> 16) & 0xff,
        (length >>> 8) & 0xff,
        length & 0xff,
        type.charCodeAt(0),
        type.charCodeAt(1),
        type.charCodeAt(2),
        type.charCodeAt(3),
        ...data,
        0,
        0,
        0,
        0,
    ]);
}

function calculateAdler32(data: Uint8Array): number {
    let first = 1;
    let second = 0;
    for (const value of data) {
        first = (first + value) % 65521;
        second = (second + first) % 65521;
    }
    return ((second << 16) | first) >>> 0;
}

function concatenate(parts: Uint8Array[]): Uint8Array {
    let length = 0;
    for (const part of parts) {
        length += part.length;
    }
    const result = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) {
        result.set(part, offset);
        offset += part.length;
    }
    return result;
}
