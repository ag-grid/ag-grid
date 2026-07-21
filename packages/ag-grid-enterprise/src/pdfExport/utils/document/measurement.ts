import type {
    PdfCellStyle,
    PdfExportParams,
    PdfFontFamily,
    PdfMargin,
    PdfTextAlignment,
    PdfTextOverflow,
} from 'ag-grid-community';

import type { PdfRow, PdfRowType } from '../../pdfSerializingSession';
import { resolvePdfFontFamily } from '../fonts';
import type { PdfRgb, PdfRowStyles, PdfStyleColors } from '../pdfColor';
import { getRowStyles, resolveOptionalColor } from '../pdfColor';
import { mergePdfCellStyles } from '../styles';
import type { ResolvedMargin } from './layout';
import { getSpanWidth, isHeaderRowType } from './layout';
import { resolveFiniteNumber } from './numbers';
import { addTextEllipsis, clipText, estimateTextWidth, normaliseText, truncateText, wrapText } from './text';

const DEFAULT_TITLE_MARGIN: ResolvedMargin = { top: 0, right: 0, bottom: 8, left: 0 };
const DEFAULT_TITLE_PADDING: ResolvedMargin = { top: 6, right: 6, bottom: 6, left: 6 };
const DEFAULT_TITLE_ALIGNMENT: PdfTextAlignment = 'center';
const DEFAULT_CELL_ALIGNMENT: PdfTextAlignment = 'left';
const DEFAULT_CELL_MARGIN: ResolvedMargin = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_OVERFLOW: PdfTextOverflow = 'ellipsis';
const MIN_AUTO_COLUMN_WIDTH = 24;

export type ResolvedCellStyle = {
    fontSize: number;
    fontFamily: PdfFontFamily;
    lineHeight: number;
    maxLines?: number;
    overflow: PdfTextOverflow;
    alignment: PdfTextAlignment;
    padding: ResolvedMargin;
    margin: ResolvedMargin;
    textColor: PdfRgb;
    backgroundColor?: PdfRgb;
    borderColor?: PdfRgb;
    borderWidth: number;
    wrapText: boolean;
};

type ResolvedDocumentTitle = {
    text: string;
    style: ResolvedCellStyle;
};

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
    wrapText?: boolean;
    lineHeight?: number;
    maxLines?: number;
    overflow?: PdfTextOverflow;
    rowGroupIndentSize?: number;
};

export type MeasuredCell = {
    columnIndex: number;
    span: number;
    width: number;
    style: ResolvedCellStyle;
    lines: string[];
};

export type MeasuredRow = {
    type: PdfRowType;
    defaultCellStyle: ResolvedCellStyle;
    cells: MeasuredCell[];
    rowHeight: number;
    minimumHeight: number;
    fixedHeight: boolean;
};

export type RowFragmentState = {
    lineOffsets: number[];
};

export type MeasuredRowFragment = {
    row: MeasuredRow;
    cells: Array<{ measurement: MeasuredCell; lines: string[] }>;
    height: number;
    complete: boolean;
    nextState?: RowFragmentState;
};

/**
 * Resolve document title text and style into measurement-ready values.
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
 * Resolve styles, widths and text lines for one serialised row.
 * @param row - Serialised row.
 * @param layout - Document layout.
 * @param bodyFont - Default body font.
 * @param headerFont - Default header font.
 * @param styleColors - Resolved PDF colours.
 * @param bodyRowIndex - Zero-based body row index.
 * @returns Fully measured row.
 */
export function measureRow(
    row: PdfRow,
    layout: LayoutOptions,
    bodyFont: PdfFontFamily,
    headerFont: PdfFontFamily,
    styleColors: PdfStyleColors,
    bodyRowIndex: number
): MeasuredRow {
    const isHeader = isHeaderRowType(row.type);
    const rowStyles = getRowStyles(row.type, styleColors, bodyRowIndex);
    const baseFontFamily = isHeader ? headerFont : bodyFont;
    const defaultFontSize = isHeader ? layout.headerFontSize : layout.fontSize;
    const defaultCellStyle = resolveTableCellStyle(
        row.style,
        layout,
        baseFontFamily,
        rowStyles,
        styleColors,
        defaultFontSize
    );
    const measuredCells: MeasuredCell[] = [];
    let columnIndex = 0;
    let naturalHeight = getMinimumRowHeight(row.type, layout);

    for (const cell of row.cells) {
        const span = Math.min((cell.mergeAcross ?? 0) + 1, layout.columnCount - columnIndex);
        if (span <= 0) {
            break;
        }

        const style = resolveTableCellStyle(
            mergePdfCellStyles(row.style, cell.style),
            layout,
            baseFontFamily,
            rowStyles,
            styleColors,
            defaultFontSize
        );
        if (cell.elementType === 'rowgroup' && cell.groupLevel) {
            style.padding.left += cell.groupLevel * (layout.rowGroupIndentSize ?? 0);
        }

        const width = getSpanWidth(layout.columnWidths, columnIndex, span);
        const textWidth = Math.max(width - style.padding.left - style.padding.right, 0);
        const lines = measureTextLines(cell.value, textWidth, style);
        const lineCount = Math.max(lines.length, 1);
        naturalHeight = Math.max(
            naturalHeight,
            lineCount * style.lineHeight + style.padding.top + style.padding.bottom
        );
        measuredCells.push({ columnIndex, span, width, style, lines });
        columnIndex += span;
    }

    const configuredHeight = isHeader ? layout.headerRowHeight : layout.rowHeight;
    const fixedHeight = configuredHeight != null;
    const rowHeight = configuredHeight ?? naturalHeight;

    return {
        type: row.type,
        defaultCellStyle,
        cells: measuredCells,
        rowHeight,
        minimumHeight: getMinimumRowHeight(row.type, layout),
        fixedHeight,
    };
}

/**
 * Select the next renderable fragment of a measured row.
 * @param row - Measured source row.
 * @param state - Previous fragment continuation state.
 * @param availableHeight - Vertical page space available in points.
 * @returns A fragment that fits, or `undefined` when no line can fit.
 */
export function measureRowFragment(
    row: MeasuredRow,
    state: RowFragmentState | undefined,
    availableHeight: number
): MeasuredRowFragment | undefined {
    if (!Number.isFinite(availableHeight) || availableHeight <= 0) {
        return undefined;
    }

    if (row.fixedHeight) {
        const height = Math.min(row.rowHeight, availableHeight);
        return {
            row,
            cells: row.cells.map((cell) => ({ measurement: cell, lines: constrainLinesToHeight(cell, height) })),
            height,
            complete: true,
        };
    }

    // each cell advances independently so shorter cells can finish before the tallest cell.
    const offsets = state?.lineOffsets ?? row.cells.map(() => 0);
    const remainingHeight = getRemainingRowHeight(row, offsets);
    if (remainingHeight <= availableHeight) {
        return {
            row,
            cells: row.cells.map((cell, index) => ({
                measurement: cell,
                lines: cell.lines.slice(offsets[index] ?? 0),
            })),
            height: remainingHeight,
            complete: true,
        };
    }

    const nextOffsets = [...offsets];
    const cells: MeasuredRowFragment['cells'] = [];
    let fragmentHeight = Math.min(row.minimumHeight, availableHeight);
    let progressed = false;

    for (let i = 0; i < row.cells.length; i++) {
        const cell = row.cells[i];
        const offset = offsets[i] ?? 0;
        const remainingLineCount = Math.max(cell.lines.length - offset, 0);
        const contentHeight = Math.max(availableHeight - cell.style.padding.top - cell.style.padding.bottom, 0);
        const lineCapacity = Math.floor(contentHeight / cell.style.lineHeight);
        const lineCount = Math.min(remainingLineCount, lineCapacity);
        const lines = cell.lines.slice(offset, offset + lineCount);

        if (lineCount > 0) {
            progressed = true;
            nextOffsets[i] = offset + lineCount;
            fragmentHeight = Math.max(
                fragmentHeight,
                cell.style.padding.top + lineCount * cell.style.lineHeight + cell.style.padding.bottom
            );
        }
        cells.push({ measurement: cell, lines });
    }

    if (!progressed) {
        return undefined;
    }

    // the row is complete only after every cell has consumed all of its measured lines.
    const complete = row.cells.every((cell, index) => (nextOffsets[index] ?? 0) >= cell.lines.length);
    return {
        row,
        cells,
        height: fragmentHeight,
        complete,
        nextState: complete ? undefined : { lineOffsets: nextOffsets },
    };
}

/**
 * Measure exported text and padding to obtain intrinsic column widths.
 * @param rows - Serialised table rows.
 * @param layout - Base layout and typography options.
 * @param bodyFont - Default body font family.
 * @param headerFont - Default header font family.
 * @param styleColors - Resolved document colours.
 * @returns Intrinsic widths in points.
 */
export function getAutoColumnWidths(
    rows: PdfRow[],
    layout: LayoutOptions,
    bodyFont: PdfFontFamily,
    headerFont: PdfFontFamily,
    styleColors: PdfStyleColors
): number[] {
    const widths: number[] = [];
    for (let i = 0; i < layout.columnCount; i++) {
        widths.push(MIN_AUTO_COLUMN_WIDTH);
    }

    let bodyRowIndex = 0;
    for (const row of rows) {
        if (row.type === 'CUSTOM') {
            continue;
        }

        const measuredRow = measureRow(row, layout, bodyFont, headerFont, styleColors, bodyRowIndex);
        for (let i = 0; i < measuredRow.cells.length; i++) {
            const cell = measuredRow.cells[i];
            const sourceCell = row.cells[i];
            const textWidth = getIntrinsicTextWidth(sourceCell?.value ?? '', cell.style);
            const requiredWidth = textWidth + cell.style.padding.left + cell.style.padding.right;
            const currentWidth = getSpanWidth(widths, cell.columnIndex, cell.span);
            if (requiredWidth > currentWidth) {
                const additionalWidth = (requiredWidth - currentWidth) / cell.span;
                for (let columnIndex = cell.columnIndex; columnIndex < cell.columnIndex + cell.span; columnIndex++) {
                    widths[columnIndex] += additionalWidth;
                }
            }
        }

        if (row.type === 'BODY') {
            bodyRowIndex += 1;
        }
    }

    return widths;
}

/**
 * Resolve renderable lines for a measured text box.
 * @param value - Raw text value.
 * @param availableWidth - Available text width.
 * @param style - Resolved text style.
 * @returns Permanently constrained text lines.
 */
export function measureTextLines(value: string, availableWidth: number, style: ResolvedCellStyle): string[] {
    let lines: string[];
    if (style.wrapText) {
        lines = wrapText(normaliseText(value, true), availableWidth, style.fontSize, style.fontFamily);
    } else {
        const normalised = normaliseText(value);
        const line =
            style.overflow === 'clip'
                ? clipText(normalised, availableWidth, style.fontSize, style.fontFamily)
                : truncateText(normalised, availableWidth, style.fontSize, style.fontFamily);
        lines = line ? [line] : [];
    }

    return applyLineLimit(lines, style.maxLines, style, availableWidth);
}

function getRemainingRowHeight(row: MeasuredRow, offsets: number[]): number {
    let height = row.minimumHeight;
    for (let i = 0; i < row.cells.length; i++) {
        const cell = row.cells[i];
        const remainingLines = Math.max(cell.lines.length - (offsets[i] ?? 0), 0);
        if (remainingLines > 0) {
            height = Math.max(
                height,
                cell.style.padding.top + remainingLines * cell.style.lineHeight + cell.style.padding.bottom
            );
        }
    }
    return height;
}

function constrainLinesToHeight(cell: MeasuredCell, height: number): string[] {
    const contentHeight = Math.max(height - cell.style.padding.top - cell.style.padding.bottom, 0);
    const lineLimit = Math.floor(contentHeight / cell.style.lineHeight);
    return applyLineLimit(
        cell.lines,
        lineLimit,
        cell.style,
        cell.width - cell.style.padding.left - cell.style.padding.right
    );
}

function applyLineLimit(
    lines: string[],
    lineLimit: number | undefined,
    style: ResolvedCellStyle,
    availableWidth: number
): string[] {
    if (lineLimit == null || lines.length <= lineLimit) {
        return lines;
    }
    if (lineLimit <= 0) {
        return [];
    }

    const visibleLines = lines.slice(0, lineLimit);
    if (style.overflow === 'ellipsis') {
        const lastLineIndex = visibleLines.length - 1;
        visibleLines[lastLineIndex] = addTextEllipsis(
            visibleLines[lastLineIndex],
            availableWidth,
            style.fontSize,
            style.fontFamily
        );
    }
    return visibleLines;
}

function getMinimumRowHeight(rowType: PdfRowType, layout: LayoutOptions): number {
    const fontSize = isHeaderRowType(rowType) ? layout.headerFontSize : layout.fontSize;
    const lineHeight = resolveFiniteNumber(layout.lineHeight, fontSize, Number.EPSILON);
    return lineHeight + layout.cellPadding * 2;
}

function resolveTitleStyle(
    style: PdfCellStyle | undefined,
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    headerFont: PdfFontFamily,
    defaultHeaderFontSize: number
): ResolvedCellStyle {
    const headerFontSize = resolveFiniteNumber(params.headerFontSize, defaultHeaderFontSize, Number.EPSILON);
    const fontSize = resolveFiniteNumber(style?.fontSize, Math.max(headerFontSize + 4, 14), Number.EPSILON);
    const fontFamily = resolvePdfFontFamily(style?.fontFamily, style?.fontWeight, headerFont);
    const padding = resolveBoxSpacing(style?.padding, DEFAULT_TITLE_PADDING);
    const margin = resolveBoxSpacing(style?.margin, DEFAULT_TITLE_MARGIN);
    const blendWith = styleColors.pageBackground ?? styleColors.dataBackground;
    const fallbackTextColor = styleColors.headerText ?? styleColors.foreground ?? { r: 0, g: 0, b: 0 };
    const borderColor = resolveOptionalColor(style?.borderColor, undefined, blendWith);

    return {
        fontSize,
        fontFamily,
        lineHeight: resolveFiniteNumber(style?.lineHeight ?? params.lineHeight, fontSize, Number.EPSILON),
        maxLines: resolveMaxLines(style?.maxLines ?? params.maxLines),
        overflow: style?.overflow ?? params.overflow ?? DEFAULT_OVERFLOW,
        alignment: style?.alignment ?? DEFAULT_TITLE_ALIGNMENT,
        padding,
        margin,
        textColor: resolveOptionalColor(style?.color, fallbackTextColor, blendWith) ?? fallbackTextColor,
        backgroundColor: resolveOptionalColor(style?.backgroundColor, undefined, blendWith),
        borderColor,
        borderWidth: resolveBorderWidth(style?.borderWidth, borderColor),
        wrapText: style?.wrapText ?? false,
    };
}

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
    const fontSize = resolveFiniteNumber(style?.fontSize, defaultFontSize, Number.EPSILON);
    const resolvedFontFamily = resolvePdfFontFamily(style?.fontFamily, style?.fontWeight, fontFamily);
    const blendWith = rowStyles.background ?? styleColors.dataBackground ?? styleColors.pageBackground;
    const fallbackTextColor = rowStyles.text ?? styleColors.foreground ?? { r: 0, g: 0, b: 0 };
    const borderColor = resolveOptionalColor(style?.borderColor, rowStyles.border, blendWith);

    return {
        fontSize,
        fontFamily: resolvedFontFamily,
        lineHeight: resolveFiniteNumber(style?.lineHeight ?? layout.lineHeight, fontSize, Number.EPSILON),
        maxLines: resolveMaxLines(style?.maxLines ?? layout.maxLines),
        overflow: style?.overflow ?? layout.overflow ?? DEFAULT_OVERFLOW,
        alignment: style?.alignment ?? DEFAULT_CELL_ALIGNMENT,
        padding,
        margin: DEFAULT_CELL_MARGIN,
        textColor: resolveOptionalColor(style?.color, fallbackTextColor, blendWith) ?? fallbackTextColor,
        backgroundColor: resolveOptionalColor(style?.backgroundColor, rowStyles.background, blendWith),
        borderColor,
        borderWidth: resolveBorderWidth(style?.borderWidth, borderColor),
        wrapText: style?.wrapText ?? layout.wrapText ?? false,
    };
}

function getIntrinsicTextWidth(value: string, style: ResolvedCellStyle): number {
    const normalised = normaliseText(value, style.wrapText);
    const lines = style.wrapText ? normalised.split('\n') : [normalised];
    let width = 0;
    for (const line of lines) {
        width = Math.max(width, estimateTextWidth(line, style.fontSize, style.fontFamily));
    }
    return width;
}

function resolveBoxSpacing(value: number | PdfMargin | undefined, fallback: ResolvedMargin): ResolvedMargin {
    if (typeof value === 'number') {
        const spacing = resolveFiniteNumber(value, 0);
        return { top: spacing, right: spacing, bottom: spacing, left: spacing };
    }

    const resolvedValue = value ?? {};
    return {
        top: resolveFiniteNumber(resolvedValue.top, fallback.top),
        right: resolveFiniteNumber(resolvedValue.right, fallback.right),
        bottom: resolveFiniteNumber(resolvedValue.bottom, fallback.bottom),
        left: resolveFiniteNumber(resolvedValue.left, fallback.left),
    };
}

function resolveMaxLines(value: number | undefined): number | undefined {
    if (value == null || !Number.isFinite(value) || value < 1) {
        return undefined;
    }
    return Math.floor(value);
}

function resolveBorderWidth(borderWidth: number | undefined, borderColor?: PdfRgb): number {
    return resolveFiniteNumber(borderWidth, borderColor ? 1 : 0);
}
