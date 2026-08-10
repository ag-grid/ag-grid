export type PdfGlyphDirection = 'ltr' | 'rtl';

/**
 * One positioned glyph in a shaped PDF text run.
 */
export interface PdfShapedGlyph {
    /** Font glyph id. */
    glyphId: number;
    /** UTF-16 source index represented by this glyph. */
    cluster: number;
    /** Logical Unicode text represented by this glyph. */
    unicode: string;
    /** Horizontal advance in font units. */
    xAdvance: number;
    /** Vertical advance in font units. */
    yAdvance: number;
    /** Horizontal placement adjustment in font units. */
    xOffset: number;
    /** Vertical placement adjustment in font units. */
    yOffset: number;
}

/**
 * A visual-order sequence of positioned glyphs sharing one font and direction.
 */
export interface PdfGlyphRun {
    direction: PdfGlyphDirection;
    glyphs: PdfShapedGlyph[];
}

/**
 * Return a stable key for one PDF character-code mapping.
 * A glyph can legitimately need more than one CID when it represents different
 * Unicode source sequences in different shaping contexts.
 */
export function getGlyphMappingKey(glyphId: number, unicode: string): string {
    return `${glyphId}:${unicode}`;
}
