import { PdfFontFamilyNotRegisteredError, PdfFontRegistry } from './fontRegistry';
import { buildPdf } from './pdfObjectStore';
import { parseTrueTypeFont } from './ttf';

describe('PDF TrueType fonts', () => {
    it('parses character maps and horizontal metrics', () => {
        const font = parseTrueTypeFont({ data: createTestFont() }, 'Test Sans');

        expect(font.unitsPerEm).toBe(1000);
        expect(font.getGlyphId('A'.codePointAt(0)!)).toBe(1);
        expect(font.getAdvanceWidth(1)).toBe(500);
    });

    it('embeds a subset as a Type 0 PDF font', () => {
        const registry = new PdfFontRegistry([
            {
                family: 'Test Sans',
                faces: [{ data: createTestFont(), weight: 400 }],
            },
        ]);
        const font = registry.resolve('Test Sans', 400, 'normal');
        const encoded = registry.encodeText('A', font);
        const pdf = buildPdf(
            [
                {
                    content: `BT /${font.key} 10 Tf 1 0 0 1 10 10 Tm ${encoded.operatorValue} Tj ET`,
                    annotations: [],
                },
            ],
            { width: 100, height: 100 },
            registry.getUsedFonts()
        );

        expect(encoded.operatorValue).toBe('<0001>');
        expect(pdf).toContain('/Subtype /Type0');
        expect(pdf).toContain('/FontFile2');
        expect(pdf).toContain('/BaseFont /AGGRID+TestSans');
        expect(pdf).toContain('<0001> <0041>');
        expect(pdf).toContain('/CIDToGIDMap');
        expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
    });

    it('writes the document language into the PDF catalogue', () => {
        const pdf = buildPdf([{ content: '', annotations: [] }], { width: 100, height: 100 }, [], undefined, 'ar');

        expect(pdf).toContain('/Lang (ar)');
    });

    it('selects the nearest registered weight', () => {
        const regular = createTestFont();
        const bold = createTestFont();
        const registry = new PdfFontRegistry([
            {
                family: 'Test Sans',
                faces: [
                    { data: regular, weight: 400 },
                    { data: bold, weight: 700 },
                ],
            },
        ]);

        expect(registry.resolve('Test Sans', 500, 'normal').weight).toBe(400);
        expect(registry.resolve('Test Sans', 600, 'normal').weight).toBe(700);
    });

    it('rejects font families that are neither registered nor built in', () => {
        const registry = new PdfFontRegistry([
            {
                family: 'Noto Sans Arabic',
                faces: [{ data: createTestFont() }],
            },
        ]);

        expect(() => registry.resolve('Noto Sans Arabik', 400, 'normal')).toThrow(
            new PdfFontFamilyNotRegisteredError('Noto Sans Arabik', [
                'Noto Sans Arabic',
                'Helvetica',
                'Helvetica-Bold',
                'Times-Roman',
                'Times-Bold',
                'Courier',
                'Courier-Bold',
            ])
        );
    });

    it('uses embedded font ascent and descent for automatic line height', () => {
        const registry = new PdfFontRegistry([
            {
                family: 'Tall Sans',
                faces: [{ data: createTestFont(1060, -440) }],
            },
        ]);
        const font = registry.resolve('Tall Sans', 400, 'normal');

        expect(registry.getNaturalLineHeight(10, font)).toBe(15);
    });

    it('assigns different CIDs when one glyph represents different Unicode text', () => {
        const registry = new PdfFontRegistry([
            {
                family: 'Test Sans',
                faces: [{ data: createTestFont() }],
            },
        ]);
        const font = registry.resolve('Test Sans', 400, 'normal');

        expect(registry.encodeText('\u0100', font).operatorValue).toBe('<0001>');
        expect(registry.encodeText('\u0102', font).operatorValue).toBe('<0002>');
        expect(font.mappingByCid).toEqual(
            new Map([
                [1, { glyphId: 0, unicode: '\u0100' }],
                [2, { glyphId: 0, unicode: '\u0102' }],
            ])
        );
    });

    it('uses a built-in font for printable ASCII omitted by an embedded font', () => {
        const registry = new PdfFontRegistry([
            {
                family: 'Test Sans',
                faces: [{ data: createTestFont() }],
            },
        ]);
        const font = registry.resolve('Test Sans', 400, 'normal');

        expect(registry.measureText('A/A', 10, font, 'rtl', 'ar')).toBeCloseTo(12.78);
        const encoded = registry.encodeText('A/A', font, 'rtl', 'ar');

        expect(encoded.visualText).toBe('A/A');
        expect(encoded.positionedGlyphs).toEqual([
            expect.objectContaining({ fontKey: font.key, operatorValue: '<0001>' }),
            expect.objectContaining({ fontKey: 'F2', operatorValue: '(/)', xAdvance: 0.278 }),
            expect.objectContaining({ fontKey: font.key, operatorValue: '<0001>' }),
        ]);
        expect(registry.getUsedFonts().map((usedFont) => usedFont.family)).toEqual(['Test Sans', 'Helvetica']);
    });

    it('preserves decomposed logical text when the glyph run is normalised', () => {
        const registry = new PdfFontRegistry([
            {
                family: 'Test Sans',
                faces: [{ data: createTestFont() }],
            },
        ]);
        const font = registry.resolve('Test Sans', 400, 'normal');
        const encoded = registry.encodeText('A\u0301', font, 'ltr', 'en');

        expect(encoded.logicalText).toBe('A\u0301');
        expect(encoded.glyphRun?.glyphs).toEqual([expect.objectContaining({ unicode: 'Á' })]);
    });

    it('rejects an out-of-bounds glyph zero location before copying glyph data', () => {
        const data = createTestFont();
        const locaOffset = getTableOffset(data, 'loca');
        const view = new DataView(data.buffer);
        view.setUint16(locaOffset + 2, 0xffff, false);
        view.setUint16(locaOffset + 4, 0xffff, false);
        const font = parseTrueTypeFont({ data }, 'Corrupt Sans');

        expect(() => font.createSubset([])).toThrow('AG Grid: PDF font "Corrupt Sans" contains invalid glyph offsets.');
    });
});

function createTestFont(ascent = 800, descent = -200): Uint8Array {
    const tables = new Map<string, Uint8Array>([
        ['cmap', createCmapTable()],
        ['glyf', new Uint8Array(10)],
        ['head', createHeadTable()],
        ['hhea', createHheaTable(ascent, descent)],
        ['hmtx', createHmtxTable()],
        ['loca', createLocaTable()],
        ['maxp', createMaxpTable()],
    ]);
    const tableCount = tables.size;
    let length = 12 + tableCount * 16;
    for (const table of tables.values()) {
        length += alignToFourBytes(table.length);
    }

    const result = new Uint8Array(length);
    const view = new DataView(result.buffer);
    view.setUint32(0, 0x00010000, false);
    view.setUint16(4, tableCount, false);
    let tableOffset = 12 + tableCount * 16;
    let tableIndex = 0;
    for (const [tag, table] of tables) {
        const recordOffset = 12 + tableIndex * 16;
        writeTag(result, recordOffset, tag);
        view.setUint32(recordOffset + 8, tableOffset, false);
        view.setUint32(recordOffset + 12, table.length, false);
        result.set(table, tableOffset);
        tableOffset += alignToFourBytes(table.length);
        tableIndex += 1;
    }
    return result;
}

function createHeadTable(): Uint8Array {
    const data = new Uint8Array(54);
    const view = new DataView(data.buffer);
    view.setUint16(18, 1000, false);
    view.setInt16(36, 0, false);
    view.setInt16(38, -200, false);
    view.setInt16(40, 1000, false);
    view.setInt16(42, 800, false);
    view.setInt16(50, 0, false);
    return data;
}

function createHheaTable(ascent: number, descent: number): Uint8Array {
    const data = new Uint8Array(36);
    const view = new DataView(data.buffer);
    view.setInt16(4, ascent, false);
    view.setInt16(6, descent, false);
    view.setUint16(34, 1, false);
    return data;
}

function createMaxpTable(): Uint8Array {
    const data = new Uint8Array(6);
    new DataView(data.buffer).setUint16(4, 2, false);
    return data;
}

function createHmtxTable(): Uint8Array {
    const data = new Uint8Array(6);
    const view = new DataView(data.buffer);
    view.setUint16(0, 500, false);
    return data;
}

function createLocaTable(): Uint8Array {
    const data = new Uint8Array(6);
    new DataView(data.buffer).setUint16(4, 5, false);
    return data;
}

function createCmapTable(): Uint8Array {
    const data = new Uint8Array(44);
    const view = new DataView(data.buffer);
    view.setUint16(2, 1, false);
    view.setUint16(4, 3, false);
    view.setUint16(6, 1, false);
    view.setUint32(8, 12, false);

    const offset = 12;
    view.setUint16(offset, 4, false);
    view.setUint16(offset + 2, 32, false);
    view.setUint16(offset + 6, 4, false);
    view.setUint16(offset + 8, 4, false);
    view.setUint16(offset + 10, 1, false);
    view.setUint16(offset + 14, 0x0041, false);
    view.setUint16(offset + 16, 0xffff, false);
    view.setUint16(offset + 20, 0x0041, false);
    view.setUint16(offset + 22, 0xffff, false);
    view.setInt16(offset + 24, 1 - 0x0041, false);
    view.setInt16(offset + 26, 1, false);
    return data;
}

function alignToFourBytes(value: number): number {
    return (value + 3) & ~3;
}

function getTableOffset(data: Uint8Array, targetTag: string): number {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    const tableCount = view.getUint16(4, false);
    for (let tableIndex = 0; tableIndex < tableCount; tableIndex++) {
        const recordOffset = 12 + tableIndex * 16;
        let tag = '';
        for (let index = 0; index < 4; index++) {
            tag += String.fromCharCode(data[recordOffset + index]);
        }
        if (tag === targetTag) {
            return view.getUint32(recordOffset + 8, false);
        }
    }
    throw new Error(`Missing test font table: ${targetTag}`);
}

function writeTag(data: Uint8Array, offset: number, tag: string): void {
    for (let index = 0; index < 4; index++) {
        data[offset + index] = tag.charCodeAt(index);
    }
}
