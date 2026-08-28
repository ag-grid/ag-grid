import type { EncodedPdfText, PdfFontRegistry } from '../fontRegistry';
import { constrainImageWidth } from '../imageRegistry';
import type { ResolvedPdfImage } from '../images/types';
import { formatColor } from '../pdfColor';
import type { PdfLinkAnnotation } from '../pdfObjectStore';
import type { ResolvedPageSize } from './layout';
import type { LayoutOptions, MeasuredRow, MeasuredRowFragment, ResolvedCellStyle } from './measurement';
import { constrainTextLines, isImageOnRight, measureRowFragment, measureTextLines } from './measurement';
import type { PdfPagePlaceholderValues, ResolvedPageFurnitureContent } from './pageFurniture';
import { resolvePagePlaceholders } from './pageFurniture';
import { encodePdfUnicodeString, fmt } from './text';
import type { ResolvedPdfWatermark } from './watermark';

/**
 * Render a document heading box and text at the top of a page.
 * @param text - Normalised heading text.
 * @param cursorY - Current page cursor position.
 * @param pageSize - Current page size.
 * @param layout - Layout options.
 * @param pageParts - Mutable page content buffer.
 * @param style - Resolved heading style.
 * @returns Updated cursor position after rendering.
 */
export function renderDocumentHeading(
    text: string,
    cursorY: number,
    pageSize: ResolvedPageSize,
    layout: LayoutOptions,
    pageParts: string[],
    style: ResolvedCellStyle,
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
    const lines = constrainTextLines(measureTextLines(text, innerWidth, style), lineLimit, style, innerWidth);
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
    pageParts.push(`/${style.font.key} ${fmt(style.fontSize)} Tf`);
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
 * Render one page header or footer band.
 * @param content - Resolved left, centre, and right entries.
 * @param bandTop - Top coordinate of the reserved band.
 * @param bandHeight - Height of the reserved band.
 * @param pageSize - Current page size.
 * @param layout - Layout options containing printable margins.
 * @param pageParts - Mutable page content buffer.
 * @param placeholders - Values used to resolve page placeholders.
 * @param fontRegistry - Font registry used by the document.
 */
export function renderPageFurniture(
    content: ResolvedPageFurnitureContent[],
    bandTop: number,
    bandHeight: number,
    pageSize: ResolvedPageSize,
    layout: LayoutOptions,
    pageParts: string[],
    placeholders: PdfPagePlaceholderValues,
    fontRegistry: PdfFontRegistry
): void {
    if (!content.length || bandHeight <= 0) {
        return;
    }

    const availableWidth = Math.max(pageSize.width - layout.margin.left - layout.margin.right, 0);
    const segmentWidth = availableWidth / 3;
    if (segmentWidth <= 0) {
        return;
    }

    for (const item of content) {
        const style = item.style;
        const value = resolvePagePlaceholders(item.value, placeholders);
        const image = item.image ? constrainImageWidth(item.image, segmentWidth) : undefined;
        const imageWidth = image ? image.width + (value ? image.gap : 0) : 0;
        const lines = value ? measureTextLines(value, Math.max(segmentWidth - imageWidth, 0), style) : [];
        const line = lines[0];
        if (!line && !image) {
            continue;
        }

        let segmentIndex = 0;
        if (item.position === 'Center') {
            segmentIndex = 1;
        } else if (item.position === 'Right') {
            segmentIndex = 2;
        }
        const boxX = layout.margin.left + segmentWidth * segmentIndex;
        const textWidth = line
            ? fontRegistry.measureText(line, style.fontSize, style.font, style.direction, style.language)
            : 0;
        const groupWidth = Math.min(imageWidth + textWidth, segmentWidth);
        let groupX = boxX;
        if (item.position === 'Center') {
            groupX += (segmentWidth - groupWidth) / 2;
        } else if (item.position === 'Right') {
            groupX += segmentWidth - groupWidth;
        }
        const imageOnRight = image ? isImageOnRight(image, style, line ?? '') : false;
        const textX = imageOnRight ? groupX : groupX + imageWidth;
        const textY =
            bandTop - (bandHeight - style.lineHeight) / 2 - fontRegistry.getBaselineOffset(style.fontSize, style.font);

        if (image) {
            const imageX = imageOnRight ? groupX + textWidth + (line ? image.gap : 0) : groupX;
            const imageY = bandTop - (bandHeight + image.height) / 2;
            renderImage(pageParts, image, imageX, imageY);
        }
        if (line) {
            const encoded = fontRegistry.encodeText(line, style.font, style.direction, style.language);
            pageParts.push(`${formatColor(style.textColor)} rg`);
            pageParts.push('BT');
            pageParts.push(`/${style.font.key} ${fmt(style.fontSize)} Tf`);
            renderEncodedText(pageParts, encoded, textX, textY, style);
            pageParts.push('ET');
        }
    }
}

/**
 * Render a centred watermark across the page content.
 * @param watermark - Resolved watermark configuration.
 * @param pageSize - Current page size.
 * @param pageParts - Mutable page content buffer.
 * @param fontRegistry - Font registry used by the document.
 */
export function renderWatermark(
    watermark: ResolvedPdfWatermark,
    pageSize: ResolvedPageSize,
    pageParts: string[],
    fontRegistry: PdfFontRegistry
): void {
    const encoded = fontRegistry.encodeText(watermark.text, watermark.font, watermark.direction, watermark.language);
    const textWidth = fontRegistry.measureText(
        watermark.text,
        watermark.fontSize,
        watermark.font,
        watermark.direction,
        watermark.language
    );
    const baselineOffset = fontRegistry.getBaselineOffset(watermark.fontSize, watermark.font);
    const angle = (watermark.rotation * Math.PI) / 180;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const textCenterY = baselineOffset - watermark.lineHeight / 2;
    const centerX = pageSize.width / 2;
    const centerY = pageSize.height / 2;
    const originX = centerX - cosine * (textWidth / 2) + sine * textCenterY;
    const originY = centerY - sine * (textWidth / 2) - cosine * textCenterY;

    pageParts.push('q');
    pageParts.push('/Artifact BMC');
    if (watermark.graphicsState) {
        pageParts.push(`/${watermark.graphicsState.key} gs`);
    }
    pageParts.push(`${formatColor(watermark.color)} rg`);
    pageParts.push('BT');
    pageParts.push(`/${watermark.font.key} ${fmt(watermark.fontSize)} Tf`);
    renderRotatedEncodedText(pageParts, encoded, watermark.fontSize, cosine, sine, originX, originY, watermark);
    pageParts.push('ET');
    pageParts.push('EMC');
    pageParts.push('Q');
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
        if (measurement.covered) {
            x += measurement.width;
            columnIndex += measurement.span;
            continue;
        }
        // spanned cells never paint past the page bottom, even when the block is clamped.
        const maximumCellHeight = Math.max(cursorY - layout.margin.bottom, fragment.height);
        const cellHeight = Math.min(measurement.renderHeight ?? fragment.height, maximumCellHeight);
        const cellBottom = cursorY - cellHeight;
        currentLineWidth = renderCellBox(
            pageParts,
            x,
            cellBottom,
            measurement.width,
            cellHeight,
            measurement.style,
            layout.drawCellBorders,
            currentLineWidth
        );
        renderCellText(
            pageParts,
            cell.lines,
            x,
            cursorY,
            cellBottom,
            measurement.width,
            cellHeight,
            measurement.style,
            fontRegistry,
            measurement.hyperlink,
            annotations,
            measurement.image,
            measurement.imageOnRight ?? false,
            measurement.rowSpan > 1
        );
        if (cell.showImage && measurement.image) {
            renderCellImage(
                pageParts,
                measurement.image,
                x,
                cursorY,
                cellBottom,
                measurement.width,
                measurement.style,
                measurement.imageOnRight ?? false
            );
        }
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
    annotations: PdfLinkAnnotation[],
    image: ResolvedPdfImage | undefined,
    imageOnRight: boolean,
    centreVertically: boolean
): void {
    const padding = cellStyle.padding;
    const imageSpace = image ? image.width + (lines.length ? image.gap : 0) : 0;
    const textBoxX = imageOnRight ? x : x + imageSpace;
    const textBoxWidth = Math.max(cellWidth - imageSpace, 0);
    const textWidthAvailable = Math.max(textBoxWidth - padding.left - padding.right, 0);
    const textHeightAvailable = Math.max(rowHeight - padding.top - padding.bottom, 0);
    if (!lines.length || !textWidthAvailable || !textHeightAvailable) {
        return;
    }

    const fontKey = cellStyle.font.key;
    // constrain fragment text to its cell content box.
    pageParts.push('q');
    pageParts.push(
        `${fmt(textBoxX + padding.left)} ${fmt(rowBottom + padding.bottom)} ${fmt(textWidthAvailable)} ${fmt(textHeightAvailable)} re W n`
    );
    pageParts.push('BT');
    pageParts.push(`${formatColor(cellStyle.textColor)} rg`);
    pageParts.push(`/${fontKey} ${fmt(cellStyle.fontSize)} Tf`);
    const textBlockHeight = lines.length * cellStyle.lineHeight;
    const verticalOffset = centreVertically ? Math.max((textHeightAvailable - textBlockHeight) / 2, 0) : 0;
    let lineTop = rowTop - padding.top - verticalOffset;
    let textY = lineTop - fontRegistry.getBaselineOffset(cellStyle.fontSize, cellStyle.font);
    for (const line of lines) {
        const encoded = fontRegistry.encodeText(line, cellStyle.font, cellStyle.direction, cellStyle.language);
        const textX = getTextX(line, textBoxX, textBoxWidth, cellStyle, fontRegistry, encoded.direction);
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
            const textRight = Math.min(textX + textWidth, textBoxX + textBoxWidth - padding.right);
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

function renderCellImage(
    pageParts: string[],
    image: ResolvedPdfImage,
    cellX: number,
    rowTop: number,
    rowBottom: number,
    cellWidth: number,
    style: ResolvedCellStyle,
    imageOnRight: boolean
): void {
    const padding = style.padding;
    const contentHeight = Math.max(rowTop - rowBottom - padding.top - padding.bottom, 0);
    const contentWidth = Math.max(cellWidth - padding.left - padding.right, 0);
    if (!contentHeight || !contentWidth) {
        return;
    }

    const imageX = imageOnRight ? cellX + cellWidth - padding.right - image.width : cellX + padding.left;
    const imageY = rowBottom + padding.bottom + (contentHeight - image.height) / 2;

    pageParts.push('q');
    pageParts.push(
        `${fmt(cellX + padding.left)} ${fmt(rowBottom + padding.bottom)} ${fmt(contentWidth)} ${fmt(contentHeight)} re W n`
    );
    renderImage(pageParts, image, imageX, imageY);
    pageParts.push('Q');
}

function renderImage(pageParts: string[], image: ResolvedPdfImage, x: number, y: number): void {
    pageParts.push('q');
    pageParts.push(
        image.altText ? `/Span << /ActualText ${encodePdfUnicodeString(image.altText)} >> BDC` : '/Artifact BMC'
    );
    pageParts.push(`${fmt(image.width)} 0 0 ${fmt(image.height)} ${fmt(x)} ${fmt(y)} cm /${image.resource.key} Do`);
    pageParts.push('EMC');
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
    const glyphs = encoded.positionedGlyphs;
    if (!glyphs) {
        pageParts.push(`1 0 0 1 ${fmt(textX)} ${fmt(textY)} Tm ${encoded.operatorValue} Tj`);
        return;
    }

    pageParts.push(`/Span << /ActualText ${encodePdfUnicodeString(encoded.logicalText)} >> BDC`);
    let currentFontKey = style.font.key;
    pageParts.push(`/${currentFontKey} ${fmt(style.fontSize)} Tf`);
    let cursorX = textX;
    let cursorY = textY;
    for (const glyph of glyphs) {
        if (glyph.fontKey !== currentFontKey) {
            currentFontKey = glyph.fontKey;
            pageParts.push(`/${currentFontKey} ${fmt(style.fontSize)} Tf`);
        }
        const glyphX = cursorX + glyph.xOffset * style.fontSize;
        const glyphY = cursorY + glyph.yOffset * style.fontSize;
        pageParts.push(`1 0 0 1 ${fmt(glyphX)} ${fmt(glyphY)} Tm ${glyph.operatorValue} Tj`);
        cursorX += glyph.xAdvance * style.fontSize;
        cursorY += glyph.yAdvance * style.fontSize;
    }
    pageParts.push('EMC');
}

function renderRotatedEncodedText(
    pageParts: string[],
    encoded: EncodedPdfText,
    fontSize: number,
    cosine: number,
    sine: number,
    originX: number,
    originY: number,
    watermark: ResolvedPdfWatermark
): void {
    const glyphs = encoded.positionedGlyphs;
    if (!glyphs) {
        pageParts.push(
            `${fmt(cosine)} ${fmt(sine)} ${fmt(-sine)} ${fmt(cosine)} ${fmt(originX)} ${fmt(originY)} Tm ${encoded.operatorValue} Tj`
        );
        return;
    }

    let currentFontKey = watermark.font.key;
    pageParts.push(`/${currentFontKey} ${fmt(fontSize)} Tf`);
    let cursorX = 0;
    let cursorY = 0;
    for (const glyph of glyphs) {
        if (glyph.fontKey !== currentFontKey) {
            currentFontKey = glyph.fontKey;
            pageParts.push(`/${currentFontKey} ${fmt(fontSize)} Tf`);
        }
        const localX = cursorX + glyph.xOffset * fontSize;
        const localY = cursorY + glyph.yOffset * fontSize;
        const glyphX = originX + cosine * localX - sine * localY;
        const glyphY = originY + sine * localX + cosine * localY;
        pageParts.push(
            `${fmt(cosine)} ${fmt(sine)} ${fmt(-sine)} ${fmt(cosine)} ${fmt(glyphX)} ${fmt(glyphY)} Tm ${glyph.operatorValue} Tj`
        );
        cursorX += glyph.xAdvance * fontSize;
        cursorY += glyph.yAdvance * fontSize;
    }
}
