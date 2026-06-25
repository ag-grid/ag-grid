import type { PdfCellStyle, PdfFontFamily } from 'ag-grid-community';

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
 * Map CSS font family/weight values to one of the built-in PDF fonts.
 * @param fontFamilyValue - CSS `font-family` value.
 * @param fontWeightValue - CSS `font-weight` value.
 * @returns Matching PDF font family, or `undefined` when no mapping exists.
 */
export function resolveFontFamily(
    fontFamilyValue?: string,
    fontWeightValue?: string | number
): PdfFontFamily | undefined {
    const baseFamily = mapFontFamily(fontFamilyValue);
    const isBold = isBoldWeight(fontWeightValue);

    if (!baseFamily) {
        return isBold ? 'Helvetica-Bold' : undefined;
    }

    if (!isBold) {
        return baseFamily;
    }

    switch (baseFamily) {
        case 'Helvetica':
        case 'Helvetica-Bold':
            return 'Helvetica-Bold';
        case 'Times-Roman':
        case 'Times-Bold':
            return 'Times-Bold';
        case 'Courier':
        case 'Courier-Bold':
            return 'Courier-Bold';
        default:
            return baseFamily;
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

/**
 * Resolve whether a CSS font-weight should be treated as bold in PDF output.
 * @param fontWeightValue - CSS `font-weight` value.
 * @returns `true` when the weight should use the bold face.
 */
function isBoldWeight(fontWeightValue?: string | number): boolean {
    if (fontWeightValue == null) {
        return false;
    }

    if (typeof fontWeightValue === 'number') {
        return fontWeightValue >= 600;
    }

    const normalised = String(fontWeightValue).trim().toLowerCase();
    if (normalised === 'bold' || normalised === 'bolder') {
        return true;
    }

    const numeric = Number.parseInt(normalised, 10);
    return Number.isFinite(numeric) && numeric >= 600;
}
