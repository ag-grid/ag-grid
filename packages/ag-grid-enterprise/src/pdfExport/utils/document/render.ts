import type { PdfCellStyle, PdfExportParams, PdfFontFamily, PdfMargin, PdfTextAlignment } from 'ag-grid-community';

import type { PdfRow, PdfRowType } from '../../pdfSerializingSession';
import type { PdfRgb, PdfRowStyles, PdfStyleColors } from '../pdfColor';
import { formatColor, getRowStyles, resolveOptionalColor } from '../pdfColor';
import type { ResolvedMargin, ResolvedPageSize } from './layout';
import { getSpanWidth, isHeaderRowType } from './layout';
import { escapePdfString, estimateTextWidth, fmt, normaliseText, truncateText } from './text';

const DEFAULT_TITLE_MARGIN: ResolvedMargin = { top: 0, right: 0, bottom: 8, left: 0 };
const DEFAULT_TITLE_PADDING: ResolvedMargin = { top: 6, right: 6, bottom: 6, left: 6 };
const DEFAULT_TITLE_ALIGNMENT: PdfTextAlignment = 'center';
const DEFAULT_CELL_ALIGNMENT: PdfTextAlignment = 'left';
const DEFAULT_CELL_MARGIN: ResolvedMargin = { top: 0, right: 0, bottom: 0, left: 0 };

export type LayoutOptions = {
    columnCount: number;
    columnWidths: number[];
    margin: ResolvedMargin;
    drawCellBorders: boolean;
    fontSize: number;
    headerFontSize: number;
    cellPadding: number;
    rowHeight?: number;
    headerRowHeight?: number;
};

type ResolvedCellStyle = {
    fontSize: number;
    fontFamily: PdfFontFamily;
    alignment: PdfTextAlignment;
    padding: ResolvedMargin;
    margin: ResolvedMargin;
    textColor: PdfRgb;
    backgroundColor?: PdfRgb;
    borderColor?: PdfRgb;
    borderWidth: number;
};

export type ResolvedDocumentTitle = {
    text: string;
    style: ResolvedCellStyle;
};

export type RowRenderData = {
    defaultCellStyle: ResolvedCellStyle;
    cellStyles: ResolvedCellStyle[];
    rowHeight: number;
};

/**
 * Resolve document title text and style into render-ready values.
 * @param documentTitle - Raw document title param value.
 * @param params - Export params.
 * @param styleColors - Resolved document colours.
 * @param headerFont - Default header font family.
 * @param defaultHeaderFontSize - Default header font size.
 * @returns Resolved title payload, or `undefined`.
 */
export function resolveDocumentTitle(
    documentTitle: PdfExportParams['documentTitle'],
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    headerFont: PdfFontFamily,
    defaultHeaderFontSize: number
): ResolvedDocumentTitle | undefined {
    if (!documentTitle) {
        return undefined;
    }

    if (typeof documentTitle === 'string') {
        if (!documentTitle) {
            return undefined;
        }

        return {
            text: documentTitle,
            style: resolveTitleStyle(undefined, params, styleColors, headerFont, defaultHeaderFontSize),
        };
    }

    const value = documentTitle.data?.value ?? '';
    if (!value) {
        return undefined;
    }

    return {
        text: String(value),
        style: resolveTitleStyle(documentTitle.style, params, styleColors, headerFont, defaultHeaderFontSize),
    };
}

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
    fontKey: string
): number {
    const availableWidth = Math.max(pageSize.width - layout.margin.left - layout.margin.right, 0);
    if (!availableWidth) {
        return cursorY;
    }

    const boxWidth = Math.max(availableWidth - style.margin.left - style.margin.right, 0);
    if (!boxWidth) {
        return cursorY;
    }

    const innerWidth = Math.max(boxWidth - style.padding.left - style.padding.right, 0);
    const text = truncateText(title, innerWidth, style.fontSize, style.fontFamily);
    if (!text) {
        return cursorY;
    }

    const textWidth = estimateTextWidth(text, style.fontSize, style.fontFamily);
    const boxTop = cursorY - style.margin.top;
    const boxHeight = style.fontSize + style.padding.top + style.padding.bottom;
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

    const minX = boxX + style.padding.left;
    const maxX = boxX + boxWidth - style.padding.right - textWidth;
    const textX = resolveTextX(
        boxX + style.padding.left,
        Math.max(boxWidth - style.padding.left - style.padding.right, 0),
        textWidth,
        style.alignment,
        minX,
        maxX
    );

    const textY = boxTop - style.padding.top - style.fontSize;

    pageParts.push(`${formatColor(style.textColor)} rg`);
    pageParts.push('BT');
    pageParts.push(`/${fontKey} ${fmt(style.fontSize)} Tf`);
    pageParts.push(`1 0 0 1 ${fmt(textX)} ${fmt(textY)} Tm (${escapePdfString(text)}) Tj`);
    pageParts.push('ET');

    return boxBottom - style.margin.bottom;
}

/**
 * Render an array of rows onto the current page.
 * @param rows - Rows to render.
 * @param startY - Starting cursor position.
 * @param layout - Layout options.
 * @param pageParts - Mutable page content buffer.
 * @param bodyFont - Default body font family.
 * @param headerFont - Default header font family.
 * @param styleColors - Resolved document colours.
 * @param fontKeyByFamily - Registered PDF font keys.
 * @returns Updated cursor position after rendering.
 */
export function renderRows(
    rows: PdfRow[],
    startY: number,
    layout: LayoutOptions,
    pageParts: string[],
    bodyFont: PdfFontFamily,
    headerFont: PdfFontFamily,
    styleColors: PdfStyleColors,
    fontKeyByFamily: Map<PdfFontFamily, string>
): number {
    let cursorY = startY;
    let bodyRowIndex = 0;

    rows.forEach((row) => {
        cursorY = renderRow(
            row,
            cursorY,
            layout,
            pageParts,
            bodyFont,
            headerFont,
            styleColors,
            bodyRowIndex,
            fontKeyByFamily
        );

        if (row.type === 'BODY') {
            bodyRowIndex += 1;
        }
    });

    return cursorY;
}

/**
 * Render a single row onto the current page.
 * @param row - Row to render.
 * @param cursorY - Current cursor position.
 * @param layout - Layout options.
 * @param pageParts - Mutable page content buffer.
 * @param bodyFont - Default body font family.
 * @param headerFont - Default header font family.
 * @param styleColors - Resolved document colours.
 * @param bodyRowIndex - Zero-based body row index.
 * @param fontKeyByFamily - Registered PDF font keys.
 * @param rowRenderData - Optional pre-resolved row data.
 * @returns Updated cursor position after rendering.
 */
export function renderRow(
    row: PdfRow,
    cursorY: number,
    layout: LayoutOptions,
    pageParts: string[],
    bodyFont: PdfFontFamily,
    headerFont: PdfFontFamily,
    styleColors: PdfStyleColors,
    bodyRowIndex: number,
    fontKeyByFamily: Map<PdfFontFamily, string>,
    rowRenderData?: RowRenderData
): number {
    const { columnCount, columnWidths, margin, drawCellBorders } = layout;
    const resolvedRowData =
        rowRenderData ?? createRowRenderData(row, layout, bodyFont, headerFont, styleColors, bodyRowIndex);
    const defaultFontKey = fontKeyByFamily.get(resolvedRowData.defaultCellStyle.fontFamily) ?? 'F1';

    const rowTop = cursorY;
    const rowBottom = cursorY - resolvedRowData.rowHeight;

    let colIndex = 0;
    let x = margin.left;
    // track the current stroke width to avoid emitting redundant `w` operators for every cell.
    let currentLineWidth = 0.5;

    row.cells.forEach((cell, cellIndex) => {
        const span = cell.mergeAcross ?? 0;
        const cellWidth = getSpanWidth(columnWidths, colIndex, span + 1);
        const cellStyle = resolvedRowData.cellStyles[cellIndex] ?? resolvedRowData.defaultCellStyle;

        currentLineWidth = renderCellBox(
            pageParts,
            x,
            rowBottom,
            cellWidth,
            resolvedRowData.rowHeight,
            cellStyle,
            drawCellBorders,
            currentLineWidth
        );

        renderCellText(pageParts, cell.value, x, rowTop, cellWidth, cellStyle, defaultFontKey, fontKeyByFamily);

        x += cellWidth;
        colIndex += span + 1;
    });

    if (colIndex < columnCount) {
        for (let i = colIndex; i < columnCount; i++) {
            const cellWidth = columnWidths[i];
            currentLineWidth = renderCellBox(
                pageParts,
                x,
                rowBottom,
                cellWidth,
                resolvedRowData.rowHeight,
                resolvedRowData.defaultCellStyle,
                drawCellBorders,
                currentLineWidth
            );
            x += cellWidth;
        }
    }

    if (currentLineWidth !== 0.5) {
        pageParts.push('0.5 w');
    }

    return rowBottom;
}

/**
 * Build title style defaults and resolve colours/borders.
 * @param style - Optional title-specific style.
 * @param params - Export params.
 * @param styleColors - Resolved document colours.
 * @param headerFont - Default header font family.
 * @param defaultHeaderFontSize - Default header font size.
 * @returns Fully resolved title style.
 */
function resolveTitleStyle(
    style: PdfCellStyle | undefined,
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    headerFont: PdfFontFamily,
    defaultHeaderFontSize: number
): ResolvedCellStyle {
    const headerFontSize = params.headerFontSize ?? defaultHeaderFontSize;
    const fontSize = style?.fontSize ?? Math.max(headerFontSize + 4, 14);
    const fontFamily = style?.fontFamily ?? headerFont;
    const alignment = style?.alignment ?? DEFAULT_TITLE_ALIGNMENT;
    const padding = resolveBoxSpacing(style?.padding, DEFAULT_TITLE_PADDING);
    const margin = resolveBoxSpacing(style?.margin, DEFAULT_TITLE_MARGIN);

    const blendWith = styleColors.pageBackground ?? styleColors.dataBackground;
    const fallbackTextColor = styleColors.headerText ?? styleColors.foreground ?? { r: 0, g: 0, b: 0 };
    const textColor = resolveOptionalColor(style?.color, fallbackTextColor, blendWith) ?? fallbackTextColor;
    const backgroundColor = resolveOptionalColor(style?.backgroundColor, undefined, blendWith);
    const borderColor = resolveOptionalColor(style?.borderColor, undefined, blendWith);
    const borderWidth = resolveBorderWidth(style?.borderWidth, borderColor);

    return {
        fontSize,
        fontFamily,
        alignment,
        padding,
        margin,
        textColor,
        backgroundColor,
        borderColor,
        borderWidth,
    };
}

/**
 * Resolve a final table-cell style from style overrides and row defaults.
 * @param style - Optional cell/row override style.
 * @param layout - Layout options.
 * @param fontFamily - Default font family for the row.
 * @param rowStyles - Row-level default colours.
 * @param styleColors - Resolved document colours.
 * @param defaultFontSize - Default font size for the row.
 * @returns Fully resolved table cell style.
 */
function resolveTableCellStyle(
    style: PdfCellStyle | undefined,
    layout: LayoutOptions,
    fontFamily: PdfFontFamily,
    rowStyles: PdfRowStyles,
    styleColors: PdfStyleColors,
    defaultFontSize: number
): ResolvedCellStyle {
    const padding = resolveBoxSpacing(style?.padding, {
        top: layout.cellPadding,
        right: layout.cellPadding,
        bottom: layout.cellPadding,
        left: layout.cellPadding,
    });
    const resolvedFontSize = style?.fontSize ?? defaultFontSize;
    const resolvedFontFamily = style?.fontFamily ?? fontFamily;
    const alignment = style?.alignment ?? DEFAULT_CELL_ALIGNMENT;

    const blendWith = rowStyles.background ?? styleColors.dataBackground ?? styleColors.pageBackground;
    const fallbackTextColor = rowStyles.text ?? styleColors.foreground ?? { r: 0, g: 0, b: 0 };
    const textColor = resolveOptionalColor(style?.color, fallbackTextColor, blendWith) ?? fallbackTextColor;
    const backgroundColor =
        resolveOptionalColor(style?.backgroundColor, rowStyles.background, blendWith) ?? rowStyles.background;
    const borderColor = resolveOptionalColor(style?.borderColor, rowStyles.border, blendWith) ?? rowStyles.border;
    const borderWidth = resolveBorderWidth(style?.borderWidth, borderColor);

    return {
        fontSize: resolvedFontSize,
        fontFamily: resolvedFontFamily,
        alignment,
        padding,
        margin: DEFAULT_CELL_MARGIN,
        textColor,
        backgroundColor,
        borderColor,
        borderWidth,
    };
}

/**
 * Pre-resolve row styles and dimensions for rendering.
 * @param row - Row to resolve.
 * @param layout - Layout options.
 * @param bodyFont - Default body font family.
 * @param headerFont - Default header font family.
 * @param styleColors - Resolved document colours.
 * @param bodyRowIndex - Zero-based body row index.
 * @returns Row render data.
 */
export function createRowRenderData(
    row: PdfRow,
    layout: LayoutOptions,
    bodyFont: PdfFontFamily,
    headerFont: PdfFontFamily,
    styleColors: PdfStyleColors,
    bodyRowIndex: number
): RowRenderData {
    const isHeader = isHeaderRowType(row.type);
    const rowStyles = getRowStyles(row.type, styleColors, bodyRowIndex);
    const baseFontFamily = isHeader ? headerFont : bodyFont;
    const defaultFontSize = isHeader ? layout.headerFontSize : layout.fontSize;
    const hasRowStyle = !!row.style;
    const hasCellStyles = row.cells.some((cell) => !!cell.style);
    const hasPerCellStyle = hasRowStyle || hasCellStyles;

    const defaultCellStyle = resolveTableCellStyle(
        hasRowStyle ? row.style : undefined,
        layout,
        baseFontFamily,
        rowStyles,
        styleColors,
        defaultFontSize
    );

    const cellStyles = hasCellStyles
        ? row.cells.map((cell) => {
              // row style acts as a base layer and per-cell style overrides specific keys.
              const style = mergeCellStyles(row.style, cell.style);
              return resolveTableCellStyle(style, layout, baseFontFamily, rowStyles, styleColors, defaultFontSize);
          })
        : [];

    const rowHeight = hasPerCellStyle
        ? getCustomRowHeight(cellStyles.length ? cellStyles : [defaultCellStyle], layout)
        : getRowHeight(row.type, layout);

    return {
        defaultCellStyle,
        cellStyles,
        rowHeight,
    };
}

/**
 * Render cell background and border.
 * @param pageParts - Mutable page content buffer.
 * @param x - Cell x position.
 * @param rowBottom - Row bottom y position.
 * @param cellWidth - Cell width.
 * @param rowHeight - Row height.
 * @param cellStyle - Resolved cell style.
 * @param drawCellBorders - Whether borders are enabled.
 * @param currentLineWidth - Current active stroke width.
 * @returns Updated active stroke width.
 */
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

/**
 * Render cell text content.
 * @param pageParts - Mutable page content buffer.
 * @param rawCellValue - Raw cell value.
 * @param x - Cell x position.
 * @param rowTop - Row top y position.
 * @param cellWidth - Cell width.
 * @param cellStyle - Resolved cell style.
 * @param defaultFontKey - Fallback font key.
 * @param fontKeyByFamily - Registered PDF font keys.
 */
function renderCellText(
    pageParts: string[],
    rawCellValue: string,
    x: number,
    rowTop: number,
    cellWidth: number,
    cellStyle: ResolvedCellStyle,
    defaultFontKey: string,
    fontKeyByFamily: Map<PdfFontFamily, string>
): void {
    const padding = cellStyle.padding;
    const textWidthAvailable = Math.max(cellWidth - padding.left - padding.right, 0);
    const text = truncateText(
        normaliseText(rawCellValue),
        textWidthAvailable,
        cellStyle.fontSize,
        cellStyle.fontFamily
    );

    if (!text) {
        return;
    }

    const textWidth = estimateTextWidth(text, cellStyle.fontSize, cellStyle.fontFamily);
    const minX = x + padding.left;
    const maxX = x + cellWidth - padding.right - textWidth;
    const textX = resolveTextX(
        x + padding.left,
        Math.max(cellWidth - padding.left - padding.right, 0),
        textWidth,
        cellStyle.alignment,
        minX,
        maxX
    );

    const textY = rowTop - padding.top - cellStyle.fontSize;
    const fontKey = fontKeyByFamily.get(cellStyle.fontFamily) ?? defaultFontKey;

    pageParts.push('BT');
    pageParts.push(`${formatColor(cellStyle.textColor)} rg`);
    pageParts.push(`/${fontKey} ${fmt(cellStyle.fontSize)} Tf`);
    pageParts.push(`1 0 0 1 ${fmt(textX)} ${fmt(textY)} Tm (${escapePdfString(text)}) Tj`);
    pageParts.push('ET');
}

/**
 * Merge two PDF cell styles with override precedence.
 * @param baseStyle - Base style.
 * @param overrideStyle - Override style.
 * @returns Merged style object.
 */
function mergeCellStyles(baseStyle?: PdfCellStyle, overrideStyle?: PdfCellStyle): PdfCellStyle | undefined {
    if (!baseStyle && !overrideStyle) {
        return undefined;
    }

    return {
        ...(baseStyle ?? {}),
        ...(overrideStyle ?? {}),
    };
}

/**
 * Resolve default row height from row type and layout options.
 * @param rowType - Row type.
 * @param layout - Layout options.
 * @returns Row height in points.
 */
function getRowHeight(rowType: PdfRowType, layout: LayoutOptions): number {
    if (isHeaderRowType(rowType)) {
        return layout.headerRowHeight ?? layout.headerFontSize + layout.cellPadding * 2;
    }

    return layout.rowHeight ?? layout.fontSize + layout.cellPadding * 2;
}

/**
 * Compute row height needed for a set of resolved cell styles.
 * @param cellStyles - Cell styles in the row.
 * @param layout - Layout options.
 * @returns Calculated row height in points.
 */
function getCustomRowHeight(cellStyles: ResolvedCellStyle[], layout: LayoutOptions): number {
    const defaultHeight = layout.rowHeight ?? layout.fontSize + layout.cellPadding * 2;
    let maxHeight = defaultHeight;

    cellStyles.forEach((cellStyle) => {
        const height = cellStyle.fontSize + cellStyle.padding.top + cellStyle.padding.bottom;
        maxHeight = Math.max(maxHeight, height);
    });

    return maxHeight;
}

/**
 * Resolve box spacing shorthand/object values into explicit sides.
 * @param value - Margin/padding source value.
 * @param fallback - Fallback side values.
 * @returns Explicit spacing values for all sides.
 */
function resolveBoxSpacing(value: number | PdfMargin | undefined, fallback: ResolvedMargin): ResolvedMargin {
    if (typeof value === 'number') {
        return { top: value, right: value, bottom: value, left: value };
    }

    const resolvedValue = value ?? {};

    return {
        top: resolvedValue.top ?? fallback.top,
        right: resolvedValue.right ?? fallback.right,
        bottom: resolvedValue.bottom ?? fallback.bottom,
        left: resolvedValue.left ?? fallback.left,
    };
}

/**
 * Resolve border width with sensible defaults.
 * @param borderWidth - Requested border width.
 * @param borderColor - Resolved border colour.
 * @returns Border width in points.
 */
function resolveBorderWidth(borderWidth: number | undefined, borderColor?: PdfRgb): number {
    return borderWidth ?? (borderColor ? 1 : 0);
}

/**
 * Resolve text x-position for left/centre/right alignment within a bounded area.
 * @param textAreaLeft - Left edge of text area.
 * @param textAreaWidth - Width of text area.
 * @param textWidth - Measured text width.
 * @param alignment - Requested alignment.
 * @param minX - Minimum allowed x position.
 * @param maxX - Maximum allowed x position.
 * @returns Final x position.
 */
function resolveTextX(
    textAreaLeft: number,
    textAreaWidth: number,
    textWidth: number,
    alignment: PdfTextAlignment,
    minX: number,
    maxX: number
): number {
    let textX = textAreaLeft;

    if (alignment === 'center') {
        textX = textAreaLeft + (textAreaWidth - textWidth) / 2;
    } else if (alignment === 'right') {
        textX = textAreaLeft + textAreaWidth - textWidth;
    }

    return Math.max(minX, Math.min(textX, maxX));
}
