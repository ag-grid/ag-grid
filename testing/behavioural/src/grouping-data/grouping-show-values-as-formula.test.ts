import type { WorkSheet } from 'xlsx';
import XLSX from 'xlsx';

import type { GridApi, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule, FormulaModule, RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, objectUrls } from '../test-utils';

function transformed(api: GridApi, id: string, colKey: string): any {
    const node = api.getRowNode(id) as IRowNode;
    return api.getCellValue({ rowNode: node, colKey, from: 'transformed' });
}

async function getExcelSheet(blob: Blob): Promise<WorkSheet> {
    const workbook = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
    return workbook.Sheets[workbook.SheetNames[0]];
}

/**
 * A formula column can carry an active Show Values As mode. Excel export uses `useRawFormula`, which sets the
 * value to the formula STRING while the resolved number is held separately — the transform must run on the
 * resolved number, not the formula string.
 */
describe('showValueAs on a formula column', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ExcelExportModule, FormulaModule, RowGroupingModule, ShowValueAsModule],
    });

    beforeEach(() => {
        objectUrls.init();
    });

    afterEach(() => {
        vitest.restoreAllMocks();
        gridsManager.reset();
    });

    test('display applies the transform to the resolved formula value', async () => {
        const api = gridsManager.createGrid('sva-formula-display', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    allowFormula: true,
                    showValueAs: { type: 'differenceFrom', params: { base: { value: 100 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: '=300' }, // resolves to 300 → 300 - 100 = 200
                { id: '2', country: 'B', amount: 250 }, // 250 - 100 = 150
            ],
        });

        // The transform runs on the resolved formula value (300 → 200), not the formula string.
        expect(transformed(api, '1', 'amount')).toBe(200); // =300 → 300 - 100
        expect(transformed(api, '2', 'amount')).toBe(150); // 250 - 100

        await new GridRows(api, 'formula display transform').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├── LEAF id:1 row-number:"1" country:"A" amount:200
            └── LEAF id:2 row-number:"2" country:"B" amount:150
        `);
    });

    test('Excel export (useRawFormula) transforms the resolved value, not the formula string', async () => {
        const api = gridsManager.createGrid('sva-formula-excel', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    allowFormula: true,
                    showValueAs: { type: 'differenceFrom', params: { base: { value: 100 } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: '=300' },
                { id: '2', country: 'B', amount: 250 },
            ],
        });

        api.exportDataAsExcel({ fileName: 'sva-formula.xlsx' });
        const sheet = await getExcelSheet(await objectUrls.pullBlob());

        // Row 1 is the header; column B is `amount`. The transform ran on the resolved value (300 → 200),
        // not on the raw formula string '=300' (which would coerce to null/blank).
        expect(sheet['B2']?.v).toBe(200);
        expect(sheet['B3']?.v).toBe(150);
    });
});
