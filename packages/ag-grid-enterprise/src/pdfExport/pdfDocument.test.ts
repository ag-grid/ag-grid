import type { AgColumn, PdfExportParams } from 'ag-grid-community';

import { createPdfDocument } from './pdfDocument';
import type { PdfRow } from './pdfSerializingSession';
import {
    columnNeedsAutoWidth,
    getColumnWidths,
    resolvePageSize,
    resolveRequestedColumnWidths,
} from './utils/document/layout';
import type { LayoutOptions } from './utils/document/measurement';
import { getAutoColumnWidths, measureRow, resolveHeaderRowSpans } from './utils/document/measurement';
import { PdfImageRegistry } from './utils/imageRegistry';
import { resolvePdfStyleColors } from './utils/pdfColor';

const stubColumn = (width: number, colKind: AgColumn['colKind'] = 'user'): AgColumn =>
    ({ getActualWidth: () => width, colKind }) as any;

const createRows = (): PdfRow[] => [
    { type: 'HEADER', cells: [{ value: 'Header' }] },
    { type: 'BODY', cells: [{ value: 'Value' }] },
];

const countOccurrences = (value: string, search: string): number => value.split(search).length - 1;

const parseRectangles = (pdf: string): Array<{ x: number; y: number; width: number; height: number }> =>
    [...pdf.matchAll(/(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+) re S/g)].map((match) => ({
        x: Number(match[1]),
        y: Number(match[2]),
        width: Number(match[3]),
        height: Number(match[4]),
    }));

const redPixelPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAAAAAAAAAAEElEQVR4AQEFAPr/AP8gEIAFAQGwAAAAAAAAAABJRU5EAAAAAA==';

const assertRowRectanglesRespectBottomMargin = (pdf: string, bottomMargin: number): void => {
    const rectanglePattern = /(?:^|\n)-?\d+(?:\.\d+)? (-?\d+(?:\.\d+)?) \d+(?:\.\d+)? \d+(?:\.\d+)? re S/g;
    const matches = [...pdf.matchAll(rectanglePattern)];
    expect(matches.length).toBeGreaterThan(0);
    for (const match of matches) {
        expect(Number(match[1])).toBeGreaterThanOrEqual(bottomMargin);
    }
};

describe('createPdfDocument', () => {
    it('resolves the rendered height of vertically spanning header cells', () => {
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [100],
            margin: { top: 36, right: 36, bottom: 36, left: 36 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
            headerRowHeight: 20,
        };
        const rows: PdfRow[] = [
            { type: 'HEADER_GROUPING', cells: [{ value: 'Age', mergeDown: 1 }] },
            { type: 'HEADER', cells: [{ value: '', covered: true }] },
        ];
        const measuredRows = rows.map((row) =>
            measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0)
        );

        resolveHeaderRowSpans(measuredRows);

        expect(measuredRows[0].cells[0].renderHeight).toBe(40);
        expect(measuredRows[1].cells[0].covered).toBe(true);
    });

    it('renders a vertically spanning header as one PDF cell box', () => {
        const rows: PdfRow[] = [
            { type: 'HEADER_GROUPING', cells: [{ value: 'Age', mergeDown: 1 }] },
            { type: 'HEADER', cells: [{ value: '', covered: true }] },
        ];

        for (const repeatHeader of [true, false]) {
            const pdf = createPdfDocument(rows, [stubColumn(100)], { headerRowHeight: 20, repeatHeader });
            expect(pdf).toMatch(/36 -?\d+(?:\.\d+)? 100 40 re S/);
            expect(pdf).not.toMatch(/36 -?\d+(?:\.\d+)? 100 20 re S/);
        }
    });

    it('centres text vertically within a spanning header', () => {
        const rows: PdfRow[] = [
            { type: 'HEADER_GROUPING', cells: [{ value: 'Age', mergeDown: 1 }] },
            { type: 'HEADER', cells: [{ value: '', covered: true }] },
        ];

        const pdf = createPdfDocument(rows, [stubColumn(100)], { headerRowHeight: 20 });

        expect(pdf).toContain('1 0 0 1 40 536.24 Tm (Age) Tj');
    });

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

        expect(getColumnWidths(columns, 2, 500, resolveRequestedColumnWidths(columns, 2, undefined), [40, 80])).toEqual(
            [120, 180]
        );
    });

    it('uses the intrinsic width of the Row Numbers column by default', () => {
        const columns = [stubColumn(60, 'row-number'), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 500, resolveRequestedColumnWidths(columns, 2, undefined), [24, 80])).toEqual(
            [24, 180]
        );
        expect(getColumnWidths(columns, 2, 500, resolveRequestedColumnWidths(columns, 2, 'grid'), [24, 80])).toEqual([
            60, 180,
        ]);
    });

    it('uses intrinsic column widths without stretching them to fill the page when requested', () => {
        const columns = [stubColumn(120), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 500, resolveRequestedColumnWidths(columns, 2, 'auto'), [40, 80])).toEqual([
            40, 80,
        ]);
    });

    it('scales column widths down proportionally when they exceed the page', () => {
        const columns = [stubColumn(120), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 200, resolveRequestedColumnWidths(columns, 2, 'auto'), [100, 300])).toEqual([
            50, 150,
        ]);
    });

    it('supports fixed and per-column export widths', () => {
        const columns = [stubColumn(120), stubColumn(180)];

        expect(getColumnWidths(columns, 2, 500, resolveRequestedColumnWidths(columns, 2, 75), [40, 80])).toEqual([
            75, 75,
        ]);
        expect(
            getColumnWidths(
                columns,
                2,
                500,
                resolveRequestedColumnWidths(columns, 2, ({ index }) => (index === 0 ? 60 : 'grid')),
                [40, 80]
            )
        ).toEqual([60, 180]);
        expect(
            getColumnWidths(
                columns,
                2,
                500,
                resolveRequestedColumnWidths(columns, 2, ({ index }) => (index === 0 ? 60 : undefined)),
                [40, 80]
            )
        ).toEqual([60, 180]);
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

        const widths = getAutoColumnWidths(rows, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), [
            true,
            true,
        ]);

        expect(widths[0]).toBe(24);
        expect(widths[1]).toBeGreaterThan(widths[0]);
    });

    it('only measures content widths for columns that consume them', () => {
        expect(columnNeedsAutoWidth('grid')).toBe(false);
        expect(columnNeedsAutoWidth(120)).toBe(false);
        expect(columnNeedsAutoWidth('auto')).toBe(true);
        expect(columnNeedsAutoWidth(Number.NaN)).toBe(true);

        const rows: PdfRow[] = [{ type: 'BODY', cells: [{ value: '1' }, { value: 'A longer exported value' }] }];
        const layout: LayoutOptions = {
            columnCount: 2,
            columnWidths: [60, 200],
            margin: { top: 36, right: 36, bottom: 36, left: 36 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
        };

        const widths = getAutoColumnWidths(rows, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), [
            true,
            false,
        ]);

        // the unmeasured second column keeps the placeholder minimum width.
        expect(widths[0]).toBe(24);
        expect(widths[1]).toBe(24);
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

    it('embeds and renders a PNG image in a body cell', () => {
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [
                    {
                        value: 'United Kingdom',
                        image: {
                            id: 'flag',
                            base64: redPixelPng,
                            imageType: 'png',
                            width: 18,
                            height: 12,
                            altText: 'United Kingdom flag',
                        },
                    },
                ],
            },
        ];

        const pdf = createPdfDocument(rows, [stubColumn(140)], { columnWidth: 140 });

        expect(pdf).toContain('/XObject << /Im1 ');
        expect(pdf).toContain('/Subtype /Image');
        expect(pdf).toContain('/SMask');
        expect(pdf).toContain('/Im1 Do');
        expect(pdf).toContain(
            '/ActualText <FEFF0055006E00690074006500640020004B0069006E00670064006F006D00200066006C00610067>'
        );
    });

    it('resolves image placement once from the full cell text direction', () => {
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [140],
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
            imageRegistry: new PdfImageRegistry(),
        };
        const image = { id: 'flag', base64: redPixelPng, imageType: 'png' as const, width: 12, height: 12 };
        const rtlRow: PdfRow = { type: 'BODY', cells: [{ value: 'שלום עולם', image }] };
        const ltrRow: PdfRow = { type: 'BODY', cells: [{ value: 'Hello world', image }] };

        const rtlCell = measureRow(rtlRow, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0).cells[0];
        const ltrCell = measureRow(ltrRow, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0).cells[0];

        expect(rtlCell.imageOnRight).toBe(true);
        expect(ltrCell.imageOnRight).toBe(false);
    });

    it('clamps page furniture bands so table content keeps at least half the printable page', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            page: { size: { width: 200, height: 120 }, margin: 10 },
            headerFooterConfig: {
                all: {
                    header: [
                        {
                            image: { id: 'logo', base64: redPixelPng, imageType: 'png', width: 10, height: 500 },
                            position: 'Left',
                        },
                    ],
                },
            },
        });

        expect(countOccurrences(pdf, '(Value) Tj')).toBe(1);
        assertRowRectanglesRespectBottomMargin(pdf, 10);
    });

    it('sizes vertically spanned header cells to match the header block height', () => {
        const rows: PdfRow[] = [
            {
                type: 'HEADER_GROUPING',
                cells: [
                    { value: 'Group', mergeAcross: 1 },
                    { value: 'A much longer spanning header', mergeDown: 1, style: { wrapText: true } },
                ],
            },
            {
                type: 'HEADER',
                cells: [{ value: 'One' }, { value: 'Two' }, { value: '', covered: true }],
            },
            { type: 'BODY', cells: [{ value: '1' }, { value: '2' }, { value: '3' }] },
        ];

        const pdf = createPdfDocument(rows, [stubColumn(60), stubColumn(60), stubColumn(60)], { columnWidth: 60 });

        const spannedColumnX = 36 + 120;
        const headerRects = parseRectangles(pdf)
            .filter((rectangle) => rectangle.x === 36)
            .sort((a, b) => b.y - a.y);
        const spannedRect = parseRectangles(pdf)
            .filter((rectangle) => rectangle.x === spannedColumnX)
            .sort((a, b) => b.height - a.height)[0];

        // the spanned box covers exactly the grouping and header rows, leaving no hole.
        expect(spannedRect.height).toBeCloseTo(headerRects[0].height + headerRects[1].height, 3);
        expect(spannedRect.y).toBeCloseTo(headerRects[1].y, 3);
        assertRowRectanglesRespectBottomMargin(pdf, 36);
    });

    it('repeats spanned header blocks identically on every page', () => {
        const rows: PdfRow[] = [
            {
                type: 'HEADER_GROUPING',
                cells: [
                    { value: 'Group', mergeAcross: 1 },
                    { value: 'Span\nHeader', mergeDown: 1, style: { preserveLineBreaks: true } },
                ],
            },
            {
                type: 'HEADER',
                cells: [{ value: 'One' }, { value: 'Two' }, { value: '', covered: true }],
            },
        ];
        for (let index = 0; index < 20; index++) {
            rows.push({ type: 'BODY', cells: [{ value: `r${index}` }, { value: 'x' }, { value: 'y' }] });
        }

        const pdf = createPdfDocument(rows, [stubColumn(60), stubColumn(60), stubColumn(60)], {
            page: { size: { width: 300, height: 140 }, margin: 10 },
            columnWidth: 60,
        });

        const pageCount = countOccurrences(pdf, '/Type /Page /Parent');
        expect(pageCount).toBeGreaterThan(1);
        expect(countOccurrences(pdf, '(Group) Tj')).toBe(pageCount);
        // both lines of the spanning header survive on every repeated page.
        expect(countOccurrences(pdf, '(Span) Tj')).toBe(pageCount);
        expect(countOccurrences(pdf, '(Header) Tj')).toBe(pageCount);
        const spannedHeights = parseRectangles(pdf)
            .filter((rectangle) => rectangle.x === 130)
            .map((rectangle) => rectangle.height)
            .sort((a, b) => b - a)
            .slice(0, pageCount);
        expect(new Set(spannedHeights).size).toBe(1);
        assertRowRectanglesRespectBottomMargin(pdf, 10);
    });

    it('deduplicates images with the same id across cells and page headers', () => {
        const image = {
            id: 'company-logo',
            base64: redPixelPng,
            imageType: 'png' as const,
            width: 24,
            height: 12,
        };
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [
                    { value: 'First', image },
                    { value: 'Second', image },
                ],
            },
        ];

        const pdf = createPdfDocument(rows, [stubColumn(100), stubColumn(100)], {
            headerFooterConfig: {
                all: {
                    header: [{ image, position: 'Left' }],
                },
            },
        });

        expect(pdf).toContain('/XObject << /Im1 ');
        expect(pdf).not.toContain('/Im2 ');
        expect(countOccurrences(pdf, '/Im1 Do')).toBe(3);
    });

    it('adds URI annotations for linked cell text', () => {
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [{ value: 'AG Grid', hyperlink: 'https://www.ag-grid.com/' }],
            },
        ];

        const pdf = createPdfDocument(rows, [stubColumn(100)], { columnWidth: 100 });

        expect(pdf).toContain('/Type /Annot /Subtype /Link');
        expect(pdf).toContain('/A << /S /URI /URI (https://www.ag-grid.com/) >>');
        expect(pdf).toMatch(/\/Rect \[[\d.]+ [\d.]+ [\d.]+ [\d.]+\]/);
        expect(pdf).toMatch(/\/Annots \[\d+ 0 R\]/);
    });

    it('encodes URI annotations without changing valid percent escapes', () => {
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [
                    { value: 'Existing escape', hyperlink: 'https://example.com/a%20b' },
                    { value: 'Unicode', hyperlink: 'https://example.com/café' },
                    { value: 'Literal percent', hyperlink: 'https://example.com/100%' },
                    {
                        value: 'Malformed Unicode',
                        hyperlink: `https://example.com/${String.fromCharCode(0xd800)}broken`,
                    },
                ],
            },
        ];
        const columns = [stubColumn(100), stubColumn(100), stubColumn(100), stubColumn(100)];

        const pdf = createPdfDocument(rows, columns, { columnWidth: 100 });

        expect(pdf).toContain('/URI (https://example.com/a%20b)');
        expect(pdf).not.toContain('/URI (https://example.com/a%2520b)');
        expect(pdf).toContain('/URI (https://example.com/caf%C3%A9)');
        expect(pdf).toContain('/URI (https://example.com/100%25)');
        expect(pdf).toContain('/URI (https://example.com/%EF%BF%BDbroken)');
    });

    it('adds link annotations to every page containing a linked row fragment', () => {
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [
                    {
                        value: ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', 'Line 6'].join('\n'),
                        hyperlink: 'https://example.com/report',
                        style: { wrapText: true },
                    },
                ],
            },
        ];

        const pdf = createPdfDocument(rows, [stubColumn(80)], {
            page: { size: { width: 120, height: 60 }, margin: 10 },
            columnWidth: 80,
        });

        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBeGreaterThan(1);
        expect(countOccurrences(pdf, '/Annots [')).toBeGreaterThan(1);
        expect(countOccurrences(pdf, '/Subtype /Link')).toBe(6);
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
        const pdf = createPdfDocument(rows, [stubColumn(100)], {
            columnWidth: 100,
            defaultCellStyle: { wrapText: true },
        });
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [100],
            margin: { top: 36, right: 36, bottom: 36, left: 36 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
            defaultCellStyle: { wrapText: true },
        };
        const rowData = measureRow(rows[0], layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(pdf).toContain('(First line) Tj');
        expect(pdf).toContain('(Second line) Tj');
        expect(rowData.rowHeight).toBe(28);
    });

    it('applies line height and max lines while preserving explicit newline boundaries', () => {
        const row: PdfRow = {
            type: 'BODY',
            cells: [
                {
                    value: 'First line\nSecond line\nThird line',
                    style: { wrapText: true, lineHeight: 14, maxLines: 2, overflow: 'clip' },
                },
            ],
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

        const measuredRow = measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(measuredRow.cells[0].lines).toEqual(['First line', 'Second line']);
        expect(measuredRow.rowHeight).toBe(36);
    });

    it('preserves explicit line breaks without wrapping long lines', () => {
        const row: PdfRow = {
            type: 'BODY',
            cells: [
                {
                    value: 'Alpha Beta Gamma\nDelta Epsilon Zeta',
                    style: { preserveLineBreaks: true },
                },
            ],
        };
        const layout: LayoutOptions = {
            columnCount: 1,
            columnWidths: [45],
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
        };

        const measuredRow = measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(measuredRow.cells[0].lines).toHaveLength(2);
        expect(measuredRow.rowHeight).toBe(28);
    });

    it('keeps numeric cells on one line unless wrapping is explicitly enabled', () => {
        const row: PdfRow = {
            type: 'BODY',
            cells: [{ value: '123 456' }, { value: '123 456', style: { wrapText: true } }],
        };
        const layout: LayoutOptions = {
            columnCount: 2,
            columnWidths: [35, 35],
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
        };

        const measuredRow = measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(measuredRow.cells[0].lines).toHaveLength(1);
        expect(measuredRow.cells[1].lines.length).toBeGreaterThan(1);
    });

    it('allows a cell direction to override the export direction', () => {
        const row: PdfRow = {
            type: 'BODY',
            cells: [{ value: 'Inherited' }, { value: 'Detected', style: { direction: 'auto' } }],
        };
        const layout: LayoutOptions = {
            columnCount: 2,
            columnWidths: [100, 100],
            margin: { top: 10, right: 10, bottom: 10, left: 10 },
            drawCellBorders: true,
            fontSize: 10,
            headerFontSize: 11,
            cellPadding: 4,
            direction: 'rtl',
        };

        const measuredRow = measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(measuredRow.cells[0].style.direction).toBe('rtl');
        expect(measuredRow.cells[1].style.direction).toBe('auto');
    });

    it('treats explicit row height as a clipping constraint', () => {
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [{ value: 'First line\nSecond line\nThird line' }],
            },
        ];
        const pdf = createPdfDocument(rows, [stubColumn(100)], {
            columnWidth: 100,
            defaultCellStyle: { wrapText: true },
            rowHeight: 28,
        });

        expect(pdf).toContain('(First line) Tj');
        expect(pdf).toContain('(Second line...) Tj');
        expect(pdf).not.toContain('(Third line) Tj');
        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBe(1);
    });

    it('fragments automatically sized rows without losing wrapped content', () => {
        const values = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', 'Line 6', 'Line 7', 'Line 8'];
        const rows: PdfRow[] = [
            {
                type: 'BODY',
                cells: [
                    {
                        value: values.join('\n'),
                        style: { wrapText: true, backgroundColor: '#ffeeee', borderColor: '#333333' },
                    },
                ],
            },
        ];
        const pdf = createPdfDocument(rows, [stubColumn(80)], {
            page: { size: { width: 120, height: 80 }, margin: 10 },
            columnWidth: 80,
        });

        for (const value of values) {
            expect(countOccurrences(pdf, `(${value}) Tj`)).toBe(1);
        }
        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBe(2);
        expect(countOccurrences(pdf, ' re S')).toBe(2);
        assertRowRectanglesRespectBottomMargin(pdf, 10);
    });

    it('repeats headers only when they fit with the next oversized row fragment', () => {
        const values = [
            'Line 1',
            'Line 2',
            'Line 3',
            'Line 4',
            'Line 5',
            'Line 6',
            'Line 7',
            'Line 8',
            'Line 9',
            'Line 10',
        ];
        const rows: PdfRow[] = [
            { type: 'HEADER', cells: [{ value: 'Header' }] },
            { type: 'BODY', cells: [{ value: values.join('\n'), style: { wrapText: true } }] },
        ];
        const pdf = createPdfDocument(rows, [stubColumn(80)], {
            page: { size: { width: 120, height: 100 }, margin: 10 },
            columnWidth: 80,
            headerRowHeight: 20,
        });

        for (const value of values) {
            expect(countOccurrences(pdf, `(${value}) Tj`)).toBe(1);
        }
        expect(countOccurrences(pdf, '(Header) Tj')).toBe(2);
        assertRowRectanglesRespectBottomMargin(pdf, 10);
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

    it('renders a document subtitle below the title', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            documentTitle: 'Quarterly Results',
            documentSubtitle: 'Prepared for the board',
        });

        expect(pdf).toContain('(Quarterly Results) Tj');
        expect(pdf).toContain('(Prepared for the board) Tj');
        expect(pdf.indexOf('(Quarterly Results) Tj')).toBeLessThan(pdf.indexOf('(Prepared for the board) Tj'));
    });

    it('renders headings on a separate cover page', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            coverPage: true,
            documentTitle: 'Quarterly Results',
            documentSubtitle: 'Prepared for the board',
        });

        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBe(2);
        expect(countOccurrences(pdf, '(Quarterly Results) Tj')).toBe(1);
        expect(countOccurrences(pdf, '(Prepared for the board) Tj')).toBe(1);
        expect(countOccurrences(pdf, '(Header) Tj')).toBe(1);
    });

    it('renders page-specific headers, footers, and placeholders', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            coverPage: true,
            documentTitle: 'Report',
            headerFooterConfig: {
                all: {
                    header: [{ value: 'Standard header', position: 'Center' }],
                    footer: [{ value: 'Page &[Page] of &[Pages]', position: 'Right' }],
                },
                first: {
                    header: [{ value: 'Cover header', position: 'Center' }],
                    footer: [{ value: 'Page &[Page] of &[Pages]', position: 'Right' }],
                },
                even: {
                    header: [{ value: 'Even header', position: 'Center' }],
                    footer: [{ value: '&[Date] &[Time]', position: 'Left' }],
                },
            },
        });

        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBe(2);
        expect(pdf).toContain('(Cover header) Tj');
        expect(pdf).toContain('(Even header) Tj');
        expect(pdf).not.toContain('(Standard header) Tj');
        expect(pdf).toContain('(Page 1 of 2) Tj');
        expect(pdf).not.toContain('&[Date]');
        expect(pdf).not.toContain('&[Time]');
    });

    it('renders a translucent watermark across page content', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            watermark: { text: 'DRAFT' },
        });

        expect(pdf).toContain('/Type /ExtGState /ca 0.12 /CA 0.12 /BM /Normal');
        expect(pdf).toContain('/ExtGState << /GSWatermark');
        expect(pdf).toContain('/Artifact BMC');
        expect(pdf).toContain('/GSWatermark gs');
        expect(pdf).toContain('(DRAFT) Tj');
        expect(pdf).toContain('0.71 -0.71 0.71 0.71');
        expect(pdf.indexOf('(DRAFT) Tj')).toBeGreaterThan(pdf.indexOf('(Header) Tj'));
    });

    it('does not create a transparency resource for opaque watermarks', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            watermark: { text: 'APPROVED', opacity: 1 },
        });

        expect(pdf).toContain('(APPROVED) Tj');
        expect(pdf).not.toContain('/Type /ExtGState');
        expect(pdf).not.toContain('/GSWatermark gs');
    });

    it('renders watermarks only on the selected pages', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            coverPage: true,
            documentTitle: 'Report',
            watermark: { text: 'DRAFT', pages: 'even' },
        });

        expect(countOccurrences(pdf, '/Type /Page /Parent')).toBe(2);
        expect(countOccurrences(pdf, '(DRAFT) Tj')).toBe(1);
    });

    it('omits fully transparent watermarks', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            watermark: { text: 'DRAFT', opacity: 0 },
        });

        expect(pdf).not.toContain('(DRAFT) Tj');
        expect(pdf).not.toContain('/Type /ExtGState');
    });

    it('reserves footer space before rendering table rows', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(80)], {
            page: { size: { width: 120, height: 100 }, margin: 10 },
            columnWidth: 80,
            headerFooterConfig: {
                all: {
                    footer: [{ value: 'Page &[Page]' }],
                },
            },
        });

        assertRowRectanglesRespectBottomMargin(pdf, 27);
    });

    it('preserves explicit title line breaks without enabling wrapping', () => {
        const pdf = createPdfDocument([], [], {
            documentTitle: 'First line\nSecond line',
            documentTitleStyle: { preserveLineBreaks: true, wrapText: false },
        });

        expect(pdf).toMatch(/Tm \(First line\) Tj/);
        expect(pdf).toMatch(/Tm \(Second line\) Tj/);
    });

    it('does not apply default cell text constraints to document headings', () => {
        const pdf = createPdfDocument([], [], {
            documentTitle: 'First line\nSecond line\nThird line',
            documentTitleStyle: { preserveLineBreaks: true },
            defaultCellStyle: { maxLines: 1, overflow: 'clip', lineHeight: 4 },
        });

        expect(pdf).toMatch(/Tm \(First line\) Tj/);
        expect(pdf).toMatch(/Tm \(Second line\) Tj/);
        expect(pdf).toMatch(/Tm \(Third line\) Tj/);
    });

    it('constrains a wrapped document title to the printable page height', () => {
        const title = Array.from({ length: 12 }, (_, index) => `Line ${index + 1}`).join('\n');
        const pdf = createPdfDocument([], [], {
            page: { size: { width: 100, height: 100 }, margin: 10 },
            documentTitle: title,
            documentTitleStyle: {
                borderColor: '#000000',
                borderWidth: 1,
                fontSize: 10,
                lineHeight: 10,
                margin: 0,
                padding: 0,
                wrapText: true,
            },
        });

        expect(pdf).toContain('10 10 80 80 re S');
        expect(pdf).toMatch(/Tm \(Line 8\.\.\.\) Tj/);
        expect(pdf).not.toMatch(/Tm \(Line 9\) Tj/);
    });

    it('rejects unsupported runtime font values', () => {
        const rows = [
            {
                type: 'BODY',
                style: { fontFamily: 'Comic Sans MS' },
                cells: [{ value: 'Value', style: { fontFamily: 'Papyrus' } }],
            },
        ] as unknown as PdfRow[];
        const columns = [stubColumn(100)];
        const params = {
            defaultCellStyle: { fontFamily: 'Comic Sans MS' },
            defaultHeaderStyle: { fontFamily: 'Papyrus' },
            documentTitle: 'Report',
            documentTitleStyle: { fontFamily: 'Wingdings' },
        } as unknown as PdfExportParams;

        expect(() => createPdfDocument(rows, columns, params)).toThrow(
            'PDF font family "Comic Sans MS" is not registered.'
        );
    });

    it('applies default cell styles to body cells and inherits them for headers', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            defaultCellStyle: { fontFamily: 'Times-Roman', fontSize: 9, backgroundColor: '#112233' },
        });

        expect(pdf).toContain('/BaseFont /Times-Roman');
        // headers inherit the body family and keep the derived bold variant.
        expect(pdf).toContain('/BaseFont /Times-Bold');
        // headers inherit the body font size, so both rows render at 9 points.
        expect(countOccurrences(pdf, ' 9 Tf')).toBe(2);
        expect(pdf).toContain('0.067 0.133 0.200 rg');
    });

    it('lets default header styles override inherited cell defaults', () => {
        const pdf = createPdfDocument(createRows(), [stubColumn(100)], {
            defaultCellStyle: { fontSize: 9 },
            defaultHeaderStyle: { fontSize: 14, fontWeight: 'normal' },
        });

        expect(pdf).toContain(' 9 Tf');
        expect(pdf).toContain(' 14 Tf');
        // an explicit normal weight suppresses the derived bold header variant.
        expect(pdf).not.toContain('/BaseFont /Helvetica-Bold');
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

        const rowRenderData = measureRow(row, layout, 'Times-Roman', 'Times-Bold', resolvePdfStyleColors(), 0);
        const pdf = createPdfDocument([row], [stubColumn(100)], {
            defaultCellStyle: { fontFamily: 'Times-Roman' },
            defaultHeaderStyle: { fontFamily: 'Times-Roman' },
        });

        expect(rowRenderData.defaultCellStyle.fontFamily).toBe('Times-Bold');
        expect(pdf).toContain('/BaseFont /Times-Bold');
        expect(pdf).toContain('/F2 10 Tf');
    });

    it('does not emit invalid PDF tokens for malformed runtime values', () => {
        const params = {
            page: { size: { width: Number.NaN, height: Number.POSITIVE_INFINITY }, margin: Number.NaN },
            defaultCellStyle: { fontSize: Number.POSITIVE_INFINITY, padding: Number.NEGATIVE_INFINITY },
            defaultHeaderStyle: { fontSize: Number.NaN },
            rowHeight: Number.NaN,
            colors: {
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
            colors: {
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
            colors: {
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
            page: { size: { width: 200, height: 120 }, orientation: 'landscape', margin: 10 },
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
            page: { size: { width: 200, height: 120 }, orientation: 'landscape', margin: 10 },
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
            page: { size: { width: 200, height: 120 }, orientation: 'landscape', margin: 10 },
            rowHeight: 50,
            headerRowHeight: 60,
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(countOccurrences(pdf, '(Header) Tj')).toBe(1);
        expect(pdf).not.toContain('10 0 180 50 re S');
    });

    it('clamps rows whose single line cannot fit a page instead of dropping them', () => {
        const rows: PdfRow[] = [
            { type: 'BODY', cells: [{ value: 'Oversized', style: { wrapText: true, lineHeight: 100 } }] },
        ];
        const pdf = createPdfDocument(rows, [stubColumn(80)], {
            page: { size: { width: 120, height: 60 }, margin: 10 },
            columnWidth: 80,
        });

        expect(countOccurrences(pdf, '(Oversized) Tj')).toBe(1);
    });

    it('rejects custom page sizes with an invalid dimension instead of mixing in defaults', () => {
        expect(resolvePageSize({ width: 0, height: 500 }, 'portrait')).toEqual({ width: 595.28, height: 841.89 });
        expect(resolvePageSize({ width: 500, height: Number.NaN }, 'portrait')).toEqual({
            width: 595.28,
            height: 841.89,
        });
    });

    it('does not emit a blank leading page when the first row is taller than the page content area', () => {
        const rows: PdfRow[] = [{ type: 'BODY', cells: [{ value: 'Oversized' }] }];
        const columns = [stubColumn(100)];
        const params: PdfExportParams = {
            page: { size: { width: 100, height: 100 }, margin: 10 },
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

        const rowRenderData = measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

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

        const rowRenderData = measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(rowRenderData.cells[0].style.padding.left).toBe(28);
    });

    it('indents RTL row-group cells from the right edge', () => {
        const row: PdfRow = {
            type: 'BODY',
            cells: [{ value: 'مجموعة متداخلة', elementType: 'rowgroup', groupLevel: 2 }],
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
            direction: 'rtl',
        };

        const rowRenderData = measureRow(row, layout, 'Helvetica', 'Helvetica-Bold', resolvePdfStyleColors(), 0);

        expect(rowRenderData.cells[0].style.padding.left).toBe(4);
        expect(rowRenderData.cells[0].style.padding.right).toBe(28);
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
            colors: {
                dataBackgroundColor: '#ff0000',
                borderColor: '#00ff00',
            },
        };

        const pdf = createPdfDocument(rows, columns, params);

        expect(pdf).not.toContain('1.000 0.000 0.000 rg');
        expect(pdf).not.toContain('0.000 1.000 0.000 RG');
    });
});
