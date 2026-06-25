import type { AgColumn, PdfExportParams } from 'ag-grid-community';

import { createPdfDocument } from './pdfDocument';
import type { PdfRow } from './pdfSerializingSession';
import { resolvePageSize } from './utils/document/layout';
import type { LayoutOptions } from './utils/document/render';
import { createRowRenderData } from './utils/document/render';
import { resolvePdfStyleColors } from './utils/pdfColor';

const stubColumn = (width: number): AgColumn => ({ getActualWidth: () => width }) as any;

const createRows = (): PdfRow[] => [
    { type: 'HEADER', cells: [{ value: 'Header' }] },
    { type: 'BODY', cells: [{ value: 'Value' }] },
];

const countOccurrences = (value: string, search: string): number => value.split(search).length - 1;

describe('createPdfDocument', () => {
    it('normalises named page sizes to the requested orientation', () => {
        expect(resolvePageSize('A4', 'portrait')).toEqual({ width: 595.28, height: 841.89 });
        expect(resolvePageSize('A4', 'landscape')).toEqual({ width: 841.89, height: 595.28 });
    });

    it('normalises custom page sizes to the requested orientation', () => {
        expect(resolvePageSize({ width: 1000, height: 500 }, undefined)).toEqual({ width: 1000, height: 500 });
        expect(resolvePageSize({ width: 1000, height: 500 }, 'portrait')).toEqual({ width: 500, height: 1000 });
        expect(resolvePageSize({ width: 500, height: 1000 }, 'landscape')).toEqual({ width: 1000, height: 500 });
    });

    it('builds a valid PDF envelope', () => {
        const rows = createRows();
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {};

        const pdf = createPdfDocument(rows, columns, params);

        expect(pdf.startsWith('%PDF-1.4')).toBe(true);
        expect(pdf).toContain('xref');
        expect(pdf).toContain('trailer');
        expect(pdf).toContain('startxref');
        expect(pdf).toContain('%%EOF');
        expect(pdf).toContain('/Type /Catalog');
        expect(pdf).toContain('/Type /Page');
    });

    it('includes PDF metadata title when documentTitle is set', () => {
        const rows = createRows();
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            documentTitle: 'PDF Metadata Title',
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(pdf).toContain('/Title (PDF Metadata Title)');
    });

    it('falls back to built-in fonts for unsupported runtime font values', () => {
        const rows = [
            {
                type: 'BODY',
                style: { fontFamily: 'Comic Sans MS' },
                cells: [{ value: 'Value', style: { fontFamily: 'Papyrus' } }],
            },
        ] as unknown as PdfRow[];
        const columns = [stubColumn(100)];
        const params = {
            fontFamily: 'Comic Sans MS',
            headerFontFamily: 'Papyrus',
            documentTitle: {
                data: { value: 'Report' },
                style: { fontFamily: 'Wingdings' },
            },
        } as unknown as PdfExportParams;

        const pdf = createPdfDocument(rows, columns, params);

        expect(pdf).toContain('/BaseFont /Helvetica');
        expect(pdf).toContain('/BaseFont /Helvetica-Bold');
        expect(pdf).toContain('(Report) Tj');
        expect(pdf).toContain('(Value) Tj');
        expect(pdf).not.toContain('Comic Sans MS');
        expect(pdf).not.toContain('Papyrus');
        expect(pdf).not.toContain('Wingdings');
    });

    it('renders srgb header background colours', () => {
        const rows = createRows();
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            pdfStyles: {
                headerBackgroundColor: 'color(srgb 0.2 0.4 0.6)',
            },
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(pdf).toContain('0.200 0.400 0.600 rg');
    });

    it('skips borders when the border colour is transparent', () => {
        const rows = createRows();
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            pdfStyles: {
                borderColor: 'transparent',
            },
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(pdf).not.toContain(' re S');
    });

    it('does not repeat table headers before custom content on a new page', () => {
        const rows: PdfRow[] = [
            { type: 'HEADER', cells: [{ value: 'Header' }] },
            { type: 'BODY', cells: [{ value: 'Value' }] },
            { type: 'CUSTOM', cells: [{ value: 'Appendix' }] },
        ];
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            pageSize: { width: 200, height: 120 },
            pageOrientation: 'landscape',
            margin: 10,
            rowHeight: 50,
            headerRowHeight: 50,
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(countOccurrences(pdf, '(Header) Tj')).toBe(1);
        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBe(2);
    });

    it('repeats table headers when body rows continue on a new page', () => {
        const rows: PdfRow[] = [
            { type: 'CUSTOM', cells: [{ value: 'Introduction' }] },
            { type: 'HEADER', cells: [{ value: 'Header' }] },
            { type: 'BODY', cells: [{ value: 'Value' }] },
        ];
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            pageSize: { width: 200, height: 120 },
            pageOrientation: 'landscape',
            margin: 10,
            rowHeight: 50,
            headerRowHeight: 50,
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(countOccurrences(pdf, '(Header) Tj')).toBe(2);
    });

    it('does not repeat table headers when the repeated headers and body row would overflow', () => {
        const rows: PdfRow[] = [
            { type: 'CUSTOM', cells: [{ value: 'Introduction' }] },
            { type: 'HEADER', cells: [{ value: 'Header' }] },
            { type: 'BODY', cells: [{ value: 'Value' }] },
        ];
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            pageSize: { width: 200, height: 120 },
            pageOrientation: 'landscape',
            margin: 10,
            rowHeight: 50,
            headerRowHeight: 60,
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(countOccurrences(pdf, '(Header) Tj')).toBe(1);
        expect(pdf).not.toContain('10 0 180 50 re S');
    });

    it('does not emit a blank leading page when the first row is taller than the page content area', () => {
        const rows: PdfRow[] = [{ type: 'BODY', cells: [{ value: 'Oversized' }] }];
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            pageSize: { width: 100, height: 100 },
            margin: 10,
            rowHeight: 120,
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(countOccurrences(pdf, '(Oversized) Tj')).toBe(1);
        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBe(1);
    });

    it('uses header row height for styled header rows', () => {
        const row: PdfRow = {
            type: 'HEADER',
            cells: [{ value: 'Header', style: { backgroundColor: '#eeeeee' } }],
        };
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [100],
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
            rowHeight: 24,
            headerRowHeight: 60,
        };

        const rowRenderData = createRowRenderData(
            row,
            layout,
            'Helvetica',
            'Helvetica-Bold',
            resolvePdfStyleColors(),
            0
        );

        expect(rowRenderData.rowHeight).toBe(60);
    });

    it('treats alpha-zero cell colours as transparent', () => {
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [
                    {
                        value: 'Value',
                        style: {
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            borderColor: 'rgb(0 0 0 / 0)',
                        },
                    },
                ],
            },
        ];
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            pdfStyles: {
                dataBackgroundColor: '#ff0000',
                borderColor: '#00ff00',
            },
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(pdf).not.toContain('1.000 0.000 0.000 rg');
        expect(pdf).not.toContain('0.000 1.000 0.000 RG');
    });
});
