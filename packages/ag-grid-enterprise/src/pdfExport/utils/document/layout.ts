import type { AgColumn, PdfExportParams, PdfFontFamily, PdfPageOrientation, PdfPageSize } from 'ag-grid-community';

import type { PdfRow, PdfRowType } from '../../pdfSerializingSession';
import { normalisePdfFontFamily } from '../fonts';

export type ResolvedMargin = { top: number; right: number; bottom: number; left: number };

export type ResolvedPageSize = { width: number; height: number };

const PAGE_SIZES: Record<string, { width: number; height: number }> = {
    A4: { width: 595.28, height: 841.89 },
    Letter: { width: 612, height: 792 },
};

const DEFAULT_PAGE_SIZE: keyof typeof PAGE_SIZES = 'A4';
const DEFAULT_PAGE_ORIENTATION: PdfPageOrientation = 'landscape';
const DEFAULT_MARGIN = 36;

/**
 * Resolve a page size/orientation pair to concrete width/height values.
 * @param pageSize - Named or custom page size.
 * @param orientation - Page orientation.
 * @returns Resolved page dimensions in points.
 */
export function resolvePageSize(
    pageSize: PdfPageSize | undefined,
    orientation: PdfPageOrientation | undefined
): ResolvedPageSize {
    let resolvedSize: ResolvedPageSize;

    if (typeof pageSize === 'string' || pageSize == null) {
        const pageSizeKey =
            typeof pageSize === 'string' && pageSize in PAGE_SIZES
                ? (pageSize as keyof typeof PAGE_SIZES)
                : DEFAULT_PAGE_SIZE;
        resolvedSize = PAGE_SIZES[pageSizeKey];
    } else {
        resolvedSize = pageSize;
    }

    let width = resolvedSize.width;
    let height = resolvedSize.height;

    const resolvedOrientation = orientation ?? DEFAULT_PAGE_ORIENTATION;
    const shouldSwap =
        (resolvedOrientation === 'landscape' && width < height) ||
        (resolvedOrientation === 'portrait' && width > height);
    if (shouldSwap) {
        // normalise dimensions to the requested orientation without blindly rotating custom sizes.
        [width, height] = [height, width];
    }

    return { width, height };
}

/**
 * Resolve margin input to a full four-side margin object.
 * @param margin - Numeric or per-side margin input.
 * @returns Resolved margin object in points.
 */
export function resolveMargin(margin: PdfExportParams['margin']): ResolvedMargin {
    if (typeof margin === 'number') {
        return { top: margin, right: margin, bottom: margin, left: margin };
    }

    const resolvedMargin = margin ?? {};

    return {
        top: resolvedMargin.top ?? DEFAULT_MARGIN,
        right: resolvedMargin.right ?? DEFAULT_MARGIN,
        bottom: resolvedMargin.bottom ?? DEFAULT_MARGIN,
        left: resolvedMargin.left ?? DEFAULT_MARGIN,
    };
}

/**
 * Calculate the widest row span count in the exported data.
 * @param rows - Serialised PDF rows.
 * @returns Maximum rendered column count.
 */
export function getMaxColumnCount(rows: PdfRow[]): number {
    let max = 0;

    for (const row of rows) {
        let count = 0;
        for (const cell of row.cells) {
            count += 1 + (cell.mergeAcross ?? 0);
        }
        max = Math.max(max, count);
    }

    return max;
}

/**
 * Scale grid column widths to fit the available page width.
 * @param columnsToExport - Exported columns in render order.
 * @param columnCount - Total rendered column count, including merged cells.
 * @param availableWidth - Horizontal space available for the table.
 * @returns Width of each rendered column in points.
 */
export function getColumnWidths(columnsToExport: AgColumn[], columnCount: number, availableWidth: number): number[] {
    if (!columnCount) {
        return [];
    }

    const baseWidths: number[] = [];
    let totalColumnWidth = 0;

    for (const column of columnsToExport) {
        totalColumnWidth += column.getActualWidth();
    }

    const defaultWidth = columnsToExport.length ? totalColumnWidth / columnsToExport.length : 100;

    for (let i = 0; i < columnCount; i++) {
        if (i < columnsToExport.length) {
            baseWidths.push(columnsToExport[i].getActualWidth());
        } else {
            baseWidths.push(defaultWidth);
        }
    }

    let totalWidth = 0;

    for (const width of baseWidths) {
        totalWidth += width;
    }

    if (!totalWidth || !availableWidth) {
        const fallbackWidths: number[] = [];
        const fallbackWidth = availableWidth / columnCount;

        while (fallbackWidths.length < columnCount) {
            fallbackWidths.push(fallbackWidth);
        }

        return fallbackWidths;
    }

    const scale = availableWidth / totalWidth;
    const scaledWidths: number[] = [];

    for (const width of baseWidths) {
        scaledWidths.push(width * scale);
    }

    return scaledWidths;
}

/**
 * Build a deterministic map of PDF font names to internal font resource keys.
 * @param bodyFont - Default body font.
 * @param headerFont - Default header font.
 * @param titleFont - Optional document title font.
 * @param rows - Serialised rows that may include custom per-cell fonts.
 * @returns Map of font family to resource key.
 */
export function createFontKeyMap(
    bodyFont: PdfFontFamily,
    headerFont: PdfFontFamily,
    titleFont: PdfFontFamily | undefined,
    rows: PdfRow[]
): Map<PdfFontFamily, string> {
    const fontKeyByFamily = new Map<PdfFontFamily, string>();
    let nextIndex = 1;

    const registerFont = (font?: PdfFontFamily) => {
        if (!font) {
            return;
        }

        const resolvedFont = normalisePdfFontFamily(font);
        if (fontKeyByFamily.has(resolvedFont)) {
            return;
        }

        fontKeyByFamily.set(resolvedFont, `F${nextIndex}`);
        nextIndex += 1;
    };

    registerFont(bodyFont);
    registerFont(headerFont);
    registerFont(titleFont);

    for (const row of rows) {
        registerFont(row.style?.fontFamily);
        for (const cell of row.cells) {
            registerFont(cell.style?.fontFamily);
        }
    }

    return fontKeyByFamily;
}

/**
 * Collect leading header rows that should be repeated on new pages.
 * @param rows - Serialised rows in export order.
 * @returns Header rows occurring before the first body row.
 */
export function getRepeatableHeaderRows(rows: PdfRow[]): PdfRow[] {
    const headerRows: PdfRow[] = [];

    for (const row of rows) {
        if (row.type === 'BODY') {
            break;
        }
        if (row.type === 'HEADER' || row.type === 'HEADER_GROUPING') {
            headerRows.push(row);
        }
    }

    return headerRows;
}

/**
 * Sum the width of a span of adjacent columns.
 * @param widths - Column widths array.
 * @param startIndex - First column index in the span.
 * @param span - Number of columns in the span.
 * @returns Combined width in points.
 */
export function getSpanWidth(widths: number[], startIndex: number, span: number): number {
    let width = 0;

    for (let i = 0; i < span; i++) {
        width += widths[startIndex + i] ?? 0;
    }

    return width;
}

/**
 * Check if a row type should use header defaults.
 * @param rowType - Row type.
 * @returns `true` for header/group-header rows.
 */
export function isHeaderRowType(rowType: PdfRowType): boolean {
    return rowType === 'HEADER' || rowType === 'HEADER_GROUPING';
}
