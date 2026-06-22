import type { WorkSheet } from 'xlsx';
import XLSX from 'xlsx';

import { CellStyleModule, ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { ExcelExportModule, RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, objectUrls } from '../test-utils';

async function getExcelSheet(blob: Blob): Promise<WorkSheet> {
    const workbook = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
    return workbook.Sheets[workbook.SheetNames[0]];
}

describe('showValuesAs exports the transformed value', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            CellStyleModule,
            ClientSideRowModelModule,
            CsvExportModule,
            ExcelExportModule,
            RowGroupingModule,
            ShowValuesAsModule,
        ],
    });

    beforeEach(() => {
        objectUrls.init();
    });

    afterEach(() => {
        vitest.restoreAllMocks();
        gridsManager.reset();
    });

    test('CSV export emits the transformed percentage, not the raw value', async () => {
        const api = gridsManager.createGrid('sva-csv', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100
            ],
        });

        await new GridColumns(api, 'csv percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'csv percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        const csv = api.getDataAsCsv();
        // Cells carry the transformed percentage (the displayed value), never the raw 25 / 75.
        expect(csv).toContain('25.00%');
        expect(csv).toContain('75.00%');
        expect(csv).not.toMatch(/(^|,)"?25"?(,|$)/m);
    });

    test('Excel export emits the transformed percentage text (like CSV), not the raw fraction', async () => {
        const api = gridsManager.createGrid('sva-excel', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        await new GridColumns(api, 'excel percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'excel percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        api.exportDataAsExcel({ fileName: 'sva.xlsx' });
        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // Row 1 is the header; the amount column (B) holds the transformed percentage as text — the displayed
        // value — matching CSV, not the raw fraction 0.25 / 0.75 (which Excel would render as a bare decimal).
        expect(sheet['B2']?.t).toBe('s');
        expect(sheet['B2']?.v).toBe('25.00%');
        expect(sheet['B3']?.v).toBe('75.00%');
    });

    test('Excel export of a dormant mode writes the displayed #N/A text, matching CSV', async () => {
        const api = gridsManager.createGrid('sva-excel-dormant', {
            columnDefs: [
                { field: 'country' },
                // Parent-row mode on a flat grid is dormant — the cell displays #N/A (value stays raw).
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        // CSV exports the displayed #N/A; Excel must match (not fall through to the raw numeric value).
        expect(api.getDataAsCsv()).toContain('#N/A');

        api.exportDataAsExcel({ fileName: 'sva.xlsx' });
        const sheet = await getExcelSheet(await objectUrls.pullBlob());
        expect(sheet['B2']?.t).toBe('s');
        expect(sheet['B2']?.v).toBe('#N/A');
        expect(sheet['B3']?.v).toBe('#N/A');
    });

    test('Excel export honours transformValues on a non-transformed base (writes the percentage as text)', async () => {
        const api = gridsManager.createGrid('sva-excel-transformvalues', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        // A non-'transformed' base (the committed value) with transformValues still applies the transform and,
        // crucially, writes it as text ('s') — not the raw fraction with a numeric type.
        api.exportDataAsExcel({ fileName: 'sva.xlsx', valueFrom: 'batch', transformValues: true });
        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        expect(sheet['B2']?.t).toBe('s');
        expect(sheet['B2']?.v).toBe('25.00%');
        expect(sheet['B3']?.v).toBe('75.00%');
    });

    test('a cell carrying an excelStyles dataType still exports the transformed percentage text', async () => {
        const api = gridsManager.createGrid('sva-excel-styled', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal', cellClass: 'amountStyle' },
            ],
            excelStyles: [{ id: 'amountStyle', dataType: 'String' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        api.exportDataAsExcel({ fileName: 'sva.xlsx' });
        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // The style sets a dataType, but the cell still holds the displayed percentage text — not the raw fraction
        // 0.25 / 0.75 (which would leak through the createCell substitution that a styled dataType bypasses).
        expect(sheet['B2']?.t).toBe('s');
        expect(sheet['B2']?.v).toBe('25.00%');
        expect(sheet['B3']?.v).toBe('75.00%');
    });

    test('a dormant mode exports #N/A consistently whether or not processCellCallback uses params.formatValue', async () => {
        const api = gridsManager.createGrid('sva-csv-dormant', {
            columnDefs: [
                { field: 'country' },
                // Parent-row mode on a flat grid is dormant — the cell displays #N/A (value stays raw).
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        await new GridRows(api, 'csv dormant parent mode').check(`
            ROOT id:ROOT_NODE_ID amount:"#N/A"
            ├── LEAF id:1 country:"A" amount:"#N/A"
            └── LEAF id:2 country:"B" amount:"#N/A"
        `);

        // The default export already emits the dormant #N/A (it formats the displayed value).
        const csv = api.getDataAsCsv();
        expect(csv).toContain('#N/A');
        expect(csv).not.toMatch(/(^|,)"?25"?(,|$)/m);

        // params.formatValue() must agree with that displayed value — not fall back to the raw value.
        const csvViaCallback = api.getDataAsCsv({
            processCellCallback: (params) => params.formatValue(params.value),
        });
        expect(csvViaCallback).toContain('#N/A');
        expect(csvViaCallback).not.toMatch(/(^|,)"?25"?(,|$)/m);
    });
});
