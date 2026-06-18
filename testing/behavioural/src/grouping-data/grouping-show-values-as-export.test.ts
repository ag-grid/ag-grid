import type { WorkSheet } from 'xlsx';
import XLSX from 'xlsx';

import { ClientSideRowModelModule, CsvExportModule } from 'ag-grid-community';
import { ExcelExportModule, RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, objectUrls } from '../test-utils';

async function getExcelSheet(blob: Blob): Promise<WorkSheet> {
    const workbook = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
    return workbook.Sheets[workbook.SheetNames[0]];
}

describe('showValueAs exports the transformed value', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, RowGroupingModule, ShowValueAsModule],
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
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 }, // grand total 100
            ],
        });

        await new GridColumns(api, 'csv percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
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

    test('Excel export emits the transformed value (the fraction), not the raw value', async () => {
        const api = gridsManager.createGrid('sva-excel', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        await new GridColumns(api, 'excel percentOfGrandTotal').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'excel percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 country:"A" amount:"25.00%"
            └── LEAF id:2 country:"B" amount:"75.00%"
        `);

        api.exportDataAsExcel({ fileName: 'sva.xlsx' });
        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // Row 1 is the header; the amount column (B) holds the transformed fraction (0.25 / 0.75), which Excel
        // renders as a percentage via its own cell format — not the raw 25 / 75.
        expect(sheet['B2']?.v).toBe(0.25);
        expect(sheet['B3']?.v).toBe(0.75);
    });
});
