import type { GridOptions } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, waitForEvent } from '../test-utils';
import { waitForNoLoadingRows } from '../test-utils/ssrm-test-utils';

describe('SSRM Client-Side Sorting', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    function getDisplayedValues(api: any, field: string): any[] {
        const values: any[] = [];
        for (let i = 0; i < api.getDisplayedRowCount(); i++) {
            const node = api.getDisplayedRowAtIndex(i);
            if (node && !node.stub) {
                values.push(node.data?.[field]);
            }
        }
        return values;
    }

    test('purge refresh re-sorts rows client-side when serverSideEnableClientSideSort is enabled', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Apply ascending sort on 'value'
        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Verify rows are sorted
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Purge refresh
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Rows should still be sorted after purge refresh
        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
    });

    test('purge refresh re-sorts rows with descending sort', async () => {
        const rowData = [
            { id: '1', name: 'Alice', value: 1 },
            { id: '2', name: 'Bob', value: 2 },
            { id: '3', name: 'Charlie', value: 3 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'desc' }] });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([3, 2, 1]);

        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([3, 2, 1]);
    });

    test('purge refresh does not sort when serverSideEnableClientSideSort is disabled', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: false,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        // Rows stay in server order when client-side sort is disabled
        expect(getDisplayedValues(api, 'value')).toEqual([3, 1, 2]);
    });

    test('non-purge refresh re-sorts rows client-side', async () => {
        const rowData = [
            { id: '1', name: 'Charlie', value: 3 },
            { id: '2', name: 'Alice', value: 1 },
            { id: '3', name: 'Bob', value: 2 },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            serverSideEnableClientSideSort: true,
            getRowId: (params: any) => params.data.id,
            serverSideDatasource: {
                getRows: (params: any) => {
                    params.success({ rowData: [...rowData], rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);

        // Non-purge refresh
        api.refreshServerSide({ purge: false });
        await waitForNoLoadingRows(api);

        expect(getDisplayedValues(api, 'value')).toEqual([1, 2, 3]);
    });
});
