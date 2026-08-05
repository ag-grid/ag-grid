import type {
    PdfCellStyle,
    PdfDocumentHeadingStyle,
    PdfExportParams,
    PdfFontFamily,
    PdfFontStyle,
    PdfMargin,
    PdfTextAlignment,
    PdfTextDirection,
    PdfTextOverflow,
} from 'ag-grid-community';

import type { PdfRow, PdfRowType } from '../../pdfSerializingSession';
import type { ResolvedPdfFont } from '../fontRegistry';
import { PdfFontRegistry } from '../fontRegistry';
import type { PdfImageRegistry } from '../imageRegistry';
import { constrainImageWidth } from '../imageRegistry';
import type { ResolvedPdfImage } from '../images/types';
import type { PdfRgb, PdfRowStyles, PdfStyleColors } from '../pdfColor';
import { getRowStyles, resolveOptionalColor } from '../pdfColor';
import { mergePdfCellStyles } from '../styles';
import { resolveBidiCharacters } from '../textDirection';
import type { ResolvedMargin } from './layout';
import { getSpanWidth, isHeaderRowType } from './layout';
import { resolveFiniteNumber } from './numbers';
import { addTextEllipsis, clipText, normaliseText, truncateText, wrapText } from './text';

const DEFAULT_TITLE_MARGIN: ResolvedMargin = { top: 0, right: 0, bottom: 8, left: 0 };
const DEFAULT_TITLE_PADDING: ResolvedMargin = { top: 6, right: 6, bottom: 6, left: 6 };
const DEFAULT_SUBTITLE_MARGIN: ResolvedMargin = { top: 0, right: 0, bottom: 12, left: 0 };
const DEFAULT_SUBTITLE_PADDING: ResolvedMargin = { top: 3, right: 6, bottom: 3, left: 6 };
const DEFAULT_TITLE_ALIGNMENT: PdfTextAlignment = 'center';
const DEFAULT_CELL_ALIGNMENT: PdfTextAlignment = 'left';
const DEFAULT_CELL_MARGIN: ResolvedMargin = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_OVERFLOW: PdfTextOverflow = 'ellipsis';
const MIN_AUTO_COLUMN_WIDTH = 24;

export type ResolvedCellStyle = {
    fontSize: number;
    fontFamily: PdfFontFamily;
    fontWeight: number;
    fontStyle: PdfFontStyle;
    font: ResolvedPdfFont;
    fontRegistry: PdfFontRegistry;
    direction: PdfTextDirection;
    language?: string;
    lineHeight: number;
    maxLines?: number;
    overflow: PdfTextOverflow;
    alignment: PdfTextAlignment;
    alignmentExplicit: boolean;
    padding: ResolvedMargin;
    margin: ResolvedMargin;
    textColor: PdfRgb;
    backgroundColor?: PdfRgb;
    borderColor?: PdfRgb;
    borderWidth: number;
    wrapText: boolean;
    preserveLineBreaks: boolean;
    preserveSpaces: boolean;
};

type ResolvedDocumentHeading = {
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
    defaultCellStyle?: PdfCellStyle;
    /** Header defaults pre-merged over `defaultCellStyle`. */
    defaultHeaderStyle?: PdfCellStyle;
    rowHeight?: number;
    headerRowHeight?: number;
    rowGroupIndentSize?: number;
    fontRegistry?: PdfFontRegistry;
    language?: string;
    direction?: PdfTextDirection;
    imageRegistry?: PdfImageRegistry;
};

export type MeasuredCell = {
    columnIndex: number;
    span: number;
    width: number;
    style: ResolvedCellStyle;
    lines: string[];
    hyperlink?: string;
    image?: ResolvedPdfImage;
    rowSpan: number;
    requiredHeight: number;
    renderHeight?: number;
    covered: boolean;
    /** Resolved once from the full cell text so text and image placement always agree. */
    imageOnRight?: boolean;
};

export type MeasuredRow = {
    type: PdfRowType;
    defaultCellStyle: ResolvedCellStyle;
    cells: MeasuredCell[];
    rowHeight: number;
    minimumHeight: number;
    fixedHeight: boolean;
    /** Row belongs to a header block with vertical spans and renders at exactly `rowHeight`. */
    spanned?: boolean;
};

export type RowFragmentState = {
    lineOffsets: number[];
    imageRendered: boolean[];
};

export type MeasuredRowFragment = {
    row: MeasuredRow;
    cells: Array<{ measurement: MeasuredCell; lines: string[]; showImage: boolean }>;
    height: number;
    complete: boolean;
    nextState?: RowFragmentState;
};

/**
 * Resolve document heading text and style into measurement-ready values.
 * @param text - Document heading text.
 * @param style - Document heading style.
 * @param type - Heading level.
 * @param params - Export params.
 * @param styleColors - Resolved document colours.
 * @param headingFont - Default heading font family.
 * @param defaultHeaderFontSize - Default header font size.
 * @returns Resolved heading payload, or `undefined`.
 */
export function resolveDocumentHeading(
    text: string | undefined,
    style: PdfDocumentHeadingStyle | undefined,
    type: 'title' | 'subtitle',
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    headingFont: ResolvedPdfFont,
    fontRegistry: PdfFontRegistry,
    defaultHeaderFontSize: number
): ResolvedDocumentHeading | undefined {
    if (!text) {
        return undefined;
    }

    return {
        text,
        style: resolveHeadingStyle(style, type, params, styleColors, headingFont, fontRegistry, defaultHeaderFontSize),
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
    bodyFont: ResolvedPdfFont | PdfFontFamily,
    headerFont: ResolvedPdfFont | PdfFontFamily,
    styleColors: PdfStyleColors,
    bodyRowIndex: number
): MeasuredRow {
    const isHeader = isHeaderRowType(row.type);
    const rowStyles = getRowStyles(row.type, styleColors, bodyRowIndex);
    const fontRegistry = getFontRegistry(layout);
    const baseFont = resolveFontInput(isHeader ? headerFont : bodyFont, fontRegistry);
    const defaultFontSize = isHeader ? layout.headerFontSize : layout.fontSize;
    const exportDefaultStyle = isHeader ? layout.defaultHeaderStyle : layout.defaultCellStyle;
    const defaultCellStyle = resolveTableCellStyle(
        mergePdfCellStyles(exportDefaultStyle, row.style),
        layout,
        baseFont,
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
            mergePdfCellStyles(exportDefaultStyle, mergePdfCellStyles(row.style, cell.style)),
            layout,
            baseFont,
            rowStyles,
            styleColors,
            defaultFontSize
        );
        applyRowGroupIndent(cell, style, layout);

        const width = getSpanWidth(layout.columnWidths, columnIndex, span);
        const contentWidth = Math.max(width - style.padding.left - style.padding.right, 0);
        const image = cell.image
            ? constrainImageWidth(getImageRegistry(layout).resolve(cell.image), contentWidth)
            : undefined;
        const imageOnRight = image ? isImageOnRight(image, style, cell.value) : undefined;
        const imageWidth = image ? image.width + (cell.value ? image.gap : 0) : 0;
        const textWidth = Math.max(contentWidth - imageWidth, 0);
        const lines = measureTextLines(cell.value, textWidth, style);
        const lineCount = Math.max(lines.length, 1);
        const contentHeight = Math.max(lineCount * style.lineHeight, image?.height ?? 0);
        const requiredHeight = contentHeight + style.padding.top + style.padding.bottom;
        const rowSpan = Math.max(Math.floor(cell.mergeDown ?? 0) + 1, 1);
        const covered = !!cell.covered;
        if (!covered && rowSpan === 1) {
            naturalHeight = Math.max(naturalHeight, requiredHeight);
        }
        measuredCells.push({
            columnIndex,
            span,
            width,
            style,
            lines,
            hyperlink: cell.hyperlink,
            image,
            imageOnRight,
            rowSpan,
            requiredHeight,
            covered,
        });
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
 * Resolve vertical header spans after all participating row heights are known.
 * @param rows - Consecutive measured header rows.
 */
export function resolveHeaderRowSpans(rows: MeasuredRow[]): boolean {
    let hasSpans = false;
    for (const row of rows) {
        for (const cell of row.cells) {
            if (!cell.covered && cell.rowSpan > 1) {
                hasSpans = true;
                break;
            }
        }
    }
    if (!hasSpans) {
        return false;
    }

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        // spanned header rows render at exactly their resolved height, so the
        // painted block always matches the pagination budget.
        row.spanned = true;
        if (row.fixedHeight) {
            continue;
        }
        for (const cell of row.cells) {
            if (cell.covered || cell.rowSpan <= 1) {
                continue;
            }
            const endRowIndex = Math.min(rowIndex + cell.rowSpan, rows.length);
            let spanHeight = 0;
            for (let index = rowIndex; index < endRowIndex; index++) {
                spanHeight += rows[index].rowHeight;
            }
            if (spanHeight < cell.requiredHeight) {
                const topUpPerRow = (cell.requiredHeight - spanHeight) / (endRowIndex - rowIndex);
                for (let index = rowIndex; index < endRowIndex; index++) {
                    rows[index].rowHeight += topUpPerRow;
                }
            }
        }
    }

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        for (const cell of rows[rowIndex].cells) {
            if (cell.covered || cell.rowSpan <= 1) {
                continue;
            }
            const endRowIndex = Math.min(rowIndex + cell.rowSpan, rows.length);
            let renderHeight = 0;
            for (let index = rowIndex; index < endRowIndex; index++) {
                renderHeight += rows[index].rowHeight;
            }
            cell.renderHeight = renderHeight;
        }
    }
    return true;
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

    if (row.fixedHeight || row.spanned) {
        const height = Math.min(row.rowHeight, availableHeight);
        return {
            row,
            cells: row.cells.map((cell) => ({
                measurement: cell,
                // spanning cells lay their text out over the full span, not one row.
                lines: constrainLinesToHeight(cell, cell.renderHeight ?? height),
                showImage: !!cell.image,
            })),
            height,
            complete: true,
        };
    }

    // each cell advances independently so shorter cells can finish before the tallest cell.
    const offsets = state?.lineOffsets ?? row.cells.map(() => 0);
    const imageRendered = state?.imageRendered ?? row.cells.map(() => false);
    const remainingHeight = getRemainingRowHeight(row, offsets, imageRendered);
    if (remainingHeight <= availableHeight) {
        return {
            row,
            cells: row.cells.map((cell, index) => ({
                measurement: cell,
                lines: cell.lines.slice(offsets[index] ?? 0),
                showImage: !!cell.image && !imageRendered[index],
            })),
            height: remainingHeight,
            complete: true,
        };
    }

    const nextOffsets = [...offsets];
    const nextImageRendered = [...imageRendered];
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
        const showImage = !!cell.image && !imageRendered[i];

        if (lineCount > 0) {
            progressed = true;
            nextOffsets[i] = offset + lineCount;
            fragmentHeight = Math.max(
                fragmentHeight,
                cell.style.padding.top + lineCount * cell.style.lineHeight + cell.style.padding.bottom
            );
        }
        if (showImage) {
            progressed = true;
            nextImageRendered[i] = true;
            fragmentHeight = Math.max(
                fragmentHeight,
                Math.min(cell.style.padding.top + cell.image!.height + cell.style.padding.bottom, availableHeight)
            );
        }
        cells.push({ measurement: cell, lines, showImage });
    }

    if (!progressed) {
        return undefined;
    }

    // the row is complete only after every cell has consumed all of its measured lines.
    const complete = row.cells.every(
        (cell, index) => (nextOffsets[index] ?? 0) >= cell.lines.length && (!cell.image || nextImageRendered[index])
    );
    return {
        row,
        cells,
        height: fragmentHeight,
        complete,
        nextState: complete ? undefined : { lineOffsets: nextOffsets, imageRendered: nextImageRendered },
    };
}

/**
 * Clamp the remainder of a row into the available space, keeping at least one line per cell.
 * Used as a last resort when no complete line fits even on a fresh page, so rows are never
 * silently dropped from the export.
 * @param row - Measured source row.
 * @param state - Previous fragment continuation state.
 * @param availableHeight - Vertical page space available in points.
 * @returns A complete fragment constrained to the available space.
 */
export function measureClampedRowFragment(
    row: MeasuredRow,
    state: RowFragmentState | undefined,
    availableHeight: number
): MeasuredRowFragment {
    const offsets = state?.lineOffsets ?? row.cells.map(() => 0);
    const imageRendered = state?.imageRendered ?? row.cells.map(() => false);
    const resolvedAvailableHeight = Number.isFinite(availableHeight) ? Math.max(availableHeight, 0) : 0;
    const cells: MeasuredRowFragment['cells'] = [];

    for (let i = 0, len = row.cells.length; i < len; i++) {
        const cell = row.cells[i];
        const remainingLines = cell.lines.slice(offsets[i] ?? 0);
        const contentHeight = Math.max(resolvedAvailableHeight - cell.style.padding.top - cell.style.padding.bottom, 0);
        const lineLimit = Math.max(Math.floor(contentHeight / cell.style.lineHeight), 1);
        cells.push({
            measurement: cell,
            lines: constrainTextLines(remainingLines, lineLimit, cell.style, getAvailableTextWidth(cell)),
            showImage: !!cell.image && !imageRendered[i],
        });
    }

    return {
        row,
        cells,
        height: Math.min(
            getRemainingRowHeight(row, offsets, imageRendered),
            Math.max(resolvedAvailableHeight, row.minimumHeight)
        ),
        complete: true,
    };
}

/**
 * Measure exported text and padding to obtain intrinsic column widths.
 * Only cells that overlap a column consuming auto widths are measured, so exports
 * using fixed or grid widths avoid a full extra measurement pass.
 * @param rows - Serialised table rows.
 * @param layout - Base layout and typography options.
 * @param bodyFont - Default body font family.
 * @param headerFont - Default header font family.
 * @param styleColors - Resolved document colours.
 * @param autoWidthColumns - Flags marking rendered columns that consume auto widths.
 * @returns Intrinsic widths in points; only flagged columns hold meaningful values.
 */
export function getAutoColumnWidths(
    rows: PdfRow[],
    layout: LayoutOptions,
    bodyFont: ResolvedPdfFont | PdfFontFamily,
    headerFont: ResolvedPdfFont | PdfFontFamily,
    styleColors: PdfStyleColors,
    autoWidthColumns: boolean[]
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

        const isHeader = isHeaderRowType(row.type);
        const rowStyles = getRowStyles(row.type, styleColors, bodyRowIndex);
        const fontRegistry = getFontRegistry(layout);
        const baseFont = resolveFontInput(isHeader ? headerFont : bodyFont, fontRegistry);
        const defaultFontSize = isHeader ? layout.headerFontSize : layout.fontSize;
        const exportDefaultStyle = isHeader ? layout.defaultHeaderStyle : layout.defaultCellStyle;

        let columnIndex = 0;
        for (const cell of row.cells) {
            const span = Math.min((cell.mergeAcross ?? 0) + 1, layout.columnCount - columnIndex);
            if (span <= 0) {
                break;
            }

            if (!spanIncludesAutoWidthColumn(autoWidthColumns, columnIndex, span)) {
                columnIndex += span;
                continue;
            }

            const style = resolveTableCellStyle(
                mergePdfCellStyles(exportDefaultStyle, mergePdfCellStyles(row.style, cell.style)),
                layout,
                baseFont,
                rowStyles,
                styleColors,
                defaultFontSize
            );
            applyRowGroupIndent(cell, style, layout);

            const image = cell.image ? getImageRegistry(layout).resolve(cell.image) : undefined;
            const textWidth = getIntrinsicTextWidth(cell.value ?? '', style);
            const imageWidth = image ? image.width + (cell.value ? image.gap : 0) : 0;
            const requiredWidth = textWidth + imageWidth + style.padding.left + style.padding.right;
            const currentWidth = getSpanWidth(widths, columnIndex, span);
            if (requiredWidth > currentWidth) {
                const additionalWidth = (requiredWidth - currentWidth) / span;
                for (let i = columnIndex; i < columnIndex + span; i++) {
                    widths[i] += additionalWidth;
                }
            }
            columnIndex += span;
        }

        if (row.type === 'BODY') {
            bodyRowIndex += 1;
        }
    }

    return widths;
}

function spanIncludesAutoWidthColumn(autoWidthColumns: boolean[], startIndex: number, span: number): boolean {
    for (let i = startIndex, end = startIndex + span; i < end; i++) {
        if (autoWidthColumns[i]) {
            return true;
        }
    }
    return false;
}

/**
 * Resolve renderable lines for a measured text box.
 * @param value - Raw text value.
 * @param availableWidth - Available text width.
 * @param style - Resolved text style.
 * @returns Permanently constrained text lines.
 */
export function measureTextLines(value: string, availableWidth: number, style: ResolvedCellStyle): string[] {
    const calculateWidth = (text: string) =>
        style.fontRegistry.measureText(text, style.fontSize, style.font, style.direction, style.language);
    let lines: string[];
    if (style.wrapText) {
        lines = wrapText(
            normaliseText(value, style.preserveLineBreaks, !!style.font.trueType),
            availableWidth,
            style.fontSize,
            style.fontFamily,
            style.preserveSpaces,
            calculateWidth
        );
    } else {
        const normalised = normaliseText(value, style.preserveLineBreaks, !!style.font.trueType);
        const sourceLines = style.preserveLineBreaks ? normalised.split('\n') : [normalised];
        lines = [];
        for (const line of sourceLines) {
            lines.push(
                style.overflow === 'clip'
                    ? clipText(line, availableWidth, style.fontSize, style.fontFamily, calculateWidth)
                    : truncateText(line, availableWidth, style.fontSize, style.fontFamily, calculateWidth)
            );
        }
        if (!style.preserveLineBreaks && !lines[0]) {
            lines = [];
        }
    }

    return constrainTextLines(lines, style.maxLines, style, availableWidth);
}

function getRemainingRowHeight(row: MeasuredRow, offsets: number[], imageRendered: boolean[]): number {
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
        if (cell.image && !imageRendered[i]) {
            height = Math.max(height, cell.style.padding.top + cell.image.height + cell.style.padding.bottom);
        }
    }
    return height;
}

function constrainLinesToHeight(cell: MeasuredCell, height: number): string[] {
    const contentHeight = Math.max(height - cell.style.padding.top - cell.style.padding.bottom, 0);
    const lineLimit = Math.floor(contentHeight / cell.style.lineHeight);
    return constrainTextLines(cell.lines, lineLimit, cell.style, getAvailableTextWidth(cell));
}

function getAvailableTextWidth(cell: MeasuredCell): number {
    const contentWidth = cell.width - cell.style.padding.left - cell.style.padding.right;
    const imageWidth = cell.image ? cell.image.width + cell.image.gap : 0;
    return Math.max(contentWidth - imageWidth, 0);
}

/**
 * Limit measured lines to a fixed count and apply the configured overflow marker.
 * @param lines - Previously measured text lines.
 * @param lineLimit - Maximum visible line count.
 * @param style - Resolved text style.
 * @param availableWidth - Available width for the overflow marker.
 * @returns The visible text lines.
 */
export function constrainTextLines(
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
            style.fontFamily,
            (text) => style.fontRegistry.measureText(text, style.fontSize, style.font, style.direction, style.language)
        );
    }
    return visibleLines;
}

/**
 * Resolve whether an image renders on the right of its adjacent text.
 * @param image - Resolved image placement.
 * @param style - Style carrying the requested text direction.
 * @param text - Text used to detect the direction when it is `auto`.
 * @returns `true` when the image belongs on the right.
 */
export function isImageOnRight(
    image: ResolvedPdfImage,
    style: Pick<ResolvedCellStyle, 'direction'>,
    text: string
): boolean {
    const direction =
        style.direction === 'auto' ? resolveBidiCharacters(text, style.direction).direction : style.direction;
    return image.alignment === 'end' ? direction === 'ltr' : direction === 'rtl';
}

function getMinimumRowHeight(rowType: PdfRowType, layout: LayoutOptions): number {
    const isHeader = isHeaderRowType(rowType);
    const defaults = isHeader ? layout.defaultHeaderStyle : layout.defaultCellStyle;
    const fontSize = isHeader ? layout.headerFontSize : layout.fontSize;
    const lineHeight = resolveFiniteNumber(defaults?.lineHeight, fontSize, Number.EPSILON);
    const padding = resolveBoxSpacing(defaults?.padding, {
        top: layout.cellPadding,
        right: layout.cellPadding,
        bottom: layout.cellPadding,
        left: layout.cellPadding,
    });
    return lineHeight + padding.top + padding.bottom;
}

function getImageRegistry(layout: LayoutOptions): PdfImageRegistry {
    // a locally created registry would render XObject names the document never registers.
    if (!layout.imageRegistry) {
        throw new Error('AG Grid: PDF layout options are missing the document image registry.');
    }
    return layout.imageRegistry;
}

function resolveHeadingStyle(
    style: PdfDocumentHeadingStyle | undefined,
    type: 'title' | 'subtitle',
    params: PdfExportParams,
    styleColors: PdfStyleColors,
    headingFont: ResolvedPdfFont,
    fontRegistry: PdfFontRegistry,
    defaultHeaderFontSize: number
): ResolvedCellStyle {
    const defaultHeaderStyle = mergePdfCellStyles(params.defaultCellStyle, params.defaultHeaderStyle);
    const headerFontSize = resolveFiniteNumber(defaultHeaderStyle?.fontSize, defaultHeaderFontSize, Number.EPSILON);
    const defaultFontSize = type === 'title' ? Math.max(headerFontSize + 4, 14) : Math.max(headerFontSize + 1, 11);
    const fontSize = resolveFiniteNumber(style?.fontSize, defaultFontSize, Number.EPSILON);
    const font = fontRegistry.resolve(
        style?.fontFamily,
        style?.fontWeight ?? headingFont.weight,
        style?.fontStyle ?? headingFont.style,
        headingFont.family
    );
    const padding = resolveBoxSpacing(
        style?.padding,
        type === 'title' ? DEFAULT_TITLE_PADDING : DEFAULT_SUBTITLE_PADDING
    );
    const margin = resolveBoxSpacing(style?.margin, type === 'title' ? DEFAULT_TITLE_MARGIN : DEFAULT_SUBTITLE_MARGIN);
    const blendWith = styleColors.pageBackground ?? styleColors.dataBackground;
    const fallbackTextColor = (type === 'title'
        ? (styleColors.headerText ?? styleColors.foreground)
        : styleColors.foreground) ?? {
        r: 0,
        g: 0,
        b: 0,
    };
    const borderColor = resolveOptionalColor(style?.borderColor, undefined, blendWith);

    return {
        fontSize,
        fontFamily: font.family,
        fontWeight: font.weight,
        fontStyle: font.style,
        font,
        fontRegistry,
        direction: style?.direction ?? params.direction ?? 'auto',
        language: style?.language ?? params.language,
        lineHeight: resolveFiniteNumber(
            style?.lineHeight,
            fontRegistry.getNaturalLineHeight(fontSize, font),
            Number.EPSILON
        ),
        maxLines: resolveMaxLines(style?.maxLines),
        overflow: style?.overflow ?? DEFAULT_OVERFLOW,
        alignment: style?.alignment ?? DEFAULT_TITLE_ALIGNMENT,
        alignmentExplicit: style?.alignment != null,
        padding,
        margin,
        textColor: resolveOptionalColor(style?.color, fallbackTextColor, blendWith) ?? fallbackTextColor,
        backgroundColor: resolveOptionalColor(style?.backgroundColor, undefined, blendWith),
        borderColor,
        borderWidth: resolveBorderWidth(style?.borderWidth, borderColor),
        wrapText: style?.wrapText ?? false,
        preserveLineBreaks: style?.preserveLineBreaks ?? style?.wrapText ?? false,
        preserveSpaces: style?.preserveSpaces ?? false,
    };
}

function resolveTableCellStyle(
    style: PdfCellStyle | undefined,
    layout: LayoutOptions,
    inheritedFont: ResolvedPdfFont,
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
    const fontRegistry = getFontRegistry(layout);
    const font = fontRegistry.resolve(
        style?.fontFamily,
        style?.fontWeight ?? inheritedFont.weight,
        style?.fontStyle ?? inheritedFont.style,
        inheritedFont.family
    );
    const blendWith = rowStyles.background ?? styleColors.dataBackground ?? styleColors.pageBackground;
    const fallbackTextColor = rowStyles.text ?? styleColors.foreground ?? { r: 0, g: 0, b: 0 };
    const borderColor = resolveOptionalColor(style?.borderColor, rowStyles.border, blendWith);

    return {
        fontSize,
        fontFamily: font.family,
        fontWeight: font.weight,
        fontStyle: font.style,
        font,
        fontRegistry,
        direction: style?.direction ?? layout.direction ?? 'auto',
        language: style?.language ?? layout.language,
        lineHeight: resolveFiniteNumber(
            style?.lineHeight,
            fontRegistry.getNaturalLineHeight(fontSize, font),
            Number.EPSILON
        ),
        maxLines: resolveMaxLines(style?.maxLines),
        overflow: style?.overflow ?? DEFAULT_OVERFLOW,
        alignment: style?.alignment ?? DEFAULT_CELL_ALIGNMENT,
        alignmentExplicit: style?.alignment != null,
        padding,
        margin: DEFAULT_CELL_MARGIN,
        textColor: resolveOptionalColor(style?.color, fallbackTextColor, blendWith) ?? fallbackTextColor,
        backgroundColor: resolveOptionalColor(style?.backgroundColor, rowStyles.background, blendWith),
        borderColor,
        borderWidth: resolveBorderWidth(style?.borderWidth, borderColor),
        wrapText: style?.wrapText ?? false,
        preserveLineBreaks: style?.preserveLineBreaks ?? style?.wrapText ?? false,
        preserveSpaces: style?.preserveSpaces ?? false,
    };
}

function getIntrinsicTextWidth(value: string, style: ResolvedCellStyle): number {
    const normalised = normaliseText(value, style.preserveLineBreaks, !!style.font.trueType);
    const lines = style.preserveLineBreaks ? normalised.split('\n') : [normalised];
    let width = 0;
    for (const line of lines) {
        width = Math.max(
            width,
            style.fontRegistry.measureText(line, style.fontSize, style.font, style.direction, style.language)
        );
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

function applyRowGroupIndent(cell: PdfRow['cells'][number], style: ResolvedCellStyle, layout: LayoutOptions): void {
    if (cell.elementType !== 'rowgroup' || !cell.groupLevel) {
        return;
    }

    const indent = cell.groupLevel * (layout.rowGroupIndentSize ?? 0);
    const direction =
        style.direction === 'auto' ? resolveBidiCharacters(cell.value, style.direction).direction : style.direction;
    if (direction === 'rtl') {
        style.padding.right += indent;
    } else {
        style.padding.left += indent;
    }
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

function getFontRegistry(layout: LayoutOptions): PdfFontRegistry {
    layout.fontRegistry ??= new PdfFontRegistry(undefined);
    return layout.fontRegistry;
}

function resolveFontInput(font: ResolvedPdfFont | PdfFontFamily, registry: PdfFontRegistry): ResolvedPdfFont {
    return typeof font === 'string' ? registry.resolve(font, undefined, undefined) : font;
}
