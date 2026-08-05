import type { PdfFontFamily } from 'ag-grid-community';

import { getBase14GlyphWidth } from './fontMetrics';

const WIN_ANSI_CODEPOINT_MAP = new Map<number, number>([
    [0x20ac, 0x80],
    [0x201a, 0x82],
    [0x0192, 0x83],
    [0x201e, 0x84],
    [0x2026, 0x85],
    [0x2020, 0x86],
    [0x2021, 0x87],
    [0x02c6, 0x88],
    [0x2030, 0x89],
    [0x0160, 0x8a],
    [0x2039, 0x8b],
    [0x0152, 0x8c],
    [0x017d, 0x8e],
    [0x2018, 0x91],
    [0x2019, 0x92],
    [0x201c, 0x93],
    [0x201d, 0x94],
    [0x2022, 0x95],
    [0x2013, 0x96],
    [0x2014, 0x97],
    [0x02dc, 0x98],
    [0x2122, 0x99],
    [0x0161, 0x9a],
    [0x203a, 0x9b],
    [0x0153, 0x9c],
    [0x017e, 0x9e],
    [0x0178, 0x9f],
]);

type TextWidthCalculator = (text: string) => number;

/**
 * Encode Unicode text as a UTF-16BE hexadecimal PDF string.
 * @param value - Logical Unicode text.
 * @param includeByteOrderMark - Whether to prefix the UTF-16 byte-order marker.
 * @returns PDF hexadecimal string operand.
 */
export function encodePdfUnicodeString(value: string, includeByteOrderMark = true): string {
    let encoded = includeByteOrderMark ? 'FEFF' : '';
    for (const char of value) {
        encoded += encodeCodePointAsUtf16Be(char.codePointAt(0) ?? 0xfffd);
    }
    return `<${encoded}>`;
}

function encodeCodePointAsUtf16Be(codePoint: number): string {
    if (codePoint <= 0xffff) {
        return codePoint.toString(16).toUpperCase().padStart(4, '0');
    }
    const value = codePoint - 0x10000;
    const high = 0xd800 + (value >>> 10);
    const low = 0xdc00 + (value & 0x3ff);
    return `${high.toString(16).toUpperCase().padStart(4, '0')}${low.toString(16).toUpperCase().padStart(4, '0')}`;
}

/**
 * Replace non-WinAnsi characters and normalise new lines for PDF text streams.
 * @param value - Source text.
 * @param preserveLineBreaks - Whether normalised line breaks should be retained.
 * @param preserveUnicode - Whether characters outside WinAnsi should be retained.
 * @returns Normalised text.
 */
export function normaliseText(value: string, preserveLineBreaks = false, preserveUnicode = false): string {
    const normalisedLineBreaks = value.replace(/\r\n?/g, '\n');
    const source = preserveLineBreaks ? normalisedLineBreaks : normalisedLineBreaks.replace(/\n/g, ' ');
    let output = '';

    for (const char of source) {
        if (char === '\n') {
            output += char;
            continue;
        }

        const codePoint = char.codePointAt(0) ?? 0;
        output += preserveUnicode || toWinAnsiByte(codePoint) != null ? char : '?';
    }

    return output;
}

/**
 * Wrap text to a width budget while preserving explicit line breaks.
 * Words are kept intact where possible and oversized words are split by character.
 * @param text - Normalised source text.
 * @param maxWidth - Maximum width of each line in points.
 * @param fontSize - Font size in points.
 * @param fontFamily - Active font family.
 * @param preserveSpaces - Whether repeated, leading and trailing spaces should be retained.
 * @returns Wrapped text lines.
 */
export function wrapText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: PdfFontFamily,
    preserveSpaces = false,
    calculateWidth?: TextWidthCalculator
): string[] {
    if (!text || !Number.isFinite(maxWidth) || maxWidth <= 0 || !Number.isFinite(fontSize) || fontSize <= 0) {
        return [];
    }

    if (preserveSpaces) {
        return wrapPreformattedText(text, maxWidth, fontSize, fontFamily, calculateWidth);
    }

    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
            lines.push('');
            continue;
        }

        const words = paragraph.trim().split(/\s+/);
        let currentLine = '';
        let currentLineWidth = 0;
        const spaceWidth = measureText(' ', fontSize, fontFamily, calculateWidth);

        for (const word of words) {
            const wordWidth = measureText(word, fontSize, fontFamily, calculateWidth);
            const candidateWidth = currentLine ? currentLineWidth + spaceWidth + wordWidth : wordWidth;
            if (candidateWidth <= maxWidth) {
                currentLine = currentLine ? `${currentLine} ${word}` : word;
                currentLineWidth = candidateWidth;
                continue;
            }

            if (currentLine) {
                lines.push(currentLine);
            }

            const wordParts = splitWordToWidth(word, maxWidth, fontSize, fontFamily, calculateWidth);
            const lastPartIndex = wordParts.length - 1;
            for (let i = 0; i < lastPartIndex; i++) {
                lines.push(wordParts[i]);
            }
            currentLine = wordParts[lastPartIndex] ?? '';
            currentLineWidth = measureText(currentLine, fontSize, fontFamily, calculateWidth);
        }

        if (currentLine) {
            lines.push(currentLine);
        }
    }

    return lines;
}

/**
 * Wrap preformatted text without collapsing spaces.
 * @param text - Normalised source text.
 * @param maxWidth - Maximum width of each line in points.
 * @param fontSize - Font size in points.
 * @param fontFamily - Active font family.
 * @returns Wrapped text lines retaining every source space.
 */
function wrapPreformattedText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: PdfFontFamily,
    calculateWidth?: TextWidthCalculator
): string[] {
    const lines: string[] = [];

    for (const paragraph of text.split('\n')) {
        if (!paragraph) {
            lines.push('');
            continue;
        }

        const characters = Array.from(paragraph);
        let lineStart = 0;
        while (lineStart < characters.length) {
            let lineWidth = 0;
            let lastBreak = -1;
            let characterIndex = lineStart;

            while (characterIndex < characters.length) {
                const char = characters[characterIndex];
                const nextWidth = lineWidth + measureText(char, fontSize, fontFamily, calculateWidth);
                if (nextWidth > maxWidth) {
                    break;
                }
                lineWidth = nextWidth;
                characterIndex += 1;
                if (char === ' ') {
                    lastBreak = characterIndex;
                }
            }

            if (characterIndex === characters.length) {
                lines.push(characters.slice(lineStart).join(''));
                break;
            }

            // a single glyph wider than the line still needs to make forward progress.
            if (characterIndex === lineStart) {
                characterIndex += 1;
            } else if (lastBreak > lineStart) {
                characterIndex = lastBreak;
            }

            lines.push(characters.slice(lineStart, characterIndex).join(''));
            lineStart = characterIndex;
        }
    }

    return lines;
}

/**
 * Escape a PDF string literal and encode non-ASCII bytes using octal escapes.
 * @param value - Source text.
 * @returns Escaped PDF string body.
 */
export function escapePdfString(value: string): string {
    let output = '';

    for (const char of value) {
        const codePoint = char.codePointAt(0) ?? 0;
        const byte = toWinAnsiByte(codePoint) ?? 0x3f;

        if (byte === 0x28) {
            output += '\\(';
        } else if (byte === 0x29) {
            output += '\\)';
        } else if (byte === 0x5c) {
            output += '\\\\';
        } else if (byte >= 0x20 && byte <= 0x7e) {
            output += String.fromCharCode(byte);
        } else {
            output += `\\${byte.toString(8).padStart(3, '0')}`;
        }
    }

    return output;
}

/**
 * Measure text using the advance widths of the built-in PDF fonts.
 * @param text - Text to measure.
 * @param fontSize - Font size in points.
 * @param fontFamily - Active font family.
 * @returns Estimated width in points.
 */
function estimateTextWidth(text: string, fontSize: number, fontFamily: PdfFontFamily): number {
    if (!Number.isFinite(fontSize) || fontSize <= 0) {
        return 0;
    }

    let width = 0;
    for (const char of text) {
        width += getBase14GlyphWidth(char, fontFamily);
    }

    return (width / 1000) * fontSize;
}

/**
 * Truncate text to fit a width budget, adding an ellipsis when possible.
 * @param text - Text to truncate.
 * @param maxWidth - Maximum allowed width in points.
 * @param fontSize - Font size in points.
 * @param fontFamily - Active font family.
 * @returns Truncated text.
 */
export function truncateText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: PdfFontFamily,
    calculateWidth?: TextWidthCalculator
): string {
    if (!text) {
        return '';
    }

    if (!Number.isFinite(maxWidth) || maxWidth <= 0 || !Number.isFinite(fontSize) || fontSize <= 0) {
        return '';
    }

    if (measureText(text, fontSize, fontFamily, calculateWidth) <= maxWidth) {
        return text;
    }

    const ellipsis = '...';
    const ellipsisWidth = measureText(ellipsis, fontSize, fontFamily, calculateWidth);
    const ellipsisFits = ellipsisWidth <= maxWidth;
    const widthBudget = ellipsisFits ? maxWidth - ellipsisWidth : maxWidth;
    let truncated = '';
    let truncatedWidth = 0;

    for (const char of text) {
        const charWidth = measureText(char, fontSize, fontFamily, calculateWidth);
        if (truncatedWidth + charWidth > widthBudget) {
            break;
        }
        truncated += char;
        truncatedWidth += charWidth;
    }

    return ellipsisFits ? `${truncated}${ellipsis}` : truncated;
}

/**
 * Clip text to a width budget without adding an overflow marker.
 * @param text - Text to clip.
 * @param maxWidth - Maximum allowed width in points.
 * @param fontSize - Font size in points.
 * @param fontFamily - Active font family.
 * @returns The widest source prefix that fits.
 */
export function clipText(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: PdfFontFamily,
    calculateWidth?: TextWidthCalculator
): string {
    if (!text || !Number.isFinite(maxWidth) || maxWidth <= 0 || !Number.isFinite(fontSize) || fontSize <= 0) {
        return '';
    }

    let clipped = '';
    let clippedWidth = 0;
    for (const char of text) {
        const charWidth = measureText(char, fontSize, fontFamily, calculateWidth);
        if (clippedWidth + charWidth > maxWidth) {
            break;
        }
        clipped += char;
        clippedWidth += charWidth;
    }

    return clipped;
}

/**
 * Add an ellipsis to a line while keeping it within a width budget.
 * @param text - Visible final line.
 * @param maxWidth - Maximum allowed width in points.
 * @param fontSize - Font size in points.
 * @param fontFamily - Active font family.
 * @returns Ellipsised line.
 */
export function addTextEllipsis(
    text: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: PdfFontFamily,
    calculateWidth?: TextWidthCalculator
): string {
    return truncateText(`${text}...`, maxWidth, fontSize, fontFamily, calculateWidth);
}

/**
 * Format a PDF numeric token.
 * @param value - Numeric value.
 * @returns Integer string or fixed 2dp decimal string.
 */
export function fmt(value: number): string {
    if (!Number.isFinite(value)) {
        return '0';
    }

    if (Number.isInteger(value)) {
        return value.toString();
    }

    return value.toFixed(2);
}

/**
 * Convert a unicode code point to a WinAnsi byte when possible.
 * @param codePoint - Unicode code point.
 * @returns WinAnsi byte value, or `undefined` when unsupported.
 */
function toWinAnsiByte(codePoint: number): number | undefined {
    // pdf base-14 fonts in this module are encoded as winansi, so we must map into that byte range.
    if ((codePoint >= 0x20 && codePoint <= 0x7e) || (codePoint >= 0xa0 && codePoint <= 0xff)) {
        return codePoint;
    }

    return WIN_ANSI_CODEPOINT_MAP.get(codePoint);
}

/**
 * Split one word into the widest character chunks that fit a line.
 * @param word - Word to split.
 * @param maxWidth - Maximum width of each chunk.
 * @param fontSize - Font size in points.
 * @param fontFamily - Active font family.
 * @returns One or more chunks containing every source character.
 */
function splitWordToWidth(
    word: string,
    maxWidth: number,
    fontSize: number,
    fontFamily: PdfFontFamily,
    calculateWidth?: TextWidthCalculator
): string[] {
    const parts: string[] = [];
    let part = '';
    let partWidth = 0;

    for (const char of word) {
        const charWidth = measureText(char, fontSize, fontFamily, calculateWidth);
        if (part && partWidth + charWidth > maxWidth) {
            parts.push(part);
            part = '';
            partWidth = 0;
        }

        part += char;
        partWidth += charWidth;
    }

    if (part) {
        parts.push(part);
    }

    return parts;
}

function measureText(
    text: string,
    fontSize: number,
    fontFamily: PdfFontFamily,
    calculateWidth?: TextWidthCalculator
): number {
    return calculateWidth ? calculateWidth(text) : estimateTextWidth(text, fontSize, fontFamily);
}
