import { describe, expect, it } from '@jest/globals';

import type { AgColumn, PdfExportParams } from 'ag-grid-community';

import { createPdfDocument } from './pdfDocument';
import type { PdfRow } from './pdfSerializingSession';

const stubColumn = (width: number): AgColumn => ({ getActualWidth: () => width }) as any;

const createRows = (): PdfRow[] => [
    { type: 'HEADER', cells: [{ value: 'Header' }] },
    { type: 'BODY', cells: [{ value: 'Value' }] },
];

describe('createPdfDocument', () => {
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
});
