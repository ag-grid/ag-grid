import type { CellStyle, HeaderStyle, PdfCellStyle, RowStyle } from 'ag-grid-community';

import { extractBorderColor, readResolvedStyleColor, resolveCssColorValue } from './colors';
import { resolveFontFamily, resolveTextAlignment } from './fonts';
import type { StyleValueMap } from './styleValues';
import { parseCssNumber, readStyleString, readStyleValue, resolvePaddingStyle } from './styleValues';

/**
 * Convert CSS-style objects into a PDF cell style.
 * Later style objects win when the same property appears multiple times.
 * @param styles - Style objects to merge.
 * @param resolveColor - Optional resolver used for CSS variables/theme colours.
 * @returns Mapped PDF cell style, or `undefined` when no supported properties are present.
 */
export function mapCssStylesToPdfStyle(
    styles: Array<CellStyle | RowStyle | HeaderStyle | null | undefined>,
    resolveColor?: (value?: string) => string | undefined
): PdfCellStyle | undefined {
    const mergedStyles: StyleValueMap = {};

    for (const style of styles) {
        if (!style) {
            continue;
        }

        Object.assign(mergedStyles, style as StyleValueMap);
    }

    if (!Object.keys(mergedStyles).length) {
        return undefined;
    }

    const result: PdfCellStyle = {};

    const color = readResolvedStyleColor(mergedStyles, ['color'], resolveColor);
    if (color) {
        result.color = color;
    }

    const backgroundColor = readResolvedStyleColor(
        mergedStyles,
        ['backgroundColor', 'background-color', 'background'],
        resolveColor
    );
    if (backgroundColor) {
        result.backgroundColor = backgroundColor;
    }

    const borderColor =
        readResolvedStyleColor(mergedStyles, ['borderColor', 'border-color'], resolveColor) ??
        // fall back to extracting colour from `border` shorthand when explicit border colour is absent.
        resolveCssColorValue(extractBorderColor(readStyleString(mergedStyles, ['border', 'border-top'])), resolveColor);
    if (borderColor) {
        result.borderColor = borderColor;
    }

    const borderWidth =
        parseCssNumber(readStyleValue(mergedStyles, ['borderWidth', 'border-width'])) ??
        parseCssNumber(readStyleString(mergedStyles, ['border', 'border-top']));
    if (borderWidth != null) {
        result.borderWidth = borderWidth;
    }

    const fontSize = parseCssNumber(readStyleValue(mergedStyles, ['fontSize', 'font-size']));
    if (fontSize != null) {
        result.fontSize = fontSize;
    }

    const fontFamily = resolveFontFamily(
        readStyleString(mergedStyles, ['fontFamily', 'font-family']),
        readStyleValue(mergedStyles, ['fontWeight', 'font-weight'])
    );
    if (fontFamily) {
        result.fontFamily = fontFamily;
    }

    const alignment = resolveTextAlignment(readStyleString(mergedStyles, ['textAlign', 'text-align']));
    if (alignment) {
        result.alignment = alignment;
    }

    const padding = resolvePaddingStyle(mergedStyles);
    if (padding != null) {
        result.padding = padding;
    }

    return Object.keys(result).length ? result : undefined;
}
