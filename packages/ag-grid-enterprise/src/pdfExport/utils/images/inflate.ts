/**
 * Order in which a dynamic DEFLATE block transmits the code-length alphabet.
 */
const CODE_LENGTH_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

/**
 * Base match lengths represented by literal/length symbols 257–285.
 */
const LENGTH_BASE = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
];

/**
 * Number of extra bits appended to each base match length.
 */
const LENGTH_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

/**
 * Base backward distances represented by distance symbols 0–29.
 */
const DISTANCE_BASE = [
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577,
];

/**
 * Number of extra bits appended to each base backward distance.
 */
const DISTANCE_EXTRA = [
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];

/**
 * Reads the least-significant-bit-first bit stream used by DEFLATE.
 */
class BitReader {
    private byteIndex = 0;
    private bitBuffer = 0;
    private bitCount = 0;

    constructor(private readonly data: Uint8Array) {}

    /**
     * Read an unsigned value containing the next bits in the stream.
     * @param count - Number of bits to consume.
     * @returns The decoded unsigned value.
     */
    public readBits(count: number): number {
        while (this.bitCount < count) {
            if (this.byteIndex >= this.data.length) {
                throw new Error('AG Grid: PDF PNG image compressed data ended unexpectedly.');
            }
            this.bitBuffer |= this.data[this.byteIndex++] << this.bitCount;
            this.bitCount += 8;
        }

        const mask = count === 32 ? 0xffffffff : (1 << count) - 1;
        const value = this.bitBuffer & mask;
        this.bitBuffer >>>= count;
        this.bitCount -= count;
        return value;
    }

    /**
     * Discard buffered bits so the next read starts at a byte boundary.
     */
    public alignToByte(): void {
        this.bitBuffer = 0;
        this.bitCount = 0;
    }
}

/**
 * Canonical Huffman decoder built from the code lengths stored in a DEFLATE block.
 */
class HuffmanTable {
    private readonly symbolsByCode = new Map<number, number>();
    private readonly maximumLength: number;

    /**
     * @param lengths - Huffman code length indexed by symbol.
     */
    constructor(lengths: number[]) {
        const counts = new Array<number>(16).fill(0);
        let maximumLength = 0;

        for (const length of lengths) {
            if (length < 0 || length > 15) {
                throw new Error('AG Grid: PDF PNG image contains an invalid Huffman code length.');
            }
            if (length) {
                counts[length] += 1;
                maximumLength = Math.max(maximumLength, length);
            }
        }
        if (!maximumLength) {
            throw new Error('AG Grid: PDF PNG image Huffman table has no symbols.');
        }

        let coverage = 0;
        for (let length = 1; length <= 15; length++) {
            coverage += counts[length] << (15 - length);
        }
        if (coverage > 0x8000) {
            throw new Error('AG Grid: PDF PNG image contains an over-subscribed Huffman table.');
        }

        const nextCodes = new Array<number>(16).fill(0);
        let code = 0;
        for (let length = 1; length <= 15; length++) {
            // canonical codes of a given length follow all shorter codes
            code = (code + counts[length - 1]) << 1;
            nextCodes[length] = code;
        }

        for (let symbol = 0; symbol < lengths.length; symbol++) {
            const length = lengths[symbol];
            if (!length) {
                continue;
            }
            // DEFLATE writes Huffman codes most-significant bit first into an lsb-first stream
            const reversedCode = reverseBits(nextCodes[length]++, length);
            this.symbolsByCode.set((length << 16) | reversedCode, symbol);
        }

        this.maximumLength = maximumLength;
    }

    /**
     * Decode one symbol from a bit stream.
     * @param reader - Source DEFLATE bit reader.
     * @returns The decoded symbol number.
     */
    public decode(reader: BitReader): number {
        let code = 0;
        for (let length = 1; length <= this.maximumLength; length++) {
            code |= reader.readBits(1) << (length - 1);
            const symbol = this.symbolsByCode.get((length << 16) | code);
            if (symbol != null) {
                return symbol;
            }
        }
        throw new Error('AG Grid: PDF PNG image contains an invalid Huffman code.');
    }
}

/**
 * Fixed-capacity inflate output sized from the PNG header, so malformed
 * compressed data cannot expand beyond the expected decoded size.
 */
class OutputBuffer {
    private readonly bytes: Uint8Array;
    private position = 0;

    constructor(capacity: number) {
        this.bytes = new Uint8Array(capacity);
    }

    public get length(): number {
        return this.position;
    }

    public push(value: number): void {
        this.ensureCapacity(1);
        this.bytes[this.position] = value;
        this.position += 1;
    }

    public copyBackReference(distance: number, count: number): void {
        this.ensureCapacity(count);
        const bytes = this.bytes;
        for (let index = 0; index < count; index++) {
            // read from already-written output so overlapping back-references repeat correctly
            bytes[this.position] = bytes[this.position - distance];
            this.position += 1;
        }
    }

    public ensureCapacity(count: number): void {
        if (this.position + count > this.bytes.length) {
            throw new Error('AG Grid: PDF PNG image data exceeds its expected dimensions.');
        }
    }

    public toBytes(): Uint8Array {
        return this.position === this.bytes.length ? this.bytes : this.bytes.subarray(0, this.position);
    }
}

/**
 * Inflate a zlib stream used by PNG image data.
 * @param data - Complete zlib stream.
 * @param maximumOutputLength - Maximum accepted decoded size.
 * @returns Inflated bytes.
 */
export function inflateZlib(data: Uint8Array, maximumOutputLength: number): Uint8Array {
    if (data.length < 6) {
        throw new Error('AG Grid: PDF PNG image data is not a valid zlib stream.');
    }

    const compressionMethod = data[0] & 0x0f;
    const header = (data[0] << 8) | data[1];
    if (compressionMethod !== 8 || header % 31 !== 0 || (data[1] & 0x20) !== 0) {
        throw new Error('AG Grid: PDF PNG image uses an unsupported zlib stream.');
    }

    const reader = new BitReader(data.subarray(2, data.length - 4));
    const output = new OutputBuffer(maximumOutputLength);
    let finalBlock = false;

    while (!finalBlock) {
        // every DEFLATE block begins with a final-block flag and a two-bit block type
        finalBlock = reader.readBits(1) === 1;
        const blockType = reader.readBits(2);
        if (blockType === 0) {
            readStoredBlock(reader, output);
        } else if (blockType === 1) {
            const tables = createFixedTables();
            readCompressedBlock(reader, output, tables.literalLength, tables.distance);
        } else if (blockType === 2) {
            const tables = readDynamicTables(reader);
            readCompressedBlock(reader, output, tables.literalLength, tables.distance);
        } else {
            throw new Error('AG Grid: PDF PNG image contains an invalid DEFLATE block.');
        }
    }

    const result = output.toBytes();
    const expectedAdler =
        data[data.length - 4] * 0x1000000 +
        data[data.length - 3] * 0x10000 +
        data[data.length - 2] * 0x100 +
        data[data.length - 1];
    if (calculateAdler32(result) !== expectedAdler >>> 0) {
        throw new Error('AG Grid: PDF PNG image data failed its zlib checksum.');
    }
    return result;
}

/**
 * Decode an uncompressed DEFLATE block.
 * @param reader - Source DEFLATE bit reader.
 * @param output - Accumulated inflated bytes.
 */
function readStoredBlock(reader: BitReader, output: OutputBuffer): void {
    reader.alignToByte();
    const length = reader.readBits(16);
    const inverseLength = reader.readBits(16);
    if ((length ^ 0xffff) !== inverseLength) {
        throw new Error('AG Grid: PDF PNG image contains an invalid stored DEFLATE block.');
    }
    output.ensureCapacity(length);
    for (let index = 0; index < length; index++) {
        output.push(reader.readBits(8));
    }
}

/**
 * Decode a Huffman-compressed DEFLATE block.
 * @param reader - Source DEFLATE bit reader.
 * @param output - Accumulated inflated bytes.
 * @param literalLengthTable - Decoder for literal bytes, match lengths and the end marker.
 * @param distanceTable - Decoder for backward-reference distances.
 */
function readCompressedBlock(
    reader: BitReader,
    output: OutputBuffer,
    literalLengthTable: HuffmanTable,
    distanceTable: HuffmanTable | undefined
): void {
    while (true) {
        const symbol = literalLengthTable.decode(reader);
        if (symbol < 256) {
            output.push(symbol);
        } else if (symbol === 256) {
            return;
        } else if (symbol <= 285) {
            const lengthIndex = symbol - 257;
            const length = LENGTH_BASE[lengthIndex] + reader.readBits(LENGTH_EXTRA[lengthIndex]);
            if (!distanceTable) {
                throw new Error('AG Grid: PDF PNG image contains a length without a DEFLATE distance table.');
            }
            const distanceSymbol = distanceTable.decode(reader);
            if (distanceSymbol >= DISTANCE_BASE.length) {
                throw new Error('AG Grid: PDF PNG image contains an invalid DEFLATE distance.');
            }
            const distance = DISTANCE_BASE[distanceSymbol] + reader.readBits(DISTANCE_EXTRA[distanceSymbol]);
            if (distance > output.length) {
                throw new Error('AG Grid: PDF PNG image contains an invalid DEFLATE back-reference.');
            }

            output.copyBackReference(distance, length);
        } else {
            throw new Error('AG Grid: PDF PNG image contains an invalid DEFLATE length.');
        }
    }
}

/**
 * Create the predefined Huffman tables used by a fixed-code DEFLATE block.
 * @returns The fixed literal/length and distance decoders.
 */
function createFixedTables(): { literalLength: HuffmanTable; distance: HuffmanTable } {
    const literalLengths = new Array<number>(288);
    for (let symbol = 0; symbol <= 143; symbol++) {
        literalLengths[symbol] = 8;
    }
    for (let symbol = 144; symbol <= 255; symbol++) {
        literalLengths[symbol] = 9;
    }
    for (let symbol = 256; symbol <= 279; symbol++) {
        literalLengths[symbol] = 7;
    }
    for (let symbol = 280; symbol <= 287; symbol++) {
        literalLengths[symbol] = 8;
    }
    return {
        literalLength: new HuffmanTable(literalLengths),
        distance: new HuffmanTable(new Array<number>(32).fill(5)),
    };
}

/**
 * Read the Huffman tables encoded at the start of a dynamic DEFLATE block.
 * @param reader - Source DEFLATE bit reader.
 * @returns The decoded literal/length table and optional distance table.
 */
function readDynamicTables(reader: BitReader): { literalLength: HuffmanTable; distance?: HuffmanTable } {
    const literalLengthCount = reader.readBits(5) + 257;
    const distanceCount = reader.readBits(5) + 1;
    const codeLengthCount = reader.readBits(4) + 4;
    const codeLengths = new Array<number>(19).fill(0);

    for (let index = 0; index < codeLengthCount; index++) {
        codeLengths[CODE_LENGTH_ORDER[index]] = reader.readBits(3);
    }

    const codeLengthTable = new HuffmanTable(codeLengths);
    const lengths: number[] = [];
    const totalCount = literalLengthCount + distanceCount;
    while (lengths.length < totalCount) {
        const symbol = codeLengthTable.decode(reader);
        if (symbol <= 15) {
            lengths.push(symbol);
        } else if (symbol === 16) {
            if (!lengths.length) {
                throw new Error('AG Grid: PDF PNG image contains an invalid repeated Huffman length.');
            }
            const repeatCount = reader.readBits(2) + 3;
            const previousLength = lengths[lengths.length - 1];
            appendRepeatedLength(lengths, previousLength, repeatCount, totalCount);
        } else if (symbol === 17) {
            appendRepeatedLength(lengths, 0, reader.readBits(3) + 3, totalCount);
        } else if (symbol === 18) {
            appendRepeatedLength(lengths, 0, reader.readBits(7) + 11, totalCount);
        } else {
            throw new Error('AG Grid: PDF PNG image contains an invalid Huffman length.');
        }
    }

    const distanceLengths = lengths.slice(literalLengthCount);
    return {
        literalLength: new HuffmanTable(lengths.slice(0, literalLengthCount)),
        distance: distanceLengths.some((length) => length > 0) ? new HuffmanTable(distanceLengths) : undefined,
    };
}

/**
 * Append a run-length-encoded Huffman code length while enforcing the declared table size.
 * @param lengths - Code lengths decoded so far.
 * @param value - Code length to repeat.
 * @param count - Number of repetitions.
 * @param maximumLength - Declared total number of code lengths.
 */
function appendRepeatedLength(lengths: number[], value: number, count: number, maximumLength: number): void {
    if (lengths.length + count > maximumLength) {
        throw new Error('AG Grid: PDF PNG image contains too many Huffman lengths.');
    }
    for (let index = 0; index < count; index++) {
        lengths.push(value);
    }
}

/**
 * Reverse the requested number of low-order bits.
 * @param value - Value containing the bits to reverse.
 * @param length - Number of bits to reverse.
 * @returns The reversed bit sequence.
 */
function reverseBits(value: number, length: number): number {
    let reversed = 0;
    for (let index = 0; index < length; index++) {
        reversed = (reversed << 1) | (value & 1);
        value >>>= 1;
    }
    return reversed;
}

/**
 * Calculate the checksum stored at the end of a zlib stream.
 * @param data - Inflated bytes covered by the checksum.
 * @returns The unsigned Adler-32 checksum.
 */
function calculateAdler32(data: Uint8Array): number {
    let first = 1;
    let second = 0;
    for (const value of data) {
        first = (first + value) % 65521;
        second = (second + first) % 65521;
    }
    return ((second << 16) | first) >>> 0;
}
