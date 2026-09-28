import { TestGridsManager, objectUrls } from 'ag-test-utils';
import * as XLSX from 'xlsx';

import type { ExcelExportParams, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

describe('Excel export', () => {
    const gridsManager = new TestGridsManager({ modules: [ClientSideRowModelModule, ExcelExportModule] });

    beforeEach(() => {
        objectUrls.init();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const exportSheet = async (api: GridApi, params?: ExcelExportParams) => {
        api.exportDataAsExcel(params);
        const workbook = XLSX.read(new Uint8Array(await (await objectUrls.pullBlob()).arrayBuffer()), {
            type: 'array',
        });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        return {
            merges: (worksheet['!merges'] ?? []).map(XLSX.utils.encode_range),
            rows: XLSX.utils.sheet_to_json(worksheet, { header: 1 }),
        };
    };

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

        expect(await exportSheet(api)).toEqual({
            merges: ['A2:C2', 'B3:C3'],
            rows: [['A', 'B', 'C'], ['a0'], ['a1', 'b1']],
        });
    });

    test('a span over a column left out of the export, or from a hidden column, merges no exported column', async () => {
        const api = gridsManager.createGrid('excel-col-span-column-keys', {
            columnDefs: [
                { field: 'h', hide: true, colSpan: () => 2 },
                { field: 'a', colSpan: () => 2 },
                { field: 'b' },
                { field: 'c' },
            ],
            rowData: [{ h: 'h0', a: 'a0', b: 'b0', c: 'c0' }],
        });

        expect({
            columnKeys: await exportSheet(api, { columnKeys: ['a', 'c'] }),
            hidden: await exportSheet(api, { columnKeys: ['h', 'a', 'b', 'c'] }),
        }).toEqual({
            columnKeys: {
                merges: [],
                rows: [
                    ['A', 'C'],
                    ['a0', 'c0'],
                ],
            },
            hidden: {
                merges: ['B2:C2'],
                rows: [
                    ['H', 'A', 'B', 'C'],
                    ['h0', 'a0', undefined, 'c0'],
                ],
            },
        });
    });

    test('a pinned span merges only up to its pinned lane, so the cells past the lane are exported', async () => {
        const api = gridsManager.createGrid('excel-col-span-pinned', {
            columnDefs: [
                { field: 'a', pinned: 'left', colSpan: () => 3 },
                { field: 'b', pinned: 'left' },
                { field: 'c' },
                { field: 'd' },
            ],
            rowData: [{ a: 'a0', b: 'b0', c: 'c0', d: 'd0' }],
        });

        expect(await exportSheet(api)).toEqual({
            merges: ['A2:B2'],
            rows: [
                ['A', 'B', 'C', 'D'],
                ['a0', undefined, 'c0', 'd0'],
            ],
        });
    });
});
