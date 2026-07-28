import type { EncodedPdfText, PdfFontRegistry } from '../fontRegistry';
import { formatColor } from '../pdfColor';
import type { PdfLinkAnnotation } from '../pdfObjectStore';
import type { ResolvedPageSize } from './layout';
import type { LayoutOptions, MeasuredRow, MeasuredRowFragment, ResolvedCellStyle } from './measurement';
import { constrainTextLines, measureRowFragment, measureTextLines } from './measurement';
import { encodePdfUnicodeString, fmt } from './text';

/**
 * Render the document title box and text at the top of a page.
 * @param title - Normalised title text.
 * @param cursorY - Current page cursor position.
 * @param pageSize - Current page size.
 * @param layout - Layout options.
 * @param pageParts - Mutable page content buffer.
 * @param style - Resolved title style.
 * @param fontKey - Registered PDF font key.
 * @returns Updated cursor position after rendering.
 */
export function renderDocumentTitle(
    title: string,
    cursorY: number,
    pageSize: ResolvedPageSize,
    layout: LayoutOptions,
    pageParts: string[],
    style: ResolvedCellStyle,
    fontKey: string,
    fontRegistry: PdfFontRegistry
): number {
    const availableWidth = Math.max(pageSize.width - layout.margin.left - layout.margin.right, 0);
    const boxWidth = Math.max(availableWidth - style.margin.left - style.margin.right, 0);
    const innerWidth = Math.max(boxWidth - style.padding.left - style.padding.right, 0);
    if (!boxWidth || !innerWidth) {
        return cursorY;
    }

    const boxTop = cursorY - style.margin.top;
    const availableBoxHeight = Math.max(boxTop - layout.margin.bottom - style.margin.bottom, 0);
    const availableTextHeight = Math.max(availableBoxHeight - style.padding.top - style.padding.bottom, 0);
    const lineLimit = Math.floor(availableTextHeight / style.lineHeight);
    const lines = constrainTextLines(measureTextLines(title, innerWidth, style), lineLimit, style, innerWidth);
    if (!lines.length) {
        return cursorY;
    }

    const boxHeight = lines.length * style.lineHeight + style.padding.top + style.padding.bottom;
    const boxBottom = boxTop - boxHeight;
    const boxX = layout.margin.left + style.margin.left;

    if (style.backgroundColor) {
        pageParts.push(`${formatColor(style.backgroundColor)} rg`);
        pageParts.push(`${fmt(boxX)} ${fmt(boxBottom)} ${fmt(boxWidth)} ${fmt(boxHeight)} re f`);
    }

    if (style.borderColor && style.borderWidth > 0) {
        pageParts.push(`${fmt(style.borderWidth)} w`);
        pageParts.push(`${formatColor(style.borderColor)} RG`);
        pageParts.push(`${fmt(boxX)} ${fmt(boxBottom)} ${fmt(boxWidth)} ${fmt(boxHeight)} re S`);
        pageParts.push('0.5 w');
    }

    pageParts.push(`${formatColor(style.textColor)} rg`);
    pageParts.push('BT');
    pageParts.push(`/${fontKey} ${fmt(style.fontSize)} Tf`);
    let textY = boxTop - style.padding.top - fontRegistry.getBaselineOffset(style.fontSize, style.font);
    for (const line of lines) {
        const encoded = fontRegistry.encodeText(line, style.font, style.direction, style.language);
        const textX = getTextX(line, boxX, boxWidth, style, fontRegistry, encoded.direction);
        renderEncodedText(pageParts, encoded, textX, textY, style);
        textY -= style.lineHeight;
    }
    pageParts.push('ET');

    return boxBottom - style.margin.bottom;
}

/**
 * Render complete measured rows without pagination.
 * @param rows - Measured rows known to fit in the available area.
 * @param startY - Starting cursor position.
 * @param layout - Layout options.
 * @param pageParts - Mutable page content buffer.
 * @param annotations - Mutable page link annotations.
 * @param fontRegistry - Font registry used by the document.
 * @returns Updated cursor position.
 */
export function renderMeasuredRows(
    rows: MeasuredRow[],
    startY: number,
    layout: LayoutOptions,
    pageParts: string[],
    annotations: PdfLinkAnnotation[],
    fontRegistry: PdfFontRegistry
): number {
    let cursorY = startY;
    for (const row of rows) {
        const fragment = measureRowFragment(row, undefined, row.rowHeight);
        if (fragment) {
            cursorY = renderRowFragment(fragment, cursorY, layout, pageParts, annotations, fontRegistry);
        }
    }
    return cursorY;
}

/**
 * Paint one measured row fragment.
 * @param fragment - Measured fragment and selected continuation lines.
 * @param cursorY - Fragment top position.
 * @param layout - Document layout.
 * @param pageParts - Mutable page content buffer.
 * @param annotations - Mutable page link annotations.
 * @param fontRegistry - Font registry used by the document.
 * @returns Fragment bottom position.
 */
export function renderRowFragment(
    fragment: MeasuredRowFragment,
    cursorY: number,
    layout: LayoutOptions,
    pageParts: string[],
    annotations: PdfLinkAnnotation[],
    fontRegistry: PdfFontRegistry
): number {
    const row = fragment.row;
    const rowBottom = cursorY - fragment.height;
    let currentLineWidth = 0.5;
    let x = layout.margin.left;
    let columnIndex = 0;

    for (const cell of fragment.cells) {
        const measurement = cell.measurement;
        currentLineWidth = renderCellBox(
            pageParts,
            x,
            rowBottom,
            measurement.width,
            fragment.height,
            measurement.style,
            layout.drawCellBorders,
            currentLineWidth
        );
        renderCellText(
            pageParts,
            cell.lines,
            x,
            cursorY,
            rowBottom,
            measurement.width,
            fragment.height,
            measurement.style,
            fontRegistry,
            measurement.hyperlink,
            annotations
        );
        x += measurement.width;
        columnIndex += measurement.span;
    }

    for (let i = columnIndex; i < layout.columnCount; i++) {
        const cellWidth = layout.columnWidths[i];
        currentLineWidth = renderCellBox(
            pageParts,
            x,
            rowBottom,
            cellWidth,
            fragment.height,
            row.defaultCellStyle,
            layout.drawCellBorders,
            currentLineWidth
        );
        x += cellWidth;
    }

    if (currentLineWidth !== 0.5) {
        pageParts.push('0.5 w');
    }
    return rowBottom;
}

function renderCellBox(
    pageParts: string[],
    x: number,
    rowBottom: number,
    cellWidth: number,
    rowHeight: number,
    cellStyle: ResolvedCellStyle,
    drawCellBorders: boolean,
    currentLineWidth: number
): number {
    if (cellStyle.backgroundColor) {
        pageParts.push(`${formatColor(cellStyle.backgroundColor)} rg`);
        pageParts.push(`${fmt(x)} ${fmt(rowBottom)} ${fmt(cellWidth)} ${fmt(rowHeight)} re f`);
    }

    if (drawCellBorders && cellStyle.borderColor && cellStyle.borderWidth > 0) {
        if (cellStyle.borderWidth !== currentLineWidth) {
            pageParts.push(`${fmt(cellStyle.borderWidth)} w`);
            currentLineWidth = cellStyle.borderWidth;
        }
        pageParts.push(`${formatColor(cellStyle.borderColor)} RG`);
        pageParts.push(`${fmt(x)} ${fmt(rowBottom)} ${fmt(cellWidth)} ${fmt(rowHeight)} re S`);
    }
    return currentLineWidth;
}

function renderCellText(
    pageParts: string[],
    lines: string[],
    x: number,
    rowTop: number,
    rowBottom: number,
    cellWidth: number,
    rowHeight: number,
    cellStyle: ResolvedCellStyle,
    fontRegistry: PdfFontRegistry,
    hyperlink: string | undefined,
    annotations: PdfLinkAnnotation[]
): void {
    const padding = cellStyle.padding;
    const textWidthAvailable = Math.max(cellWidth - padding.left - padding.right, 0);
    const textHeightAvailable = Math.max(rowHeight - padding.top - padding.bottom, 0);
    if (!lines.length || !textWidthAvailable || !textHeightAvailable) {
        return;
    }

    const fontKey = cellStyle.font.key;
    // constrain fragment text to its cell content box.
    pageParts.push('q');
    pageParts.push(
        `${fmt(x + padding.left)} ${fmt(rowBottom + padding.bottom)} ${fmt(textWidthAvailable)} ${fmt(textHeightAvailable)} re W n`
    );
    pageParts.push('BT');
    pageParts.push(`${formatColor(cellStyle.textColor)} rg`);
    pageParts.push(`/${fontKey} ${fmt(cellStyle.fontSize)} Tf`);
    let textY = rowTop - padding.top - fontRegistry.getBaselineOffset(cellStyle.fontSize, cellStyle.font);
    let lineTop = rowTop - padding.top;
    for (const line of lines) {
        const encoded = fontRegistry.encodeText(line, cellStyle.font, cellStyle.direction, cellStyle.language);
        const textX = getTextX(line, x, cellWidth, cellStyle, fontRegistry, encoded.direction);
        renderEncodedText(pageParts, encoded, textX, textY, cellStyle);
        if (hyperlink && line) {
            const textWidth = Math.min(
                fontRegistry.measureText(
                    line,
                    cellStyle.fontSize,
                    cellStyle.font,
                    cellStyle.direction,
                    cellStyle.language
                ),
                textWidthAvailable
            );
            const lineBottom = Math.max(lineTop - cellStyle.lineHeight, rowBottom + padding.bottom);
            const textRight = Math.min(textX + textWidth, x + cellWidth - padding.right);
            if (textRight > textX && lineTop > lineBottom) {
                annotations.push({ uri: hyperlink, rect: [textX, lineBottom, textRight, lineTop] });
            }
        }
        textY -= cellStyle.lineHeight;
        lineTop -= cellStyle.lineHeight;
    }
    pageParts.push('ET');
    pageParts.push('Q');
}

function getTextX(
    text: string,
    boxX: number,
    boxWidth: number,
    style: ResolvedCellStyle,
    fontRegistry: PdfFontRegistry,
    resolvedDirection: 'ltr' | 'rtl'
): number {
    const textWidth = fontRegistry.measureText(text, style.fontSize, style.font, style.direction, style.language);
    const minX = boxX + style.padding.left;
    const maxX = boxX + boxWidth - style.padding.right - textWidth;
    const textAreaWidth = Math.max(boxWidth - style.padding.left - style.padding.right, 0);
    let textX = minX;

    if (style.alignment === 'center') {
        textX = minX + (textAreaWidth - textWidth) / 2;
    } else if (style.alignment === 'right' || (!style.alignmentExplicit && resolvedDirection === 'rtl')) {
        textX = minX + textAreaWidth - textWidth;
    }

    return Math.max(minX, Math.min(textX, maxX));
}

function renderEncodedText(
    pageParts: string[],
    encoded: EncodedPdfText,
    textX: number,
    textY: number,
    style: ResolvedCellStyle
): void {
    const run = encoded.glyphRun;
    const cids = encoded.cids;
    const trueType = style.font.trueType;
    if (!run || !cids || !trueType) {
        pageParts.push(`1 0 0 1 ${fmt(textX)} ${fmt(textY)} Tm ${encoded.operatorValue} Tj`);
        return;
    }

    pageParts.push(`/Span << /ActualText ${encodePdfUnicodeString(encoded.logicalText)} >> BDC`);
    const scale = style.fontSize / trueType.unitsPerEm;
    let cursorX = textX;
    let cursorY = textY;
    for (let index = 0; index < run.glyphs.length; index++) {
        const glyph = run.glyphs[index];
        const cid = cids[index];
        const glyphX = cursorX + glyph.xOffset * scale;
        const glyphY = cursorY + glyph.yOffset * scale;
        pageParts.push(`1 0 0 1 ${fmt(glyphX)} ${fmt(glyphY)} Tm <${cid.toString(16).padStart(4, '0')}> Tj`);
        cursorX += glyph.xAdvance * scale;
        cursorY += glyph.yAdvance * scale;
    }
    pageParts.push('EMC');
}
