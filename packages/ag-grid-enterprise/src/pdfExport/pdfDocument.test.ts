import type { AgColumn, PdfExportParams } from 'ag-grid-community';

import { createPdfDocument } from './pdfDocument';
import type { PdfRow } from './pdfSerializingSession';
import { getColumnWidths, resolvePageSize } from './utils/document/layout';
import type { LayoutOptions } from './utils/document/render';
import { createRowRenderData, getAutoColumnWidths } from './utils/document/render';
import { resolvePdfStyleColors } from './utils/pdfColor';

const stubColumn = (width: number, colKind: AgColumn['colKind'] = 'user'): AgColumn =>
    ({ getActualWidth: () => width, colKind }) as any;

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

    it('uses current grid column widths by default', () => {
        const columns = [stubColumn(120), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 500, undefined, [40, 80])).toEqual([120, 180]);
    });

    it('uses the intrinsic width of the Row Numbers column by default', () => {
        const columns = [stubColumn(60, 'row-number'), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 500, undefined, [24, 80])).toEqual([24, 180]);
        expect(getColumnWidths(columns, 2, 500, 'grid', [24, 80])).toEqual([60, 180]);
    });

    it('uses intrinsic column widths without stretching them to fill the page when requested', () => {
        const columns = [stubColumn(120), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 500, 'auto', [40, 80])).toEqual([40, 80]);
    });

    it('scales column widths down proportionally when they exceed the page', () => {
        const columns = [stubColumn(120), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 200, 'auto', [100, 300])).toEqual([50, 150]);
    });

    it('supports fixed and per-column export widths', () => {
        const columns = [stubColumn(120), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 500, 75, [40, 80])).toEqual([75, 75]);
        expect(getColumnWidths(columns, 2, 500, ({ index }) => (index === 0 ? 60 : 'grid'), [40, 80])).toEqual([
            60, 180,
        ]);
        expect(getColumnWidths(columns, 2, 500, ({ index }) => (index === 0 ? 60 : undefined), [40, 80])).toEqual([
            60, 180,
        ]);
    });

    it('keeps short row-number content narrow when auto-sizing columns', () => {
        const rows: PdfRow[] = [
            { type: 'HEADER', cells: [{ value: '#' }, { value: 'Description' }] },
            { type: 'BODY', cells: [{ value: '1' }, { value: 'A longer exported value' }] },
        ];
        const layout: LayoutOptions = {
            columnCount: 2,
            columnWidths: [60, 200],
            margin: { top: 36, right: 36, bottom: 36, left: 36 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
        };

        const widths = getAutoColumnWidths(rows, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors());

        expect(widths[0]).toBe(24);
        expect(widths[1]).toBeGreaterThan(widths[0]);
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

    it('clips rendered text horizontally without clipping descenders', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], { columnWidth: 100 });

        expect(pdf).toContain(' re W n');
        expect(pdf).toContain('q\n');
        expect(pdf).toContain('\nQ');
        expect(pdf).toContain('40 544.28 92 11 re W n');
        expect(pdf).toContain('1 0 0 1 40 546.74 Tm (Header) Tj');
        expect(pdf).toContain('40 526.28 92 10 re W n');
        expect(pdf).toContain('1 0 0 1 40 528.52 Tm (Value) Tj');
    });

    it('preserves wrapped lines and grows the row to fit them', () => {
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [{ value: 'First line\nSecond line' }],
            },
        ];
        const pdf = createPdfDocument(rows, [stubColumn(100)], { columnWidth: 100, wrapText: true });
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [100],
            margin: { top: 36, right: 36, bottom: 36, left: 36 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
            wrapText: true,
        };
        const rowData = createRowRenderData(rows[0], layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(pdf).toContain('(First line) Tj');
        expect(pdf).toContain('(Second line) Tj');
        expect(rowData.rowHeight).toBe(28);
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

    it('applies bold weight to the inherited font family', () => {
        const row: PdfRow = {
            type: 'BODY',
            style: { fontWeight: 'bold' },
            cells: [{ value: 'Value' }],
        };
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [100],
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
        };

        const rowRenderData = createRowRenderData(row, layout, 'Times-Roman', 'Times-Bold', resolvePdfStyleColors(), 0);
        const pdf = createPdfDocument([row], [stubColumn(100)], {
            fontFamily: 'Times-Roman',
            headerFontFamily: 'Times-Roman',
        });

        expect(rowRenderData.defaultCellStyle.fontFamily).toBe('Times-Bold');
        expect(pdf).toContain('/BaseFont /Times-Bold');
        expect(pdf).toContain('/F2 10 Tf');
    });

    it('does not emit invalid PDF tokens for malformed runtime values', () => {
        const params = {
            pageSize: { width: Number.NaN, height: Number.POSITIVE_INFINITY },
            margin: Number.NaN,
            fontSize: Number.POSITIVE_INFINITY,
            headerFontSize: Number.NaN,
            cellPadding: Number.NEGATIVE_INFINITY,
            rowHeight: Number.NaN,
            pdfStyles: {
                headerBackgroundColor: '#ggg',
            },
        } as PdfExportParams;

        const pdf = createPdfDocument(createRows(), [stubColumn(Number.NaN)], params);

        expect(pdf).not.toContain('NaN');
        expect(pdf).not.toContain('Infinity');
        expect(pdf).toContain('/MediaBox [0 0 841.89 595.28]');
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

    it('indents row-group cells using their displayed group level', () => {
        const row: PdfRow = {
            type: 'BODY',
            cells: [{ value: 'Nested group', elementType: 'rowgroup', groupLevel: 2 }],
        };
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [200],
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
            rowGroupIndentSize: 12,
        };

        const rowRenderData = createRowRenderData(
            row,
            layout,
            'Helvetica',
            'Helvetica-Bold',
            resolvePdfStyleColors(),
            0
        );

        expect(rowRenderData.cellStyles[0].padding.left).toBe(28);
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
