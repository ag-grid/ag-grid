import type { AgColumn, PdfExportParams, PdfFontFamily } from 'ag-grid-community';

import type { PdfRow } from './pdfSerializingSession';
import {
    columnNeedsAutoWidth,
    createFontKeyMap,
    getColumnWidths,
    getGridColumnWidths,
    getMaxColumnCount,
    getRepeatableHeaderRows,
    resolveMargin,
    resolvePageSize,
    resolveRequestedColumnWidths,
} from './utils/document/layout';
import type { LayoutOptions, MeasuredRow, RowFragmentState } from './utils/document/measurement';
import {
    getAutoColumnWidths,
    measureClampedRowFragment,
    measureRow,
    measureRowFragment,
    resolveDocumentTitle,
} from './utils/document/measurement';
import { resolveFiniteNumber, resolveOptionalFiniteNumber } from './utils/document/numbers';
import { renderDocumentTitle, renderMeasuredRows, renderRowFragment } from './utils/document/render';
import { fmt } from './utils/document/text';
import { normalisePdfFontFamily } from './utils/fonts';
import { formatColor, resolvePdfStyleColors } from './utils/pdfColor';
import type { PdfLinkAnnotation, PdfPageContent } from './utils/pdfObjectStore';
import { buildPdf } from './utils/pdfObjectStore';

const FONT_BOLD_MAP: Record<PdfFontFamily, PdfFontFamily> = {
    Helvetica: 'Helvetica-Bold',
    'Helvetica-Bold': 'Helvetica-Bold',
    'Times-Roman': 'Times-Bold',
    'Times-Bold': 'Times-Bold',
    Courier: 'Courier-Bold',
    'Courier-Bold': 'Courier-Bold',
};

const DEFAULTS = {
    fontSize: 10,
    headerFontSize: 11,
    cellPadding: 4,
    repeatHeader: true,
    drawCellBorders: true,
    rowGroupIndentSize: 12,
};

export function createPdfDocument(rows: PdfRow[], columnsToExport: AgColumn[], params: PdfExportParams): string {
    const pageSetup = params.page;
    const pageSize = resolvePageSize(pageSetup?.size, pageSetup?.orientation);
    const margin = resolveMargin(pageSetup?.margin);
    const styleColors = resolvePdfStyleColors(params.colors);

    const columnCount = columnsToExport.length || Math.max(getMaxColumnCount(rows), 1);
    const availableWidth = Math.max(pageSize.width - margin.left - margin.right, 0);

    const fontSize = resolveFiniteNumber(params.fontSize, DEFAULTS.fontSize, Number.EPSILON);
    const headerFontSize = resolveFiniteNumber(params.headerFontSize, DEFAULTS.headerFontSize, Number.EPSILON);
    const cellPadding = resolveFiniteNumber(params.cellPadding, DEFAULTS.cellPadding);
    const repeatHeader = params.repeatHeader ?? DEFAULTS.repeatHeader;
    const drawCellBorders = params.drawCellBorders ?? DEFAULTS.drawCellBorders;
    const wrapText = params.wrapText ?? false;
    const rowGroupIndentSize = resolveFiniteNumber(params.rowGroupIndentSize, DEFAULTS.rowGroupIndentSize);

    const bodyFont = normalisePdfFontFamily(params.fontFamily);
    const headerFont = normalisePdfFontFamily(params.headerFontFamily, FONT_BOLD_MAP[bodyFont]);
    const titleData = params.documentTitle
        ? resolveDocumentTitle(params.documentTitle, params, styleColors, headerFont, DEFAULTS.headerFontSize)
        : undefined;
    const titleStyle = titleData?.style;
    const documentTitle = titleData?.text ?? '';

    const fontKeyByFamily = createFontKeyMap(bodyFont, headerFont, titleStyle?.fontFamily, rows);
    const titleFontKey = titleStyle ? fontKeyByFamily.get(titleStyle.fontFamily) : undefined;

    const headerRows = repeatHeader ? getRepeatableHeaderRows(rows) : [];

    const sizingLayout: LayoutOptions = {
        columnCount,
        columnWidths: getGridColumnWidths(columnsToExport, columnCount),
        margin,
        drawCellBorders,
        fontSize,
        headerFontSize,
        cellPadding,
        rowHeight: resolveOptionalFiniteNumber(params.rowHeight, Number.EPSILON),
        headerRowHeight: resolveOptionalFiniteNumber(params.headerRowHeight, Number.EPSILON),
        wrapText,
        lineHeight: resolveOptionalFiniteNumber(params.lineHeight, Number.EPSILON),
        maxLines: params.maxLines,
        overflow: params.overflow,
        rowGroupIndentSize,
    };
    const requestedWidths = resolveRequestedColumnWidths(columnsToExport, columnCount, params.columnWidth);
    const autoWidthColumns = requestedWidths.map(columnNeedsAutoWidth);
    // measuring content widths is expensive, so skip the pass when no column consumes them.
    const autoWidths = autoWidthColumns.includes(true)
        ? getAutoColumnWidths(rows, sizingLayout, bodyFont, headerFont, styleColors, autoWidthColumns)
        : undefined;
    const columnWidths = getColumnWidths(columnsToExport, columnCount, availableWidth, requestedWidths, autoWidths);
    const layout: LayoutOptions = { ...sizingLayout, columnWidths };

    const measuredRows: MeasuredRow[] = [];
    const measuredHeaderRows: MeasuredRow[] = [];
    const headerRowSet = new Set(headerRows);
    let measuredBodyRowIndex = 0;
    for (const row of rows) {
        const measuredRow = measureRow(row, layout, bodyFont, headerFont, styleColors, measuredBodyRowIndex);
        measuredRows.push(measuredRow);
        if (headerRowSet.has(row)) {
            measuredHeaderRows.push(measuredRow);
        }
        if (row.type === 'BODY') {
            measuredBodyRowIndex += 1;
        }
    }

    const pageContentHeight = Math.max(pageSize.height - margin.top - margin.bottom, 0);
    let repeatedHeaderHeight = 0;
    for (const headerRow of measuredHeaderRows) {
        repeatedHeaderHeight += headerRow.rowHeight;
    }

    const pages: PdfPageContent[] = [];
    let pageParts: string[] = [];
    let pageAnnotations: PdfLinkAnnotation[] = [];
    let cursorY = pageSize.height - margin.top;
    let isFirstPage = true;
    let hasPageContent = false;

    const markPageContentIfRendered = (previousPartCount: number): void => {
        if (pageParts.length > previousPartCount) {
            hasPageContent = true;
        }
    };

    const startPage = (includeHeaders: boolean) => {
        if (hasPageContent) {
            pages.push({ content: pageParts.join('\n'), annotations: pageAnnotations });
        }

        pageParts = ['0.5 w'];
        pageAnnotations = [];
        hasPageContent = false;
        if (styleColors.pageBackground) {
            pageParts.push(`${formatColor(styleColors.pageBackground)} rg`);
            pageParts.push(`0 0 ${fmt(pageSize.width)} ${fmt(pageSize.height)} re f`);
        }

        cursorY = pageSize.height - margin.top;
        if (isFirstPage) {
            if (titleStyle && titleFontKey && documentTitle) {
                const previousPartCount = pageParts.length;
                cursorY = renderDocumentTitle(
                    documentTitle,
                    cursorY,
                    pageSize,
                    layout,
                    pageParts,
                    titleStyle,
                    titleFontKey
                );
                markPageContentIfRendered(previousPartCount);
            }
            isFirstPage = false;
        }

        if (includeHeaders && measuredHeaderRows.length) {
            const previousPartCount = pageParts.length;
            cursorY = renderMeasuredRows(
                measuredHeaderRows,
                cursorY,
                layout,
                pageParts,
                pageAnnotations,
                fontKeyByFamily
            );
            markPageContentIfRendered(previousPartCount);
        }
    };

    startPage(false);

    const canRepeatHeadersWithFragment = (row: MeasuredRow, state: RowFragmentState | undefined): boolean => {
        if (!repeatHeader || row.type !== 'BODY' || !measuredHeaderRows.length) {
            return false;
        }
        const availableAfterHeaders = pageContentHeight - repeatedHeaderHeight;
        if (!state && row.rowHeight <= pageContentHeight && row.rowHeight > availableAfterHeaders) {
            return false;
        }
        return availableAfterHeaders > 0 && !!measureRowFragment(row, state, availableAfterHeaders);
    };

    for (const row of measuredRows) {
        let state: RowFragmentState | undefined;
        let complete = false;

        while (!complete) {
            let availableHeight = Math.max(cursorY - margin.bottom, 0);
            const freshPageRowHeight = row.fixedHeight ? Math.min(row.rowHeight, pageContentHeight) : row.rowHeight;
            // keep rows whole when they fit on a fresh page; only oversized automatic rows are fragmented.
            const shouldMoveWholeRow =
                !state &&
                hasPageContent &&
                freshPageRowHeight <= pageContentHeight &&
                freshPageRowHeight > availableHeight;
            if (shouldMoveWholeRow) {
                startPage(canRepeatHeadersWithFragment(row, state));
                availableHeight = Math.max(cursorY - margin.bottom, 0);
            }

            let fragment = measureRowFragment(row, state, availableHeight);
            if (!fragment && hasPageContent) {
                startPage(canRepeatHeadersWithFragment(row, state));
                availableHeight = Math.max(cursorY - margin.bottom, 0);
                fragment = measureRowFragment(row, state, availableHeight);
            }
            if (!fragment) {
                fragment = measureClampedRowFragment(row, state, availableHeight);
            }

            const previousPartCount = pageParts.length;
            cursorY = renderRowFragment(fragment, cursorY, layout, pageParts, pageAnnotations, fontKeyByFamily);
            markPageContentIfRendered(previousPartCount);
            complete = fragment.complete;
            state = fragment.nextState;

            if (!complete) {
                startPage(canRepeatHeadersWithFragment(row, state));
            }
        }
    }

    if (hasPageContent || !pages.length) {
        pages.push({ content: pageParts.join('\n'), annotations: pageAnnotations });
    }

    if (!pages.length) {
        pages.push({ content: '', annotations: [] });
    }

    return buildPdf(pages, pageSize, fontKeyByFamily, documentTitle);
}
