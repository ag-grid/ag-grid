import type { PdfCellStyle, PdfFontFamily, PdfFontWeight } from 'ag-grid-community';

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
 * Map a CSS font-family value to a built-in or registered PDF font name.
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
        return toPdfFontWeight(fontWeightValue);
    }

    const normalised = String(fontWeightValue).trim().toLowerCase();
    if (normalised === 'bold' || normalised === 'bolder') {
        return 'bold';
    }
    if (normalised === 'normal') {
        return 'normal';
    }
    if (normalised === 'lighter') {
        return 300;
    }
    if (!/^\d+(?:\.\d+)?$/.test(normalised)) {
        return undefined;
    }

    return toPdfFontWeight(Number.parseFloat(normalised));
}

/**
 * Resolve the primary CSS font family token to a PDF font.
 * @param fontFamilyValue - CSS `font-family` value.
 * @returns Built-in mapping or custom family name, or `undefined`.
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

    if (
        primaryFamily === 'helvetica' ||
        primaryFamily === 'arial' ||
        primaryFamily === 'sans-serif' ||
        primaryFamily === 'system-ui'
    ) {
        return 'Helvetica';
    }

    if (primaryFamily.includes('times-bold')) {
        return 'Times-Bold';
    }

    if (primaryFamily.includes('times') || primaryFamily === 'serif') {
        return 'Times-Roman';
    }

    if (primaryFamily.includes('courier-bold')) {
        return 'Courier-Bold';
    }

    if (primaryFamily.includes('courier') || primaryFamily === 'monospace') {
        return 'Courier';
    }

    return primaryFamily;
}

function toPdfFontWeight(value: number): PdfFontWeight | undefined {
    if (!Number.isFinite(value)) {
        return undefined;
    }
    const weight = Math.min(Math.max(Math.round(value / 100) * 100, 100), 900);
    return weight as PdfFontWeight;
}
