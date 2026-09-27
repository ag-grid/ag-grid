import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

describe('Excel export of spanning cells', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ExcelExportModule] });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a span past the last exported column merges only up to it, as the grid draws it', async () => {
        const api = gridsManager.createGrid('excel-col-span', {
            columnDefs: [
                { field: 'a', colSpan: (params) => (params.node?.rowIndex === 0 ? Infinity : 1) },
                { field: 'b', colSpan: (params) => (params.node?.rowIndex === 1 ? 5 : 1) },
                { field: 'c' },
            ],
            rowData: [
                { a: 'a0', b: 'b0', c: 'c0' },
                { a: 'a1', b: 'b1', c: 'c1' },
            ],
        });

        api.exportDataAsExcel();
        const workbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
            type: 'array',
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        expect({
            merges: (worksheet['!merges'] ?? []).map(XLSX.utils.encode_range),
            rows: XLSX.utils.sheet_to_json(worksheet, { header: 1 }),
        }).toEqual({
            merges: ['A2:C2', 'B3:C3'],
            rows: [['A', 'B', 'C'], ['a0'], ['a1', 'b1']],
        });
    });
});
