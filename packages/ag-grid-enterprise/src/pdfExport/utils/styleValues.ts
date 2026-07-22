import type { PdfCellStyle } from 'ag-grid-community';

export type StyleValueMap = Record<string, string | number>;

/**
 * Read the first defined style value from a list of candidate keys.
 * @param styles - Flattened style object.
 * @param keys - Candidate property names in priority order.
 * @returns The first defined value, if any.
 */
export function readStyleValue(styles: StyleValueMap, keys: string[]): string | number | undefined {
    for (const key of keys) {
        const value = styles[key];
        if (value != null) {
            return value;
        }
    }

    return undefined;
}

/**
 * Read the first defined style value and normalise it to a non-empty string.
 * @param styles - Flattened style object.
 * @param keys - Candidate property names in priority order.
 * @returns Trimmed string value, or `undefined` when missing/empty.
 */
export function readStyleString(styles: StyleValueMap, keys: string[]): string | undefined {
    const value = readStyleValue(styles, keys);
    if (value == null) {
        return undefined;
    }

    const stringValue = String(value).trim();
    return stringValue || undefined;
}

/**
 * Parse a CSS numeric token into a number.
 * Supports values such as `12`, `12px`, and `-1.5rem`.
 * @param value - Raw style value.
 * @returns Parsed number when valid, otherwise `undefined`.
 */
export function parseCssNumber(value: string | number | undefined): number | undefined {
    if (value == null) {
        return undefined;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    const match = String(value)
        .trim()
        .match(/^-?\d+(?:\.\d+)?/);

    if (!match) {
        return undefined;
    }

    const parsed = Number.parseFloat(match[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Resolve padding from shorthand/side-specific style keys.
 * @param styles - Flattened style object.
 * @returns A numeric padding shorthand, side object, or `undefined`.
 */
export function resolvePaddingStyle(styles: StyleValueMap): PdfCellStyle['padding'] | undefined {
    const shorthand = parseCssNumber(readStyleValue(styles, ['padding']));
    const top = parseCssNumber(readStyleValue(styles, ['paddingTop', 'padding-top']));
    const right = parseCssNumber(readStyleValue(styles, ['paddingRight', 'padding-right']));
    const bottom = parseCssNumber(readStyleValue(styles, ['paddingBottom', 'padding-bottom']));
    const left = parseCssNumber(readStyleValue(styles, ['paddingLeft', 'padding-left']));

    if (top == null && right == null && bottom == null && left == null) {
        return shorthand;
    }

    const spacing: NonNullable<Exclude<PdfCellStyle['padding'], number>> = {};
    if (top != null) {
        spacing.top = top;
    }

    if (right != null) {
        spacing.right = right;
    }

    if (bottom != null) {
        spacing.bottom = bottom;
    }

    if (left != null) {
        spacing.left = left;
    }

    return Object.keys(spacing).length ? spacing : undefined;
}

/**
 * Translate CSS white-space properties into PDF wrapping behaviour.
 * @param styles - Flattened style object.
 * @returns PDF wrapping overrides, or `undefined` when no white-space properties are present.
 */
export function resolveWhiteSpaceStyle(
    styles: StyleValueMap
): Pick<PdfCellStyle, 'wrapText' | 'preserveLineBreaks' | 'preserveSpaces'> | undefined {
    const whiteSpace = readStyleString(styles, ['whiteSpace', 'white-space'])?.toLowerCase();
    const whiteSpaceCollapse = readStyleString(styles, ['whiteSpaceCollapse', 'white-space-collapse'])?.toLowerCase();
    const textWrapMode = readStyleString(styles, ['textWrapMode', 'text-wrap-mode'])?.toLowerCase();
    const result: Pick<PdfCellStyle, 'wrapText' | 'preserveLineBreaks' | 'preserveSpaces'> = {};

    if (whiteSpace) {
        if (whiteSpace === 'normal') {
            result.wrapText = true;
            result.preserveLineBreaks = false;
            result.preserveSpaces = false;
        } else if (whiteSpace === 'nowrap') {
            result.wrapText = false;
            result.preserveLineBreaks = false;
            result.preserveSpaces = false;
        } else if (whiteSpace === 'pre') {
            result.wrapText = false;
            result.preserveLineBreaks = true;
            result.preserveSpaces = true;
        } else if (whiteSpace === 'pre-line') {
            result.wrapText = true;
            result.preserveLineBreaks = true;
            result.preserveSpaces = false;
        } else if (whiteSpace === 'pre-wrap' || whiteSpace === 'break-spaces') {
            result.wrapText = true;
            result.preserveLineBreaks = true;
            result.preserveSpaces = true;
        }
    }

    if (
        whiteSpaceCollapse === 'preserve' ||
        whiteSpaceCollapse === 'preserve-breaks' ||
        whiteSpaceCollapse === 'break-spaces'
    ) {
        result.preserveLineBreaks = true;
        result.preserveSpaces = whiteSpaceCollapse !== 'preserve-breaks';
    } else if (whiteSpaceCollapse === 'collapse') {
        result.preserveLineBreaks = false;
        result.preserveSpaces = false;
    }

    if (textWrapMode === 'wrap' || textWrapMode === 'nowrap') {
        result.wrapText = textWrapMode === 'wrap';
    }

    return Object.keys(result).length ? result : undefined;
}
