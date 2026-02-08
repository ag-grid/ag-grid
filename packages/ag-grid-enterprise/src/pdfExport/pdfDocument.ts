import type { AgColumn, PdfExportParams, PdfFontFamily } from 'ag-grid-community';

import type { PdfRow } from './pdfSerializingSession';
import {
    createFontKeyMap,
    getColumnWidths,
    getMaxColumnCount,
    getRepeatableHeaderRows,
    resolveMargin,
    resolvePageSize,
} from './utils/document/layout';
import type { LayoutOptions } from './utils/document/render';
import {
    createRowRenderData,
    renderDocumentTitle,
    renderRow,
    renderRows,
    resolveDocumentTitle,
} from './utils/document/render';
import { fmt, normaliseText } from './utils/document/text';
import { formatColor, resolvePdfStyleColors } from './utils/pdfColor';
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
};

export function createPdfDocument(rows: PdfRow[], columnsToExport: AgColumn[], params: PdfExportParams): string {
    const pageSize = resolvePageSize(params.pageSize, params.pageOrientation);
    const margin = resolveMargin(params.margin);
    const styleColors = resolvePdfStyleColors(params.pdfStyles);

    const columnCount = Math.max(columnsToExport.length, getMaxColumnCount(rows), 1);
    const availableWidth = Math.max(pageSize.width - margin.left - margin.right, 0);
    const columnWidths = getColumnWidths(columnsToExport, columnCount, availableWidth);

    const fontSize = params.fontSize ?? DEFAULTS.fontSize;
    const headerFontSize = params.headerFontSize ?? DEFAULTS.headerFontSize;
    const cellPadding = params.cellPadding ?? DEFAULTS.cellPadding;
    const repeatHeader = params.repeatHeader ?? DEFAULTS.repeatHeader;
    const drawCellBorders = params.drawCellBorders ?? DEFAULTS.drawCellBorders;

    const bodyFont = params.fontFamily ?? 'Helvetica';
    const headerFont = params.headerFontFamily ?? FONT_BOLD_MAP[bodyFont];
    const titleData = params.documentTitle
        ? resolveDocumentTitle(params.documentTitle, params, styleColors, headerFont, DEFAULTS.headerFontSize)
        : undefined;
    const documentTitle = titleData?.text ? normaliseText(titleData.text) : '';
    const titleStyle = titleData?.style;

    const fontKeyByFamily = createFontKeyMap(bodyFont, headerFont, titleStyle?.fontFamily, rows);
    const titleFontKey = titleStyle ? fontKeyByFamily.get(titleStyle.fontFamily) : undefined;

    const headerRows = repeatHeader ? getRepeatableHeaderRows(rows) : [];

    const layout: LayoutOptions = {
        columnCount,
        columnWidths,
        margin,
        drawCellBorders,
        fontSize,
        headerFontSize,
        cellPadding,
        rowHeight: params.rowHeight,
        headerRowHeight: params.headerRowHeight,
    };

    const pages: string[] = [];
    let pageParts: string[] = [];
    let cursorY = pageSize.height - margin.top;
    let isFirstPage = true;

    const startPage = (includeHeaders: boolean) => {
        if (pageParts.length) {
            pages.push(pageParts.join('\n'));
        }

        pageParts = ['0.5 w'];
        if (styleColors.pageBackground) {
            pageParts.push(`${formatColor(styleColors.pageBackground)} rg`);
            pageParts.push(`0 0 ${fmt(pageSize.width)} ${fmt(pageSize.height)} re f`);
        }

        cursorY = pageSize.height - margin.top;
        if (isFirstPage) {
            if (titleStyle && titleFontKey && documentTitle) {
                cursorY = renderDocumentTitle(
                    documentTitle,
                    cursorY,
                    pageSize,
                    layout,
                    pageParts,
                    titleStyle,
                    titleFontKey
                );
            }
            isFirstPage = false;
        }

        if (includeHeaders && headerRows.length) {
            cursorY = renderRows(
                headerRows,
                cursorY,
                layout,
                pageParts,
                bodyFont,
                headerFont,
                styleColors,
                fontKeyByFamily
            );
        }
    };

    startPage(false);

    let bodyRowIndex = 0;
    for (const row of rows) {
        const rowRenderData = createRowRenderData(row, layout, bodyFont, headerFont, styleColors, bodyRowIndex);
        if (cursorY - rowRenderData.rowHeight < margin.bottom) {
            startPage(repeatHeader);
        }

        cursorY = renderRow(
            row,
            cursorY,
            layout,
            pageParts,
            bodyFont,
            headerFont,
            styleColors,
            bodyRowIndex,
            fontKeyByFamily,
            rowRenderData
        );

        if (row.type === 'BODY') {
            bodyRowIndex += 1;
        }
    }

    if (pageParts.length) {
        pages.push(pageParts.join('\n'));
    }

    if (!pages.length) {
        pages.push('');
    }

    return buildPdf(pages, pageSize, fontKeyByFamily, documentTitle);
}
