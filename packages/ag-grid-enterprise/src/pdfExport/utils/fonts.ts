import type { PdfCellStyle, PdfFontFamily, PdfFontWeight } from 'ag-grid-community';

const DEFAULT_PDF_FONT_FAMILY: PdfFontFamily = 'Helvetica';
const PDF_FONT_FAMILIES = new Set<string>([
    'Helvetica',
    'Helvetica-Bold',
    'Times-Roman',
    'Times-Bold',
    'Courier',
    'Courier-Bold',
]);

/**
 * Resolve runtime font values to one of the built-in PDF font families.
 * @param fontFamily - Candidate font family.
 * @param fallback - Fallback font family.
 * @returns Supported PDF font family.
 */
export function normalisePdfFontFamily(
    fontFamily: PdfFontFamily | undefined,
    fallback: PdfFontFamily = DEFAULT_PDF_FONT_FAMILY
): PdfFontFamily {
    const fallbackFont = PDF_FONT_FAMILIES.has(fallback) ? fallback : DEFAULT_PDF_FONT_FAMILY;

    return fontFamily && PDF_FONT_FAMILIES.has(fontFamily) ? fontFamily : fallbackFont;
}

/**
 * Map CSS text alignment values to PDF alignment values.
 * @param value - CSS alignment token.
 * @returns Matching PDF alignment, or `undefined` when unsupported.
 */
export function resolveTextAlignment(value?: string): PdfCellStyle['alignment'] | undefined {
    if (!value) {
        return undefined;
    }

    if (value.startsWith('center')) {
        return 'center';
    }

    if (value.startsWith('right') || value.startsWith('end')) {
        return 'right';
    }

    if (value.startsWith('left') || value.startsWith('start')) {
        return 'left';
    }

    return undefined;
}

/**
 * Map a CSS font-family value to one of the built-in PDF fonts.
 * @param fontFamilyValue - CSS `font-family` value.
 * @returns Matching PDF font family, or `undefined` when no mapping exists.
 */
export function resolveFontFamily(fontFamilyValue?: string): PdfFontFamily | undefined {
    return mapFontFamily(fontFamilyValue);
}

/**
 * Resolve a CSS font-weight value to a supported PDF font weight.
 * @param fontWeightValue - CSS `font-weight` value.
 * @returns Matching PDF font weight, or `undefined` when no weight was supplied.
 */
export function resolveFontWeight(fontWeightValue?: string | number): PdfFontWeight | undefined {
    if (fontWeightValue == null) {
        return undefined;
    }

    if (typeof fontWeightValue === 'number') {
        return Number.isFinite(fontWeightValue) ? (fontWeightValue >= 600 ? 'bold' : 'normal') : undefined;
    }

    const normalised = String(fontWeightValue).trim().toLowerCase();
    if (normalised === 'bold' || normalised === 'bolder') {
        return 'bold';
    }
    if (normalised === 'normal' || normalised === 'lighter') {
        return 'normal';
    }
    if (!/^\d+(?:\.\d+)?$/.test(normalised)) {
        return undefined;
    }

    return Number.parseFloat(normalised) >= 600 ? 'bold' : 'normal';
}

/**
 * Resolve a font family and weight after style inheritance has been applied.
 * @param fontFamily - Optional style-specific font family.
 * @param fontWeight - Optional style-specific font weight.
 * @param fallback - Inherited font family.
 * @returns Resolved built-in PDF font family.
 */
export function resolvePdfFontFamily(
    fontFamily: PdfFontFamily | undefined,
    fontWeight: PdfFontWeight | undefined,
    fallback: PdfFontFamily = DEFAULT_PDF_FONT_FAMILY
): PdfFontFamily {
    const resolvedFamily = normalisePdfFontFamily(fontFamily, fallback);
    if (!fontWeight) {
        return resolvedFamily;
    }

    const useBold = fontWeight === 'bold';
    switch (resolvedFamily) {
        case 'Helvetica':
        case 'Helvetica-Bold':
            return useBold ? 'Helvetica-Bold' : 'Helvetica';
        case 'Times-Roman':
        case 'Times-Bold':
            return useBold ? 'Times-Bold' : 'Times-Roman';
        case 'Courier':
        case 'Courier-Bold':
            return useBold ? 'Courier-Bold' : 'Courier';
        default:
            return resolvedFamily;
    }
}

/**
 * Resolve the primary CSS font family token to a PDF base font.
 * @param fontFamilyValue - CSS `font-family` value.
 * @returns PDF base font family, or `undefined`.
 */
function mapFontFamily(fontFamilyValue?: string): PdfFontFamily | undefined {
    if (!fontFamilyValue) {
        return undefined;
    }

    const primaryFamily = fontFamilyValue
        .split(',')[0]
        .trim()
        .replace(/(^["'])|(["']$)/g, '')
        .toLowerCase();

    // map common browser families to the nearest PDF base-14 font.
    if (primaryFamily.includes('helvetica-bold')) {
        return 'Helvetica-Bold';
    }

    if (primaryFamily.includes('helvetica') || primaryFamily.includes('arial') || primaryFamily.includes('sans')) {
        return 'Helvetica';
    }

    if (primaryFamily.includes('times-bold')) {
        return 'Times-Bold';
    }

    if (primaryFamily.includes('times') || primaryFamily.includes('serif')) {
        return 'Times-Roman';
    }

    if (primaryFamily.includes('courier-bold')) {
        return 'Courier-Bold';
    }

    if (primaryFamily.includes('courier') || primaryFamily.includes('mono')) {
        return 'Courier';
    }

    return undefined;
}
