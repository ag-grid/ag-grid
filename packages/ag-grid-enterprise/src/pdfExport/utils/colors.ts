import type { PdfCellStyle } from 'ag-grid-community';

import { isTransparentColorValue } from './pdfColor';
import type { StyleValueMap } from './styleValues';
import { readStyleString } from './styleValues';

const BORDER_STYLE_VALUES = new Set([
    'none',
    'hidden',
    'dotted',
    'dashed',
    'solid',
    'double',
    'groove',
    'ridge',
    'inset',
    'outset',
]);

/**
 * Resolve a CSS colour value using an optional colour resolver.
 * @param value - Raw CSS colour value.
 * @param resolveColor - Optional resolver used for CSS variables/theme colours.
 * @returns Resolved colour string, or `undefined` when value is empty.
 */
export function resolveCssColorValue(
    value: string | undefined,
    resolveColor?: (value?: string) => string | undefined
): string | undefined {
    if (!value) {
        return undefined;
    }

    const resolved = resolveColor?.(value);
    return resolved ?? value;
}

/**
 * Read and resolve a colour value from a style map.
 * @param styles - Flattened style object.
 * @param keys - Candidate property names in priority order.
 * @param resolveColor - Optional resolver used for CSS variables/theme colours.
 * @returns Resolved colour string, or `undefined`.
 */
export function readResolvedStyleColor(
    styles: StyleValueMap,
    keys: string[],
    resolveColor?: (value?: string) => string | undefined
): string | undefined {
    return resolveCssColorValue(readStyleString(styles, keys), resolveColor);
}

/**
 * Extract a border colour token from a CSS border declaration.
 * @param value - CSS border value (for example `1px solid #ccc`).
 * @returns Border colour token when one is found.
 */
export function extractBorderColor(value?: string): string | undefined {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    const functionalColorMatch = trimmed.match(/(var\([^)]+\)|(?:rgb|hsl)a?\([^)]+\)|color\([^)]+\))\s*$/i);

    if (functionalColorMatch) {
        return functionalColorMatch[1];
    }

    const tokenColorMatch = trimmed.match(/(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)\s*$/);
    if (!tokenColorMatch) {
        return undefined;
    }

    const candidate = tokenColorMatch[1];
    if (BORDER_STYLE_VALUES.has(candidate.toLowerCase())) {
        return undefined;
    }

    return candidate;
}

/**
 * Resolve colour fields inside a `PdfCellStyle`.
 * @param style - Source PDF cell style.
 * @param resolveColor - Optional resolver used for CSS variables/theme colours.
 * @returns A copy of the style with resolved colours.
 */
export function resolvePdfCellStyleColors(
    style: PdfCellStyle | undefined,
    resolveColor?: (value?: string) => string | undefined
): PdfCellStyle | undefined {
    if (!style) {
        return undefined;
    }

    return {
        ...style,
        color: resolveCssColorValue(style.color, resolveColor),
        backgroundColor: resolveCssColorValue(style.backgroundColor, resolveColor),
        borderColor: resolveCssColorValue(style.borderColor, resolveColor),
    };
}

export { isTransparentColorValue };
