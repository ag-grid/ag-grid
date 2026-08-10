import type { AgColumn, PdfExportParams } from 'ag-grid-community';

import type { PdfRow } from './pdfSerializingSession';
import {
    columnNeedsAutoWidth,
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
    resolveDocumentHeading,
    resolveHeaderRowSpans,
} from './utils/document/measurement';
import { resolveFiniteNumber, resolveOptionalFiniteNumber } from './utils/document/numbers';
import { getPageDateTime, getPageFurnitureForPage, resolvePageFurnitureConfig } from './utils/document/pageFurniture';
import type { ResolvedPageFurniture } from './utils/document/pageFurniture';
import {
    renderDocumentHeading,
    renderMeasuredRows,
    renderPageFurniture,
    renderRowFragment,
    renderWatermark,
} from './utils/document/render';
import { fmt } from './utils/document/text';
import { resolveWatermark, shouldRenderWatermark } from './utils/document/watermark';
import { PdfFontRegistry } from './utils/fontRegistry';
import { PdfImageRegistry } from './utils/imageRegistry';
import { formatColor, resolvePdfStyleColors } from './utils/pdfColor';
import type { PdfLinkAnnotation, PdfPageContent } from './utils/pdfObjectStore';
import { buildPdf } from './utils/pdfObjectStore';
import { mergePdfCellStyles } from './utils/styles';

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
    const fontRegistry = new PdfFontRegistry(params.fonts);
    const imageRegistry = new PdfImageRegistry();

    const columnCount = columnsToExport.length || Math.max(getMaxColumnCount(rows), 1);
    const availableWidth = Math.max(pageSize.width - margin.left - margin.right, 0);

    const defaultCellStyle = params.defaultCellStyle;
    // header defaults inherit cell defaults, with header values taking precedence.
    const defaultHeaderStyle = mergePdfCellStyles(defaultCellStyle, params.defaultHeaderStyle);

    const fontSize = resolveFiniteNumber(defaultCellStyle?.fontSize, DEFAULTS.fontSize, Number.EPSILON);
    const headerFontSize = resolveFiniteNumber(defaultHeaderStyle?.fontSize, DEFAULTS.headerFontSize, Number.EPSILON);
    const repeatHeader = params.repeatHeader ?? DEFAULTS.repeatHeader;
    const drawCellBorders = params.drawCellBorders ?? DEFAULTS.drawCellBorders;
    const rowGroupIndentSize = resolveFiniteNumber(params.rowGroupIndentSize, DEFAULTS.rowGroupIndentSize);

    const bodyFont = fontRegistry.resolve(
        defaultCellStyle?.fontFamily,
        defaultCellStyle?.fontWeight,
        defaultCellStyle?.fontStyle
    );
    const headerFont = fontRegistry.resolve(
        defaultHeaderStyle?.fontFamily ?? bodyFont.family,
        defaultHeaderStyle?.fontWeight ?? 700,
        defaultHeaderStyle?.fontStyle ?? bodyFont.style,
        bodyFont.family
    );
    const titleData = resolveDocumentHeading(
        params.documentTitle,
        params.documentTitleStyle,
        'title',
        params,
        styleColors,
        headerFont,
        fontRegistry,
        DEFAULTS.headerFontSize
    );
    const subtitleData = resolveDocumentHeading(
        params.documentSubtitle,
        params.documentSubtitleStyle,
        'subtitle',
        params,
        styleColors,
        bodyFont,
        fontRegistry,
        DEFAULTS.headerFontSize
    );
    const documentTitle = titleData?.text ?? '';
    const pageFurnitureConfig = resolvePageFurnitureConfig(
        params.headerFooterConfig,
        params,
        styleColors,
        bodyFont,
        fontRegistry,
        imageRegistry
    );
    const pageDateTime = getPageDateTime(new Date(), params.language);
    const watermark = resolveWatermark(params, pageSize, styleColors, bodyFont, fontRegistry);

    const headerRows = getRepeatableHeaderRows(rows);

    const sizingLayout: LayoutOptions = {
        columnCount,
        columnWidths: getGridColumnWidths(columnsToExport, columnCount),
        margin,
        drawCellBorders,
        fontSize,
        headerFontSize,
        cellPadding: DEFAULTS.cellPadding,
        defaultCellStyle,
        defaultHeaderStyle,
        rowHeight: resolveOptionalFiniteNumber(params.rowHeight, Number.EPSILON),
        headerRowHeight: resolveOptionalFiniteNumber(params.headerRowHeight, Number.EPSILON),
        rowGroupIndentSize,
        fontRegistry,
        language: params.language,
        direction: params.direction,
        imageRegistry,
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
    const headerBlockHasSpans = resolveHeaderRowSpans(measuredHeaderRows);

    let repeatedHeaderHeight = 0;
    for (const headerRow of measuredHeaderRows) {
        repeatedHeaderHeight += headerRow.rowHeight;
    }

    const pages: PdfPageContent[] = [];
    const furnitureByPage: ResolvedPageFurniture[] = [];
    let pageParts: string[] = [];
    let pageAnnotations: PdfLinkAnnotation[] = [];
    let currentPageNumber = 0;
    let currentPageFurniture: ResolvedPageFurniture = {
        header: [],
        footer: [],
        headerHeight: 0,
        footerHeight: 0,
    };
    let currentLayout = layout;
    let currentPageContentHeight = Math.max(pageSize.height - margin.top - margin.bottom, 0);
    let cursorY = pageSize.height - margin.top;
    let hasPageContent = false;

    const markPageContentIfRendered = (previousPartCount: number): void => {
        if (pageParts.length > previousPartCount) {
            hasPageContent = true;
        }
    };

    const startPage = (includeHeaders: boolean) => {
        if (hasPageContent) {
            pages.push({ content: pageParts.join('\n'), annotations: pageAnnotations });
            furnitureByPage.push(currentPageFurniture);
        }

        currentPageNumber += 1;
        currentPageFurniture = getPageFurnitureForPage(pageFurnitureConfig, currentPageNumber);
        // tall furniture (for example a large header logo) must not consume the whole content area.
        const furnitureBudget = Math.max((pageSize.height - margin.top - margin.bottom) / 2, 0);
        const furnitureHeight = currentPageFurniture.headerHeight + currentPageFurniture.footerHeight;
        if (furnitureHeight > furnitureBudget) {
            const furnitureScale = furnitureBudget / furnitureHeight;
            currentPageFurniture = {
                ...currentPageFurniture,
                headerHeight: currentPageFurniture.headerHeight * furnitureScale,
                footerHeight: currentPageFurniture.footerHeight * furnitureScale,
            };
        }
        currentLayout = {
            ...layout,
            margin: {
                ...layout.margin,
                top: layout.margin.top + currentPageFurniture.headerHeight,
                bottom: layout.margin.bottom + currentPageFurniture.footerHeight,
            },
        };
        currentPageContentHeight = Math.max(
            pageSize.height - currentLayout.margin.top - currentLayout.margin.bottom,
            0
        );
        pageParts = ['0.5 w'];
        pageAnnotations = [];
        hasPageContent = false;
        if (styleColors.pageBackground) {
            pageParts.push(`${formatColor(styleColors.pageBackground)} rg`);
            pageParts.push(`0 0 ${fmt(pageSize.width)} ${fmt(pageSize.height)} re f`);
        }
        cursorY = pageSize.height - currentLayout.margin.top;
        if (currentPageNumber === 1) {
            if (titleData) {
                const previousPartCount = pageParts.length;
                cursorY = renderDocumentHeading(
                    titleData.text,
                    cursorY,
                    pageSize,
                    currentLayout,
                    pageParts,
                    titleData.style,
                    fontRegistry
                );
                markPageContentIfRendered(previousPartCount);
            }
            if (subtitleData) {
                const previousPartCount = pageParts.length;
                cursorY = renderDocumentHeading(
                    subtitleData.text,
                    cursorY,
                    pageSize,
                    currentLayout,
                    pageParts,
                    subtitleData.style,
                    fontRegistry
                );
                markPageContentIfRendered(previousPartCount);
            }
        }

        if (includeHeaders && measuredHeaderRows.length) {
            const previousPartCount = pageParts.length;
            cursorY = renderMeasuredRows(
                measuredHeaderRows,
                cursorY,
                currentLayout,
                pageParts,
                pageAnnotations,
                fontRegistry
            );
            markPageContentIfRendered(previousPartCount);
        }
    };

    startPage(false);
    if (params.coverPage && hasPageContent) {
        startPage(false);
    }

    const getPageContentHeight = (pageNumber: number): number => {
        const furniture = getPageFurnitureForPage(pageFurnitureConfig, pageNumber);
        return Math.max(
            pageSize.height - margin.top - margin.bottom - furniture.headerHeight - furniture.footerHeight,
            0
        );
    };

    const canRepeatHeadersWithFragment = (row: MeasuredRow, state: RowFragmentState | undefined): boolean => {
        if (!repeatHeader || row.type !== 'BODY' || !measuredHeaderRows.length) {
            return false;
        }
        const nextPageContentHeight = getPageContentHeight(currentPageNumber + 1);
        const availableAfterHeaders = nextPageContentHeight - repeatedHeaderHeight;
        if (!state && row.rowHeight <= nextPageContentHeight && row.rowHeight > availableAfterHeaders) {
            return false;
        }
        return availableAfterHeaders > 0 && !!measureRowFragment(row, state, availableAfterHeaders);
    };

    for (const row of measuredRows) {
        if (row === measuredHeaderRows[0] && (repeatHeader || headerBlockHasSpans)) {
            // vertical spans cannot straddle a page break, so keep the header block together.
            const availableBeforeHeaders = Math.max(cursorY - currentLayout.margin.bottom, 0);
            if (
                hasPageContent &&
                repeatedHeaderHeight > availableBeforeHeaders &&
                repeatedHeaderHeight <= getPageContentHeight(currentPageNumber + 1)
            ) {
                startPage(false);
            }
        }
        let state: RowFragmentState | undefined;
        let complete = false;

        while (!complete) {
            let availableHeight = Math.max(cursorY - currentLayout.margin.bottom, 0);
            const freshPageContentHeight = hasPageContent
                ? getPageContentHeight(currentPageNumber + 1)
                : currentPageContentHeight;
            const freshPageRowHeight = row.fixedHeight
                ? Math.min(row.rowHeight, freshPageContentHeight)
                : row.rowHeight;
            // keep rows whole when they fit on a fresh page; only oversized automatic rows are fragmented.
            const shouldMoveWholeRow =
                !state &&
                hasPageContent &&
                freshPageRowHeight <= freshPageContentHeight &&
                freshPageRowHeight > availableHeight;
            if (shouldMoveWholeRow) {
                startPage(canRepeatHeadersWithFragment(row, state));
                availableHeight = Math.max(cursorY - currentLayout.margin.bottom, 0);
            }

            let fragment = measureRowFragment(row, state, availableHeight);
            if (!fragment && hasPageContent) {
                startPage(canRepeatHeadersWithFragment(row, state));
                availableHeight = Math.max(cursorY - currentLayout.margin.bottom, 0);
                fragment = measureRowFragment(row, state, availableHeight);
            }
            if (!fragment) {
                fragment = measureClampedRowFragment(row, state, availableHeight);
            }

            const previousPartCount = pageParts.length;
            cursorY = renderRowFragment(fragment, cursorY, currentLayout, pageParts, pageAnnotations, fontRegistry);
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
        furnitureByPage.push(currentPageFurniture);
    }

    const totalPages = pages.length;
    for (let index = 0; index < totalPages; index++) {
        if (watermark && shouldRenderWatermark(watermark, index + 1)) {
            const watermarkParts: string[] = [];
            renderWatermark(watermark, pageSize, watermarkParts, fontRegistry);
            pages[index].content += `\n${watermarkParts.join('\n')}`;
        }

        const furniture = furnitureByPage[index];
        const furnitureParts: string[] = [];
        const placeholders = {
            pageNumber: index + 1,
            totalPages,
            ...pageDateTime,
        };
        renderPageFurniture(
            furniture.header,
            pageSize.height - margin.top,
            furniture.headerHeight,
            pageSize,
            layout,
            furnitureParts,
            placeholders,
            fontRegistry
        );
        renderPageFurniture(
            furniture.footer,
            margin.bottom + furniture.footerHeight,
            furniture.footerHeight,
            pageSize,
            layout,
            furnitureParts,
            placeholders,
            fontRegistry
        );
        if (furnitureParts.length) {
            pages[index].content += `\n${furnitureParts.join('\n')}`;
        }
    }

    return buildPdf(
        pages,
        pageSize,
        fontRegistry.getUsedFonts(),
        documentTitle,
        params.language,
        watermark?.graphicsState ? [watermark.graphicsState] : [],
        imageRegistry.getResources()
    );
}
