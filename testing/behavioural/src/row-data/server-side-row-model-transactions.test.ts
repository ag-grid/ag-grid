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
        const rowData = Array.from({ length: 100 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => params.data.id.toString(),
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);

        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(100);

        // Remove top 10 rows
        const rowsToRemove = rowData.slice(0, 10);
        api.applyServerSideTransaction({ remove: rowsToRemove });

        expect(api.getDisplayedRowCount()).toBe(90);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(10);

        // Remove the same 10 rows again (they are already removed)
        api.applyServerSideTransaction({ remove: rowsToRemove });

        expect(api.getDisplayedRowCount()).toBe(90);

        expect(api.getDisplayedRowAtIndex(89)?.data.id).toBe(99);
    });
});
