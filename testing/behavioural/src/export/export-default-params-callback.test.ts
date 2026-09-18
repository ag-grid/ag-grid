/**
 * `getDefaultCsvExportParams` / `getDefaultExcelExportParams` / `getDefaultPdfExportParams` — the callback
 * form of the static `default*ExportParams` options.
 *
 * Each test counts the callback's invocations, so a zero count distinguishes "the callback never ran"
 * from "it ran and the merge went the wrong way".
 */
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import type { GridApi } from 'ag-grid-community';
import { ExcelExportModule, PdfExportModule } from 'ag-grid-enterprise';

describe('export default params callback', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, PdfExportModule],
    });

    const columnDefs = [{ field: 'athlete' }, { field: 'country' }];
    const rowData = [{ athlete: 'Amy', country: 'UK' }];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const readBlobAsText = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsText(blob);
        });

    const pdfText = (api: GridApi, params?: Parameters<GridApi['getDataAsPdf']>[0]): Promise<string> =>
        readBlobAsText(api.getDataAsPdf(params)!);

    describe('CSV', () => {
        test('a callback supplied in the initial gridOptions provides the defaults', async () => {
            let calls = 0;
            const api = await gridsManager.createGridAndWait('csv-callback-only', {
                columnDefs,
                rowData,
                getDefaultCsvExportParams: () => {
                    calls++;
                    return { columnSeparator: ';', suppressQuotes: true };
                },
            });

            expect(api.getDataAsCsv()).toBe('Athlete;Country\r\nAmy;UK');
            expect(calls).toBe(1);
        });

        test('merges static defaults, then the callback, then the params passed to the export', async () => {
            const api = await gridsManager.createGridAndWait('csv-merge-order', {
                columnDefs,
                rowData,
                defaultCsvExportParams: { columnSeparator: ';', suppressQuotes: true },
                getDefaultCsvExportParams: () => ({ columnSeparator: '|' }),
            });

            // The callback beat the static option on the shared key, and the static-only key survived.
            expect(api.getDataAsCsv()).toBe('Athlete|Country\r\nAmy|UK');
            // The params passed to the export beat the callback.
            expect(api.getDataAsCsv({ columnSeparator: '#' })).toBe('Athlete#Country\r\nAmy#UK');
        });

        test('re-resolves on every export, picking up an option swapped at runtime', async () => {
            let calls = 0;
            const api = await gridsManager.createGridAndWait('csv-re-evaluated', {
                columnDefs,
                rowData,
                getDefaultCsvExportParams: () => {
                    calls++;
                    return { columnSeparator: ';', suppressQuotes: true };
                },
            });

            expect(calls).toBe(0);

            const first = api.getDataAsCsv();
            api.setGridOption('getDefaultCsvExportParams', () => {
                calls++;
                return { columnSeparator: '|', suppressQuotes: true };
            });
            const second = api.getDataAsCsv();

            expect(first).toBe('Athlete;Country\r\nAmy;UK');
            expect(second).toBe('Athlete|Country\r\nAmy|UK');
            expect(calls).toBe(2);
        });

        test('is unaffected by the Excel callback', async () => {
            let calls = 0;
            const api = await gridsManager.createGridAndWait('csv-cross-wiring', {
                columnDefs,
                rowData,
                getDefaultExcelExportParams: () => {
                    calls++;
                    return { columnWidth: 300 };
                },
            });

            expect(api.getDataAsCsv({ suppressQuotes: true })).toBe('Athlete,Country\r\nAmy,UK');
            expect(calls).toBe(0);
        });
    });

    describe('Excel', () => {
        // `columnWidth` reaches the sheet XML as excel character units: ceil((px - 12) / 7 + 1).
        const width = (px: number): string => `width="${Math.ceil((px - 12) / 7 + 1)}"`;

        // First in this block: the xlsx factory mode is module-global, and `getSheetDataForExcel` leaves it
        // in multi-sheet mode, which makes a later `getDataAsExcel` a no-op.
        test('resolves the callback for both the workbook and the single-sheet APIs', async () => {
            let calls = 0;
            const api = await gridsManager.createGridAndWait('excel-both-apis', {
                columnDefs,
                rowData,
                getDefaultExcelExportParams: () => {
                    calls++;
                    return {};
                },
            });

            api.getDataAsExcel();
            api.getSheetDataForExcel({});

            expect(calls).toBe(2);
        });

        test('a callback supplied in the initial gridOptions provides the defaults', async () => {
            let calls = 0;
            const api = await gridsManager.createGridAndWait('excel-callback-only', {
                columnDefs,
                rowData,
                getDefaultExcelExportParams: () => {
                    calls++;
                    return { columnWidth: 300 };
                },
            });

            expect(api.getSheetDataForExcel({})).toContain(width(300));
            expect(calls).toBe(1);
        });

        test('merges static defaults, then the callback, then the params passed to the export', async () => {
            const api = await gridsManager.createGridAndWait('excel-merge-order', {
                columnDefs,
                rowData,
                defaultExcelExportParams: { columnWidth: 100, headerRowHeight: 55 },
                getDefaultExcelExportParams: () => ({ columnWidth: 300 }),
            });

            const resolved = api.getSheetDataForExcel({});
            // The callback beat the static option on the shared key, and the static-only key survived.
            expect(resolved).toContain(width(300));
            expect(resolved).not.toContain(width(100));
            expect(resolved).toContain('ht="55"');
            // The params passed to the export beat the callback.
            const overridden = api.getSheetDataForExcel({ columnWidth: 500 });
            expect(overridden).toContain(width(500));
            expect(overridden).not.toContain(width(300));
        });

        test('re-resolves on every export', async () => {
            let calls = 0;
            let columnWidth = 300;
            const api = await gridsManager.createGridAndWait('excel-re-evaluated', {
                columnDefs,
                rowData,
                getDefaultExcelExportParams: () => {
                    calls++;
                    return { columnWidth };
                },
            });

            expect(calls).toBe(0);

            const first = api.getSheetDataForExcel({});
            columnWidth = 500;
            const second = api.getSheetDataForExcel({});

            expect(first).toContain(width(300));
            expect(second).toContain(width(500));
            expect(second).not.toContain(width(300));
            expect(calls).toBe(2);
        });
    });

    describe('PDF', () => {
        const A4_PORTRAIT = '/MediaBox [0 0 595.28 841.89]';
        const LETTER_PORTRAIT = '/MediaBox [0 0 612 792]';

        test('a callback supplied in the initial gridOptions provides the defaults', async () => {
            let calls = 0;
            const api = await gridsManager.createGridAndWait('pdf-callback-only', {
                columnDefs,
                rowData,
                getDefaultPdfExportParams: () => {
                    calls++;
                    return { page: { orientation: 'portrait' } };
                },
            });

            expect(await pdfText(api)).toContain(A4_PORTRAIT);
            expect(calls).toBe(1);
        });

        test('re-resolves on every export', async () => {
            let calls = 0;
            let orientation: 'portrait' | 'landscape' = 'portrait';
            const api = await gridsManager.createGridAndWait('pdf-re-evaluated', {
                columnDefs,
                rowData,
                getDefaultPdfExportParams: () => {
                    calls++;
                    return { page: { orientation } };
                },
            });

            expect(calls).toBe(0);

            const first = await pdfText(api);
            orientation = 'landscape';
            const second = await pdfText(api);

            expect(first).toContain(A4_PORTRAIT);
            expect(second).toContain('/MediaBox [0 0 841.89 595.28]');
            expect(second).not.toContain(A4_PORTRAIT);
            expect(calls).toBe(2);
        });

        test('the callback replaces the static page setup rather than merging into it', async () => {
            const api = await gridsManager.createGridAndWait('pdf-shallow-static-layer', {
                columnDefs,
                rowData,
                defaultPdfExportParams: { page: { size: 'Letter', orientation: 'portrait' } },
                getDefaultPdfExportParams: () => ({ page: { orientation: 'portrait' } }),
            });

            const pdf = await pdfText(api);

            expect(pdf).toContain(A4_PORTRAIT);
            expect(pdf).not.toContain('612 792');
        });

        test('the params passed to the export merge into the resolved page setup', async () => {
            const api = await gridsManager.createGridAndWait('pdf-deep-api-layer', {
                columnDefs,
                rowData,
                getDefaultPdfExportParams: () => ({ page: { size: 'Letter' } }),
            });

            const pdf = await pdfText(api, { page: { orientation: 'portrait' } });

            expect(pdf).toContain(LETTER_PORTRAIT);
            expect(pdf).not.toContain('595.28 841.89');
        });
    });
});
