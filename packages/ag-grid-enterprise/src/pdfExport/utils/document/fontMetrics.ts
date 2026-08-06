import type { PdfBuiltInFontFamily, PdfFontFamily } from 'ag-grid-community';

const FIRST_PRINTABLE_ASCII = 32;
const LAST_PRINTABLE_ASCII = 126;
const DEFAULT_GLYPH_WIDTH = 500;
const COURIER_GLYPH_WIDTH = 600;

const FONT_VERTICAL_METRICS: Record<PdfBuiltInFontFamily, { ascent: number; descent: number }> = {
    Helvetica: { ascent: 718, descent: 207 },
    'Helvetica-Bold': { ascent: 718, descent: 207 },
    'Times-Roman': { ascent: 683, descent: 217 },
    'Times-Bold': { ascent: 683, descent: 217 },
    Courier: { ascent: 629, descent: 157 },
    'Courier-Bold': { ascent: 629, descent: 157 },
};

// widths are the Base-14 AFM advance widths for printable ASCII glyphs, in 1/1000 em units.
const HELVETICA_WIDTHS = [
    278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556,
    556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833,
    722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556,
    556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334,
    260, 334, 584,
];

const HELVETICA_BOLD_WIDTHS = [
    278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556,
    556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833,
    722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611,
    556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389,
    280, 389, 584,
];

const TIMES_ROMAN_WIDTHS = [
    250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500,
    500, 500, 500, 278, 278, 564, 564, 564, 444, 921, 722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611, 889,
    722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333, 278, 333, 469, 500, 333, 444, 500, 444, 500,
    444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 480,
    200, 480, 541,
];

const TIMES_BOLD_WIDTHS = [
    250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500,
    500, 500, 500, 333, 333, 570, 570, 570, 500, 930, 722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667, 944,
    722, 778, 611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667, 333, 278, 333, 581, 500, 333, 500, 556, 444, 556,
    444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500, 556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 394,
    220, 394, 520,
];

// AFM advance widths for the WinAnsi 0x80–0x9f typographic glyphs, in 1/1000 em units.
// Column order: Helvetica, Helvetica-Bold, Times-Roman, Times-Bold.
const EXTENDED_GLYPH_WIDTHS = new Map<number, [number, number, number, number]>([
    [0x20ac, [556, 556, 500, 500]], // €
    [0x201a, [222, 278, 333, 333]], // ‚
    [0x0192, [556, 556, 500, 500]], // ƒ
    [0x201e, [333, 500, 444, 500]], // „
    [0x2026, [1000, 1000, 1000, 1000]], // …
    [0x2020, [556, 556, 500, 500]], // †
    [0x2021, [556, 556, 500, 500]], // ‡
    [0x02c6, [333, 333, 333, 333]], // ˆ
    [0x2030, [1000, 1000, 1000, 1000]], // ‰
    [0x0160, [667, 667, 556, 556]], // Š
    [0x2039, [333, 333, 333, 333]], // ‹
    [0x0152, [1000, 1000, 889, 1000]], // Œ
    [0x017d, [611, 611, 611, 667]], // Ž
    [0x2018, [222, 278, 333, 333]], // ‘
    [0x2019, [222, 278, 333, 333]], // ’
    [0x201c, [333, 500, 444, 500]], // “
    [0x201d, [333, 500, 444, 500]], // ”
    [0x2022, [350, 350, 350, 350]], // •
    [0x2013, [556, 556, 500, 500]], // –
    [0x2014, [1000, 1000, 1000, 1000]], // —
    [0x02dc, [333, 333, 333, 333]], // ˜
    [0x2122, [1000, 1000, 980, 1000]], // ™
    [0x0161, [500, 556, 389, 389]], // š
    [0x203a, [333, 333, 333, 333]], // ›
    [0x0153, [944, 944, 722, 722]], // œ
    [0x017e, [500, 500, 444, 444]], // ž
    [0x0178, [667, 667, 722, 722]], // Ÿ
]);

const EXTENDED_WIDTH_FAMILY_INDEX: Record<PdfBuiltInFontFamily, 0 | 1 | 2 | 3> = {
    Helvetica: 0,
    'Helvetica-Bold': 1,
    'Times-Roman': 2,
    'Times-Bold': 3,
    Courier: 0,
    'Courier-Bold': 0,
};

const SPECIAL_GLYPH_BASES = new Map<string, string>([
    ['Æ', 'W'],
    ['æ', 'm'],
    ['Ð', 'D'],
    ['ð', 'o'],
    ['Ø', 'O'],
    ['ø', 'o'],
    ['Þ', 'P'],
    ['þ', 'p'],
    ['ß', 'b'],
    ['Œ', 'W'],
    ['œ', 'w'],
]);

/**
 * Resolve a Base-14 glyph advance width in 1/1000 em units.
 * @param char - Character to measure.
 * @param fontFamily - Active Base-14 font family.
 * @returns Glyph advance width.
 */
export function getBase14GlyphWidth(char: string, fontFamily: PdfFontFamily): number {
    const resolvedFamily = resolveBase14FontFamily(fontFamily);
    if (resolvedFamily === 'Courier' || resolvedFamily === 'Courier-Bold') {
        return COURIER_GLYPH_WIDTH;
    }

    const metrics = getFontWidths(resolvedFamily);
    const codePoint = char.codePointAt(0) ?? 0;
    if (codePoint >= FIRST_PRINTABLE_ASCII && codePoint <= LAST_PRINTABLE_ASCII) {
        return metrics[codePoint - FIRST_PRINTABLE_ASCII] ?? DEFAULT_GLYPH_WIDTH;
    }

    const extendedWidths = EXTENDED_GLYPH_WIDTHS.get(codePoint);
    if (extendedWidths) {
        return extendedWidths[EXTENDED_WIDTH_FAMILY_INDEX[resolvedFamily]];
    }

    const baseCodePoint = resolveBaseCharacter(char).codePointAt(0) ?? 0;
    if (baseCodePoint >= FIRST_PRINTABLE_ASCII && baseCodePoint <= LAST_PRINTABLE_ASCII) {
        return metrics[baseCodePoint - FIRST_PRINTABLE_ASCII] ?? DEFAULT_GLYPH_WIDTH;
    }

    return DEFAULT_GLYPH_WIDTH;
}

/**
 * Calculate the distance from the top of a line box to its text baseline.
 * @param fontSize - Font size and line-box height in points.
 * @param fontFamily - Active Base-14 font family.
 * @returns Baseline offset in points.
 */
export function getBase14BaselineOffset(fontSize: number, fontFamily: PdfFontFamily): number {
    const metrics = FONT_VERTICAL_METRICS[resolveBase14FontFamily(fontFamily)];
    return (metrics.ascent / (metrics.ascent + metrics.descent)) * fontSize;
}

function getFontWidths(fontFamily: PdfBuiltInFontFamily): number[] {
    switch (fontFamily) {
        case 'Helvetica-Bold':
            return HELVETICA_BOLD_WIDTHS;
        case 'Times-Roman':
            return TIMES_ROMAN_WIDTHS;
        case 'Times-Bold':
            return TIMES_BOLD_WIDTHS;
        default:
            return HELVETICA_WIDTHS;
    }
}

function resolveBase14FontFamily(fontFamily: PdfFontFamily): PdfBuiltInFontFamily {
    return Object.prototype.hasOwnProperty.call(FONT_VERTICAL_METRICS, fontFamily)
        ? (fontFamily as PdfBuiltInFontFamily)
        : 'Helvetica';
}

function resolveBaseCharacter(char: string): string {
    const specialBase = SPECIAL_GLYPH_BASES.get(char);
    if (specialBase) {
        return specialBase;
    }

    const decomposed = char.normalize('NFD');
    return decomposed[0] ?? '?';
}
