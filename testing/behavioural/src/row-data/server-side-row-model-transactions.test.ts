import type { GridOptions } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';

describe('Server Side Row Model Transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('repeated remove transaction does not remove unrelated rows', async () => {
        const totalRows = 10000;
        const toRemove = 10;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => params.data.id.toString(),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowDataS.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);

        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(100);

        // Remove top toRemove rows
        const rowsToRemove = rowData.slice(0, toRemove);
        api.applyServerSideTransaction({ remove: rowsToRemove });

        expect(api.getDisplayedRowCount()).toBe(100 - toRemove);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(toRemove);

        // Remove the same toRemove rows again (they are already removed)
        api.applyServerSideTransaction({ remove: rowsToRemove });

        expect(api.getDisplayedRowCount()).toBe(100 - toRemove);

        expect(api.getDisplayedRowAtIndex(99 - toRemove)?.data.id).toBe(99);
    }, 30000);
});
