import type { GridOptions } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

describe('Server Side Row Model Transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
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
        await new GridColumns(api, `repeated remove transaction does not remove unrelated rows setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `repeated remove transaction does not remove unrelated rows setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);

        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(100);

        // Remove top toRemove rows
        const rowsToRemove = rowData.slice(0, toRemove);
        api.applyServerSideTransaction({ remove: rowsToRemove });
        await new GridRows(
            api,
            `repeated remove transaction does not remove unrelated rows after applyServerSideTransaction`
        ).check('skip-snapshot');

        expect(api.getDisplayedRowCount()).toBe(100 - toRemove);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(toRemove);

        // Remove the same toRemove rows again (they are already removed)
        api.applyServerSideTransaction({ remove: rowsToRemove });
        await new GridRows(api).check('skip-snapshot');

        expect(api.getDisplayedRowCount()).toBe(100 - toRemove);

        expect(api.getDisplayedRowAtIndex(99 - toRemove)?.data.id).toBe(99);
    }, 30000);

    test('remove transaction honours supplied rowCount', async () => {
        const totalRows = 100;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => params.data.id.toString(),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `remove transaction honours supplied rowCount setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            └── value "Value" width:200
        `);
        await new GridRows(api, `remove transaction honours supplied rowCount setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);

        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(100);

        api.applyServerSideTransaction({ remove: rowData.slice(0, 2), rowCount: 50 });
        await new GridRows(api).check('skip-snapshot');

        expect(api.getDisplayedRowCount()).toBe(50);
        expect(api.getDisplayedRowAtIndex(0)?.data.id).toBe(2);
    });

    test('removing cached and uncached rows marks non-contiguous rows for refresh', async () => {
        const totalRows = 300;
        const rowData = Array.from({ length: totalRows }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            cacheBlockSize: 100,
            maxBlocksInCache: 2,
            rowBuffer: 0,
            suppressRowVirtualisation: false,
            getRowId: (params: any) => params.data.id.toString(),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `removing cached and uncached rows marks non-contiguous rows for refresh setup`)
            .checkColumns(`
                CENTER
                ├── id "Id" width:200
                └── value "Value" width:200
            `);
        await new GridRows(api, `removing cached and uncached rows marks non-contiguous rows for refresh setup`).check(
            `
                ROOT id:<no-id>
                └── filler id:rowIndex:0
            `
        );

        await waitForEvent('firstDataRendered', api);

        api.ensureIndexVisible(250);
        await waitForEvent('modelUpdated', api);

        expect(api.getRowNode('0')).toBeTruthy();
        expect(api.getRowNode('200')).toBeTruthy();
        expect(api.getRowNode('150')).toBeFalsy();

        api.applyServerSideTransaction({ remove: [rowData[0], rowData[150]] });
        const farRowBeforeSnapshot = api.getRowNode('200');
        const farRowNeedsRefresh = (farRowBeforeSnapshot as any)?.__needsRefreshWhenVisible === true;

        await new GridRows(api).check('skip-snapshot');

        expect(farRowBeforeSnapshot).toBeTruthy();
        expect(farRowNeedsRefresh).toBe(true);
    });

    test('getRowNode does not throw when passed a numeric id', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowData = [
                        { id: 1, value: 'a' },
                        { id: 2, value: 'b' },
                    ];
                    params.success({ rowData, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `getRowNode does not throw when passed a numeric id setup`).checkColumns(`
            CENTER
            └── value "Value" width:200
        `);
        await new GridRows(api, `getRowNode does not throw when passed a numeric id setup`).check(`
            ROOT id:<no-id>
            └── filler id:rowIndex:0
        `);
        await waitForEvent('firstDataRendered', api);

        // Passing a number should not throw, and should find the row via toString coercion
        expect(api.getRowNode(1 as any)).toBeTruthy();
        expect(api.getRowNode(999 as any)).toBeUndefined();
        await new GridRows(api, `getRowNode does not throw when passed a numeric id final state`).check(`
            ROOT id:<no-id>
            ├── LEAF id:1 value:"a"
            └── LEAF id:2 value:"b"
        `);
    });
});
