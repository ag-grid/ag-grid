import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('update columnDefs and rowData together (AG-14611)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('new column getter must not run against stale row data', () => {
        // Initial: rows have shape { a: { value } } and a single column reading a.value
        const rowData1 = [{ a: { value: 1 } }, { a: { value: 2 } }];
        const gridOptions: GridOptions = {
            columnDefs: [{ colId: 'a', valueGetter: ({ data }: any) => data.a.value }],
            rowData: rowData1,
            animateRows: false,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        // Add a column 'b' AND new row data shaped { a, b } in the SAME update.
        // The new column's getter dereferences data.b.value; if it runs against the
        // OLD rowData (which has no `b`) it throws.
        const rowData2 = [
            { a: { value: 10 }, b: { value: 100 } },
            { a: { value: 20 }, b: { value: 200 } },
        ];

        expect(() => {
            api.updateGridOptions({
                columnDefs: [
                    { colId: 'a', valueGetter: ({ data }: any) => data.a.value },
                    { colId: 'b', valueGetter: ({ data }: any) => data.b.value },
                ],
                rowData: rowData2,
            });
        }).not.toThrow();

        const bValues = api.getRenderedNodes().map((n) => api.getCellValue({ rowNode: n, colKey: 'b' }));
        expect(bValues).toEqual([100, 200]);
    });
});
