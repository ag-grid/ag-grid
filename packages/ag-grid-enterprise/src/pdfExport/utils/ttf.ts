import type { PdfFontFace, PdfFontStyle } from 'ag-grid-community';

export interface TrueTypeFont {
    readonly data: Uint8Array;
    readonly postScriptName: string;
    readonly unitsPerEm: number;
    readonly ascent: number;
    readonly descent: number;
    readonly capHeight: number;
    readonly bbox: [number, number, number, number];
    readonly italicAngle: number;
    readonly weight: number;
    readonly style: PdfFontStyle;
    readonly canSubset: boolean;
    getTable(tag: string): Uint8Array | undefined;
    getGlyphId(codePoint: number): number;
    getAdvanceWidth(glyphId: number): number;
    createSubset(glyphIds: Iterable<number>): Uint8Array;
}

type TableRecord = {
    offset: number;
    length: number;
};

type CmapLookup = (codePoint: number) => number;

const EMBEDDED_TRUE_TYPE_TABLES = new Set([
    'OS/2',
    'cmap',
    'cvt ',
    'fpgm',
    'gasp',
    'glyf',
    'head',
    'hhea',
    'hmtx',
    'loca',
    'maxp',
    'name',
    'post',
    'prep',
]);

/**
 * Parse the metrics and character mapping required to embed a static TrueType font.
 * @param face - User-provided font face.
 * @param family - Registered family name used in validation errors.
 * @returns Parsed TrueType font.
 */
export function parseTrueTypeFont(face: PdfFontFace, family: string): TrueTypeFont {
    const data = toUint8Array(face.data);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    ensureRange(data, 0, 12, family);

    const sfntVersion = readTag(data, 0);
    if (readUint32(view, 0) !== 0x00010000 && sfntVersion !== 'true') {
        throw new Error(`AG Grid: PDF font "${family}" must be a static TrueType TTF font.`);
    }

    const tables = readTableDirectory(data, view, family);
    if (tables.has('CFF ') || tables.has('CFF2')) {
        throw new Error(`AG Grid: PDF font "${family}" uses unsupported CFF outlines.`);
    }

    const head = getRequiredTable(tables, 'head', family);
    const hhea = getRequiredTable(tables, 'hhea', family);
    const maxp = getRequiredTable(tables, 'maxp', family);
    const hmtx = getRequiredTable(tables, 'hmtx', family);
    const cmap = getRequiredTable(tables, 'cmap', family);
    const loca = getRequiredTable(tables, 'loca', family);
    const glyf = getRequiredTable(tables, 'glyf', family);
    const os2 = tables.get('OS/2');
    const post = tables.get('post');
    const name = tables.get('name');

    ensureTableRange(data, head, 54, family, 'head');
    ensureTableRange(data, hhea, 36, family, 'hhea');
    ensureTableRange(data, maxp, 6, family, 'maxp');

    const unitsPerEm = readUint16(view, head.offset + 18);
    if (!unitsPerEm) {
        throw new Error(`AG Grid: PDF font "${family}" has an invalid unitsPerEm value.`);
    }

    const numGlyphs = readUint16(view, maxp.offset + 4);
    const indexToLocFormat = readInt16(view, head.offset + 50);
    if (indexToLocFormat !== 0 && indexToLocFormat !== 1) {
        throw new Error(`AG Grid: PDF font "${family}" uses an invalid glyph location format.`);
    }
    ensureTableRange(data, loca, (numGlyphs + 1) * (indexToLocFormat ? 4 : 2), family, 'loca');
    const numberOfHMetrics = readUint16(view, hhea.offset + 34);
    if (!numGlyphs || !numberOfHMetrics || numberOfHMetrics > numGlyphs) {
        throw new Error(`AG Grid: PDF font "${family}" has invalid horizontal metrics.`);
    }
    ensureTableRange(data, hmtx, numberOfHMetrics * 4 + Math.max(numGlyphs - numberOfHMetrics, 0) * 2, family, 'hmtx');

    const canSubset = validateEmbeddingRights(view, os2, family);

    const cmapLookup = createCmapLookup(data, view, cmap, family);
    const advanceWidths = readAdvanceWidths(view, hmtx.offset, numGlyphs, numberOfHMetrics);
    const ascent = readInt16(view, hhea.offset + 4);
    const descent = readInt16(view, hhea.offset + 6);
    const bbox: [number, number, number, number] = [
        readInt16(view, head.offset + 36),
        readInt16(view, head.offset + 38),
        readInt16(view, head.offset + 40),
        readInt16(view, head.offset + 42),
    ];
    const weight = os2 && os2.length >= 8 ? readUint16(view, os2.offset + 4) : normaliseFontWeight(face.weight);
    const capHeight =
        os2 && os2.length >= 90 && readUint16(view, os2.offset) >= 2 ? readInt16(view, os2.offset + 88) : ascent;
    const italicAngle = post && post.length >= 8 ? readFixed(view, post.offset + 4) : 0;
    const postScriptName = sanitisePdfName(readPostScriptName(data, view, name) || family);
    const glyphByCodePoint = new Map<number, number>();

    return {
        data,
        postScriptName,
        unitsPerEm,
        ascent,
        descent,
        capHeight,
        bbox,
        italicAngle,
        weight,
        style: face.style ?? (italicAngle ? 'italic' : 'normal'),
        canSubset,
        getTable: (tag: string) => {
            const table = tables.get(tag);
            return table ? data.subarray(table.offset, table.offset + table.length) : undefined;
        },
        getGlyphId: (codePoint: number) => {
            const cachedGlyphId = glyphByCodePoint.get(codePoint);
            if (cachedGlyphId != null) {
                return cachedGlyphId;
            }
            const glyphId = cmapLookup(codePoint);
            const resolvedGlyphId = glyphId >= 0 && glyphId < numGlyphs ? glyphId : 0;
            glyphByCodePoint.set(codePoint, resolvedGlyphId);
            return resolvedGlyphId;
        },
        getAdvanceWidth: (glyphId: number) => advanceWidths[glyphId] ?? advanceWidths[0] ?? unitsPerEm,
        createSubset: (glyphIds: Iterable<number>) =>
            canSubset
                ? createTrueTypeSubset(data, view, tables, loca, glyf, numGlyphs, indexToLocFormat, glyphIds, family)
                : data,
    };
}

function createTrueTypeSubset(
    data: Uint8Array,
    view: DataView,
    tables: Map<string, TableRecord>,
    loca: TableRecord,
    glyf: TableRecord,
    glyphCount: number,
    indexToLocFormat: number,
    requestedGlyphIds: Iterable<number>,
    family: string
): Uint8Array {
    const glyphOffsets = readGlyphOffsets(view, loca.offset, glyphCount, indexToLocFormat);
    validateGlyphOffsets(glyphOffsets, glyf.length, family);
    const includedGlyphs = resolveCompositeGlyphs(view, glyf, glyphOffsets, glyphCount, requestedGlyphIds, family);
    const subsetTables = new Map<string, Uint8Array>();

    for (const [tag, table] of tables) {
        if (EMBEDDED_TRUE_TYPE_TABLES.has(tag)) {
            subsetTables.set(tag, data.slice(table.offset, table.offset + table.length));
        }
    }

    const subsetGlyphData: number[] = [];
    const subsetGlyphOffsets: number[] = [];
    for (let glyphId = 0; glyphId < glyphCount; glyphId++) {
        subsetGlyphOffsets.push(subsetGlyphData.length);
        if (!includedGlyphs.has(glyphId)) {
            continue;
        }
        const start = glyphOffsets[glyphId];
        const end = glyphOffsets[glyphId + 1];
        for (let offset = start; offset < end; offset++) {
            subsetGlyphData.push(data[glyf.offset + offset]);
        }
        if (indexToLocFormat === 0 && subsetGlyphData.length % 2) {
            subsetGlyphData.push(0);
        }
    }
    subsetGlyphOffsets.push(subsetGlyphData.length);

    subsetTables.set('glyf', new Uint8Array(subsetGlyphData));
    subsetTables.set('loca', createLocaTable(subsetGlyphOffsets, indexToLocFormat));

    const subsetHead = subsetTables.get('head')!;
    writeUint32(new DataView(subsetHead.buffer, subsetHead.byteOffset, subsetHead.byteLength), 8, 0);
    const subset = buildSfnt(subsetTables);
    const subsetView = new DataView(subset.buffer, subset.byteOffset, subset.byteLength);
    const subsetHeadOffset = findTableOffset(subset, subsetView, 'head');
    writeUint32(subsetView, subsetHeadOffset + 8, (0xb1b0afba - calculateChecksum(subset)) >>> 0);
    return subset;
}

function readGlyphOffsets(view: DataView, locaOffset: number, glyphCount: number, indexToLocFormat: number): number[] {
    const offsets: number[] = [];
    for (let glyphId = 0; glyphId <= glyphCount; glyphId++) {
        offsets.push(
            indexToLocFormat === 0
                ? readUint16(view, locaOffset + glyphId * 2) * 2
                : readUint32(view, locaOffset + glyphId * 4)
        );
    }
    return offsets;
}

function validateGlyphOffsets(glyphOffsets: number[], glyfLength: number, family: string): void {
    let previousOffset = glyphOffsets[0];
    if (previousOffset !== 0) {
        throw new Error(`AG Grid: PDF font "${family}" contains invalid glyph offsets.`);
    }

    for (let glyphId = 0; glyphId < glyphOffsets.length; glyphId++) {
        const offset = glyphOffsets[glyphId];
        if (offset < previousOffset || offset > glyfLength) {
            throw new Error(`AG Grid: PDF font "${family}" contains invalid glyph offsets.`);
        }
        previousOffset = offset;
    }
}

function resolveCompositeGlyphs(
    view: DataView,
    glyf: TableRecord,
    glyphOffsets: number[],
    glyphCount: number,
    requestedGlyphIds: Iterable<number>,
    family: string
): Set<number> {
    const included = new Set<number>([0]);
    const pending: number[] = [];
    for (const glyphId of requestedGlyphIds) {
        if (Number.isInteger(glyphId) && glyphId >= 0 && glyphId < glyphCount && !included.has(glyphId)) {
            included.add(glyphId);
            pending.push(glyphId);
        }
    }

    while (pending.length) {
        const glyphId = pending.pop()!;
        const start = glyphOffsets[glyphId];
        const end = glyphOffsets[glyphId + 1];
        if (start === end) {
            continue;
        }
        let offset = glyf.offset + start;
        const glyphEnd = glyf.offset + end;
        if (offset + 10 > glyphEnd || readInt16(view, offset) >= 0) {
            continue;
        }

        offset += 10;
        let hasMoreComponents = true;
        while (hasMoreComponents) {
            if (offset + 4 > glyphEnd) {
                throw new Error(`AG Grid: PDF font "${family}" contains a truncated composite glyph.`);
            }
            const flags = readUint16(view, offset);
            const componentGlyphId = readUint16(view, offset + 2);
            if (componentGlyphId >= glyphCount) {
                throw new Error(`AG Grid: PDF font "${family}" contains an invalid composite glyph reference.`);
            }
            if (!included.has(componentGlyphId)) {
                included.add(componentGlyphId);
                pending.push(componentGlyphId);
            }

            offset += 4;
            offset += (flags & 0x0001) !== 0 ? 4 : 2;
            if ((flags & 0x0008) !== 0) {
                offset += 2;
            } else if ((flags & 0x0040) !== 0) {
                offset += 4;
            } else if ((flags & 0x0080) !== 0) {
                offset += 8;
            }
            hasMoreComponents = (flags & 0x0020) !== 0;
        }
    }
    return included;
}

function createLocaTable(offsets: number[], indexToLocFormat: number): Uint8Array {
    const bytesPerOffset = indexToLocFormat === 0 ? 2 : 4;
    const data = new Uint8Array(offsets.length * bytesPerOffset);
    const view = new DataView(data.buffer);
    for (let index = 0; index < offsets.length; index++) {
        if (indexToLocFormat === 0) {
            view.setUint16(index * 2, offsets[index] / 2, false);
        } else {
            view.setUint32(index * 4, offsets[index], false);
        }
    }
    return data;
}

function buildSfnt(tables: Map<string, Uint8Array>): Uint8Array {
    const entries = Array.from(tables.entries()).sort(([left], [right]) => left.localeCompare(right));
    const tableCount = entries.length;
    const greatestPowerOfTwo = 2 ** Math.floor(Math.log2(tableCount));
    const searchRange = greatestPowerOfTwo * 16;
    const entrySelector = Math.log2(greatestPowerOfTwo);
    const rangeShift = tableCount * 16 - searchRange;
    let dataLength = 12 + tableCount * 16;

    for (const [, table] of entries) {
        dataLength += alignToFourBytes(table.length);
    }

    const result = new Uint8Array(dataLength);
    const view = new DataView(result.buffer);
    writeUint32(view, 0, 0x00010000);
    view.setUint16(4, tableCount, false);
    view.setUint16(6, searchRange, false);
    view.setUint16(8, entrySelector, false);
    view.setUint16(10, rangeShift, false);

    let tableDataOffset = 12 + tableCount * 16;
    for (let index = 0; index < entries.length; index++) {
        const [tag, table] = entries[index];
        const recordOffset = 12 + index * 16;
        writeTag(result, recordOffset, tag);
        writeUint32(view, recordOffset + 4, calculateChecksum(table));
        writeUint32(view, recordOffset + 8, tableDataOffset);
        writeUint32(view, recordOffset + 12, table.length);
        result.set(table, tableDataOffset);
        tableDataOffset += alignToFourBytes(table.length);
    }
    return result;
}

function findTableOffset(data: Uint8Array, view: DataView, targetTag: string): number {
    const tableCount = readUint16(view, 4);
    for (let index = 0; index < tableCount; index++) {
        const recordOffset = 12 + index * 16;
        if (readTag(data, recordOffset) === targetTag) {
            return readUint32(view, recordOffset + 8);
        }
    }
    return 0;
}

function calculateChecksum(data: Uint8Array): number {
    let checksum = 0;
    for (let offset = 0; offset < data.length; offset += 4) {
        const value =
            ((data[offset] ?? 0) << 24) |
            ((data[offset + 1] ?? 0) << 16) |
            ((data[offset + 2] ?? 0) << 8) |
            (data[offset + 3] ?? 0);
        checksum = (checksum + (value >>> 0)) >>> 0;
    }
    return checksum;
}

function alignToFourBytes(value: number): number {
    return (value + 3) & ~3;
}

function writeTag(data: Uint8Array, offset: number, tag: string): void {
    for (let index = 0; index < 4; index++) {
        data[offset + index] = tag.charCodeAt(index);
    }
}

function writeUint32(view: DataView, offset: number, value: number): void {
    view.setUint32(offset, value >>> 0, false);
}

function toUint8Array(data: ArrayBuffer | Uint8Array): Uint8Array {
    return data instanceof Uint8Array
        ? new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
        : new Uint8Array(data);
}

function readTableDirectory(data: Uint8Array, view: DataView, family: string): Map<string, TableRecord> {
    const tableCount = readUint16(view, 4);
    ensureRange(data, 12, tableCount * 16, family);
    const tables = new Map<string, TableRecord>();

    for (let index = 0; index < tableCount; index++) {
        const recordOffset = 12 + index * 16;
        const tag = readTag(data, recordOffset);
        const offset = readUint32(view, recordOffset + 8);
        const length = readUint32(view, recordOffset + 12);
        ensureRange(data, offset, length, family);
        tables.set(tag, { offset, length });
    }

    return tables;
}

function getRequiredTable(tables: Map<string, TableRecord>, tag: string, family: string): TableRecord {
    const table = tables.get(tag);
    if (!table) {
        throw new Error(`AG Grid: PDF font "${family}" is missing the required ${tag} table.`);
    }
    return table;
}

function createCmapLookup(data: Uint8Array, view: DataView, table: TableRecord, family: string): CmapLookup {
    ensureTableRange(data, table, 4, family, 'cmap');
    const subtableCount = readUint16(view, table.offset + 2);
    ensureTableRange(data, table, 4 + subtableCount * 8, family, 'cmap');
    let format12Offset: number | undefined;
    let format4Offset: number | undefined;

    for (let index = 0; index < subtableCount; index++) {
        const recordOffset = table.offset + 4 + index * 8;
        const platformId = readUint16(view, recordOffset);
        const encodingId = readUint16(view, recordOffset + 2);
        const subtableOffset = table.offset + readUint32(view, recordOffset + 4);
        ensureRange(data, subtableOffset, 2, family);
        const format = readUint16(view, subtableOffset);
        const isUnicode = platformId === 0 || (platformId === 3 && (encodingId === 1 || encodingId === 10));

        if (isUnicode && format === 12 && format12Offset == null) {
            format12Offset = subtableOffset;
        } else if (isUnicode && format === 4 && format4Offset == null) {
            format4Offset = subtableOffset;
        }
    }

    if (format12Offset != null) {
        return createFormat12Lookup(data, view, format12Offset, family);
    }
    if (format4Offset != null) {
        return createFormat4Lookup(data, view, format4Offset, family);
    }
    throw new Error(`AG Grid: PDF font "${family}" does not contain a supported Unicode cmap.`);
}

function createFormat12Lookup(data: Uint8Array, view: DataView, offset: number, family: string): CmapLookup {
    ensureRange(data, offset, 16, family);
    const length = readUint32(view, offset + 4);
    const groupCount = readUint32(view, offset + 12);
    ensureRange(data, offset, length, family);
    ensureRange(data, offset + 16, groupCount * 12, family);

    return (codePoint: number) => {
        let low = 0;
        let high = groupCount - 1;
        while (low <= high) {
            const middle = (low + high) >>> 1;
            const groupOffset = offset + 16 + middle * 12;
            const start = readUint32(view, groupOffset);
            const end = readUint32(view, groupOffset + 4);
            if (codePoint < start) {
                high = middle - 1;
            } else if (codePoint > end) {
                low = middle + 1;
            } else {
                return readUint32(view, groupOffset + 8) + codePoint - start;
            }
        }
        return 0;
    };
}

function createFormat4Lookup(data: Uint8Array, view: DataView, offset: number, family: string): CmapLookup {
    ensureRange(data, offset, 14, family);
    const length = readUint16(view, offset + 2);
    ensureRange(data, offset, length, family);
    const segmentCount = readUint16(view, offset + 6) / 2;
    const endCodeOffset = offset + 14;
    const startCodeOffset = endCodeOffset + segmentCount * 2 + 2;
    const idDeltaOffset = startCodeOffset + segmentCount * 2;
    const idRangeOffsetOffset = idDeltaOffset + segmentCount * 2;

    return (codePoint: number) => {
        if (codePoint > 0xffff) {
            return 0;
        }
        for (let index = 0; index < segmentCount; index++) {
            const end = readUint16(view, endCodeOffset + index * 2);
            if (codePoint > end) {
                continue;
            }
            const start = readUint16(view, startCodeOffset + index * 2);
            if (codePoint < start) {
                return 0;
            }
            const delta = readInt16(view, idDeltaOffset + index * 2);
            const rangeOffsetAddress = idRangeOffsetOffset + index * 2;
            const rangeOffset = readUint16(view, rangeOffsetAddress);
            if (!rangeOffset) {
                return (codePoint + delta) & 0xffff;
            }
            const glyphAddress = rangeOffsetAddress + rangeOffset + (codePoint - start) * 2;
            if (glyphAddress + 2 > offset + length) {
                return 0;
            }
            const glyphId = readUint16(view, glyphAddress);
            return glyphId ? (glyphId + delta) & 0xffff : 0;
        }
        return 0;
    };
}

function readAdvanceWidths(view: DataView, offset: number, glyphCount: number, numberOfHMetrics: number): number[] {
    const widths: number[] = [];
    let lastWidth = 0;
    for (let glyphId = 0; glyphId < glyphCount; glyphId++) {
        if (glyphId < numberOfHMetrics) {
            lastWidth = readUint16(view, offset + glyphId * 4);
        }
        widths.push(lastWidth);
    }
    return widths;
}

function validateEmbeddingRights(view: DataView, os2: TableRecord | undefined, family: string): boolean {
    if (!os2 || os2.length < 10) {
        return true;
    }
    const fsType = readUint16(view, os2.offset + 8);
    if ((fsType & 0x0002) !== 0) {
        throw new Error(`AG Grid: PDF font "${family}" does not permit embedding.`);
    }
    if ((fsType & 0x0200) !== 0) {
        throw new Error(`AG Grid: PDF font "${family}" only permits bitmap embedding.`);
    }
    return (fsType & 0x0100) === 0;
}

function readPostScriptName(data: Uint8Array, view: DataView, table?: TableRecord): string | undefined {
    if (!table || table.length < 6) {
        return undefined;
    }
    const recordCount = readUint16(view, table.offset + 2);
    const storageOffset = table.offset + readUint16(view, table.offset + 4);
    if (table.offset + 6 + recordCount * 12 > table.offset + table.length) {
        return undefined;
    }

    let fallback: string | undefined;
    for (let index = 0; index < recordCount; index++) {
        const recordOffset = table.offset + 6 + index * 12;
        const platformId = readUint16(view, recordOffset);
        const nameId = readUint16(view, recordOffset + 6);
        if (nameId !== 6) {
            continue;
        }
        const length = readUint16(view, recordOffset + 8);
        const offset = storageOffset + readUint16(view, recordOffset + 10);
        if (offset < table.offset || offset + length > table.offset + table.length) {
            continue;
        }
        const value =
            platformId === 0 || platformId === 3
                ? decodeUtf16Be(data, offset, length)
                : decodeLatin1(data, offset, length);
        if (platformId === 3) {
            return value;
        }
        fallback ??= value;
    }
    return fallback;
}

function decodeUtf16Be(data: Uint8Array, offset: number, length: number): string {
    let value = '';
    const end = offset + length - (length % 2);
    for (let index = offset; index < end; index += 2) {
        value += String.fromCharCode((data[index] << 8) | data[index + 1]);
    }
    return value;
}

function decodeLatin1(data: Uint8Array, offset: number, length: number): string {
    let value = '';
    for (let index = offset, end = offset + length; index < end; index++) {
        value += String.fromCharCode(data[index]);
    }
    return value;
}

function sanitisePdfName(value: string): string {
    const sanitised = value.replace(/[^A-Za-z0-9_.+-]/g, '');
    return sanitised || 'CustomFont';
}

function normaliseFontWeight(weight: PdfFontFace['weight']): number {
    if (weight === 'bold') {
        return 700;
    }
    if (weight === 'normal' || weight == null) {
        return 400;
    }
    return weight;
}

function ensureTableRange(
    data: Uint8Array,
    table: TableRecord,
    requiredLength: number,
    family: string,
    tag: string
): void {
    if (requiredLength > table.length) {
        throw new Error(`AG Grid: PDF font "${family}" has a truncated ${tag} table.`);
    }
    ensureRange(data, table.offset, requiredLength, family);
}

function ensureRange(data: Uint8Array, offset: number, length: number, family: string): void {
    if (
        !Number.isSafeInteger(offset) ||
        !Number.isSafeInteger(length) ||
        offset < 0 ||
        length < 0 ||
        offset + length > data.length
    ) {
        throw new Error(`AG Grid: PDF font "${family}" contains invalid table offsets.`);
    }
}

function readTag(data: Uint8Array, offset: number): string {
    return String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
}

function readUint16(view: DataView, offset: number): number {
    return view.getUint16(offset, false);
}

function readInt16(view: DataView, offset: number): number {
    return view.getInt16(offset, false);
}

function readUint32(view: DataView, offset: number): number {
    return view.getUint32(offset, false);
}

function readFixed(view: DataView, offset: number): number {
    return view.getInt32(offset, false) / 65536;
}
