import type { TrueTypeFont } from '../ttf';
import { shapeTrueTypeText } from './shaping';

describe('OpenType PDF shaping', () => {
    it('applies standard ligatures while retaining the logical Unicode sequence', () => {
        const font = createShapingFont(createLigatureGsub());
        const run = shapeTrueTypeText('fi', font, 'ltr', 'en');

        expect(run).toEqual({
            direction: 'ltr',
            glyphs: [
                {
                    glyphId: 3,
                    cluster: 0,
                    unicode: 'fi',
                    xAdvance: 600,
                    yAdvance: 0,
                    xOffset: 0,
                    yOffset: 0,
                },
            ],
        });
    });

    it('uses mirrored glyphs for paired punctuation in right-to-left text', () => {
        const font = createShapingFont();
        const run = shapeTrueTypeText('(א)', font, 'rtl', 'he');

        expect(run.glyphs.map((glyph) => glyph.glyphId)).toEqual([1, 3, 2]);
    });

    it('shapes canonically equivalent decomposed text as NFC', () => {
        const font = createShapingFont();

        expect(shapeTrueTypeText('cafe\u0301', font, 'ltr', 'pt')).toEqual(
            shapeTrueTypeText('café', font, 'ltr', 'pt')
        );
    });

    it('ignores malformed optional GSUB lookups', () => {
        const malformedGsub = createLigatureGsub();
        new DataView(malformedGsub.buffer).setUint16(54, 0xfff0, false);

        expect(shapeTrueTypeText('fi', createShapingFont(malformedGsub), 'ltr', 'en').glyphs).toEqual([
            expect.objectContaining({ glyphId: 1, unicode: 'f' }),
            expect.objectContaining({ glyphId: 2, unicode: 'i' }),
        ]);
    });

    it('ignores malformed optional GPOS lookups', () => {
        const malformedGpos = createLigatureGsub();
        writeTag(malformedGpos, 32, 'kern');
        const view = new DataView(malformedGpos.buffer);
        view.setUint16(48, 2, false);
        view.setUint16(54, 0xfff0, false);

        expect(shapeTrueTypeText('fi', createShapingFont(undefined, malformedGpos), 'ltr', 'en').glyphs).toEqual([
            expect.objectContaining({ glyphId: 1, unicode: 'f', xOffset: 0, yOffset: 0 }),
            expect.objectContaining({ glyphId: 2, unicode: 'i', xOffset: 0, yOffset: 0 }),
        ]);
    });
});

function createShapingFont(gsub?: Uint8Array, gpos?: Uint8Array): TrueTypeFont {
    return {
        data: new Uint8Array(),
        postScriptName: 'Test',
        unitsPerEm: 1000,
        ascent: 800,
        descent: -200,
        capHeight: 700,
        bbox: [0, -200, 1000, 800],
        italicAngle: 0,
        weight: 400,
        style: 'normal',
        canSubset: true,
        getTable: (tag) => (tag === 'GSUB' ? gsub : tag === 'GPOS' ? gpos : undefined),
        getGlyphId: (codePoint) => {
            if (codePoint === 0x28 || codePoint === 0x66) {
                return 1;
            }
            if (codePoint === 0x29 || codePoint === 0x69) {
                return 2;
            }
            if (codePoint === 0x05d0) {
                return 3;
            }
            return codePoint === 0x00e9 ? 4 : 0;
        },
        getAdvanceWidth: (glyphId) => (glyphId === 3 ? 600 : 400),
        createSubset: () => new Uint8Array(),
    };
}

function createLigatureGsub(): Uint8Array {
    const data = new Uint8Array(80);
    const view = new DataView(data.buffer);
    view.setUint32(0, 0x00010000, false);
    view.setUint16(4, 10, false);
    view.setUint16(6, 30, false);
    view.setUint16(8, 44, false);

    view.setUint16(10, 1, false);
    writeTag(data, 12, 'latn');
    view.setUint16(16, 8, false);
    view.setUint16(18, 4, false);
    view.setUint16(20, 0, false);
    view.setUint16(22, 0, false);
    view.setUint16(24, 0xffff, false);
    view.setUint16(26, 1, false);
    view.setUint16(28, 0, false);

    view.setUint16(30, 1, false);
    writeTag(data, 32, 'liga');
    view.setUint16(36, 8, false);
    view.setUint16(38, 0, false);
    view.setUint16(40, 1, false);
    view.setUint16(42, 0, false);

    view.setUint16(44, 1, false);
    view.setUint16(46, 4, false);
    view.setUint16(48, 4, false);
    view.setUint16(50, 0, false);
    view.setUint16(52, 1, false);
    view.setUint16(54, 8, false);

    view.setUint16(56, 1, false);
    view.setUint16(58, 8, false);
    view.setUint16(60, 1, false);
    view.setUint16(62, 14, false);
    view.setUint16(64, 1, false);
    view.setUint16(66, 1, false);
    view.setUint16(68, 1, false);
    view.setUint16(70, 1, false);
    view.setUint16(72, 4, false);
    view.setUint16(74, 3, false);
    view.setUint16(76, 2, false);
    view.setUint16(78, 2, false);
    return data;
}

function writeTag(data: Uint8Array, offset: number, tag: string): void {
    for (let index = 0; index < 4; index++) {
        data[offset + index] = tag.charCodeAt(index);
    }
}
