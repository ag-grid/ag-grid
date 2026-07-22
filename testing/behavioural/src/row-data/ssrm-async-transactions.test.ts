import type { GridOptions, ServerSideTransactionResult } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, waitForEvent } from '../test-utils';

/**
 * Characterization (golden-master) tests for AG Grid SSRM ASYNC transactions:
 *   - api.applyServerSideTransactionAsync(...)
 *   - api.flushServerSideAsyncTransactions()
 *   - the isApplyServerSideTransaction grid-option callback (cancel/allow).
 *
 * These tests pin the CURRENT observed behaviour of the grid. Any value asserted
 * here (result `status` strings, displayed counts, ordering, flush timing) is a
 * snapshot of what the grid does today, not a statement of what it ideally should
 * do. If a behaviour that looks like a bug is frozen here, that is intentional:
 * these tests exist to detect unintended change, so update them only when a
 * behavioural change is deliberate.
 */
describe('SSRM Async Transactions (characterization)', () => {
    const gridsManager = new TestGridsManager({
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('applyServerSideTransactionAsync add then flush adds the row', async () => {
        const rowData = Array.from({ length: 10 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `async add setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            └── value "Value" width:200
        `);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(10);

        const results: ServerSideTransactionResult[] = [];
        const flushed = waitForEvent('asyncTransactionsFlushed', api);
        // Async transactions are batched; flush forces synchronous-ish application.
        api.applyServerSideTransactionAsync({ add: [{ id: 100, value: 'Added' }] }, (r) => results.push(r));
        api.flushServerSideAsyncTransactions();
        await flushed;

        expect(api.getDisplayedRowCount()).toBe(11);
        expect(!!api.getRowNode('100')).toBe(true);
        expect(results.length).toBe(1);
        expect(results[0].status).toBe('Applied');

        await new GridRows(api, `async add final`).check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 value:"Row 0"
            ├── LEAF id:1 id:1 value:"Row 1"
            ├── LEAF id:2 id:2 value:"Row 2"
            ├── LEAF id:3 id:3 value:"Row 3"
            ├── LEAF id:4 id:4 value:"Row 4"
            ├── LEAF id:5 id:5 value:"Row 5"
            ├── LEAF id:6 id:6 value:"Row 6"
            ├── LEAF id:7 id:7 value:"Row 7"
            ├── LEAF id:8 id:8 value:"Row 8"
            ├── LEAF id:9 id:9 value:"Row 9"
            └── LEAF id:100 id:100 value:"Added"
        `);
    });

    test('multiple async transactions batched into one flush all apply in order', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `async batch setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            └── value "Value" width:200
        `);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);

        const results: ServerSideTransactionResult[] = [];
        const flushed = waitForEvent('asyncTransactionsFlushed', api);
        api.applyServerSideTransactionAsync({ add: [{ id: 100, value: 'A' }] }, (r) => results.push(r));
        api.applyServerSideTransactionAsync({ add: [{ id: 101, value: 'B' }] }, (r) => results.push(r));
        api.applyServerSideTransactionAsync({ add: [{ id: 102, value: 'C' }] }, (r) => results.push(r));
        api.flushServerSideAsyncTransactions();
        await flushed;

        expect(api.getDisplayedRowCount()).toBe(8);
        expect(results.length).toBe(3);
        expect(results.map((r) => r.status)).toEqual(['Applied', 'Applied', 'Applied']);

        await new GridRows(api, `async batch final`).check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 value:"Row 0"
            ├── LEAF id:1 id:1 value:"Row 1"
            ├── LEAF id:2 id:2 value:"Row 2"
            ├── LEAF id:3 id:3 value:"Row 3"
            ├── LEAF id:4 id:4 value:"Row 4"
            ├── LEAF id:100 id:100 value:"A"
            ├── LEAF id:101 id:101 value:"B"
            └── LEAF id:102 id:102 value:"C"
        `);
    });

    test('applyServerSideTransactionAsync remove then flush removes the row', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `async remove setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            └── value "Value" width:200
        `);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);

        const results: ServerSideTransactionResult[] = [];
        const flushed = waitForEvent('asyncTransactionsFlushed', api);
        api.applyServerSideTransactionAsync({ remove: [{ id: 2 }] }, (r) => results.push(r));
        api.flushServerSideAsyncTransactions();
        await flushed;

        expect(api.getDisplayedRowCount()).toBe(4);
        expect(!!api.getRowNode('2')).toBe(false);
        expect(results.length).toBe(1);
        expect(results[0].status).toBe('Applied');

        await new GridRows(api, `async remove final`).check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 value:"Row 0"
            ├── LEAF id:1 id:1 value:"Row 1"
            ├── LEAF id:3 id:3 value:"Row 3"
            └── LEAF id:4 id:4 value:"Row 4"
        `);
    });

    test('isApplyServerSideTransaction returning false cancels the transaction', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            // Cancel every async transaction.
            isApplyServerSideTransaction: () => false,
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `async cancel setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            └── value "Value" width:200
        `);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);

        const results: ServerSideTransactionResult[] = [];
        const flushed = waitForEvent('asyncTransactionsFlushed', api);
        api.applyServerSideTransactionAsync({ add: [{ id: 100, value: 'Blocked' }] }, (r) => results.push(r));
        api.flushServerSideAsyncTransactions();
        await flushed;

        // Cancelled transaction leaves the rows unchanged.
        expect(api.getDisplayedRowCount()).toBe(5);
        expect(!!api.getRowNode('100')).toBe(false);
        expect(results.length).toBe(1);
        expect(results[0].status).toBe('Cancelled');

        await new GridRows(api, `async cancel final`).check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:0 value:"Row 0"
            ├── LEAF id:1 id:1 value:"Row 1"
            ├── LEAF id:2 id:2 value:"Row 2"
            ├── LEAF id:3 id:3 value:"Row 3"
            └── LEAF id:4 id:4 value:"Row 4"
        `);
    });

    test('async transaction targeting an unknown route reports StoreNotFound', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await new GridColumns(api, `async route setup`).checkColumns(`
            CENTER
            ├── id "Id" width:200
            └── value "Value" width:200
        `);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);

        const results: ServerSideTransactionResult[] = [];
        const flushed = waitForEvent('asyncTransactionsFlushed', api);
        api.applyServerSideTransactionAsync({ route: ['does-not-exist'], add: [{ id: 100, value: 'X' }] }, (r) =>
            results.push(r)
        );
        api.flushServerSideAsyncTransactions();
        await flushed;

        // Unknown route: nothing changes at root, and the callback reports the failure status.
        expect(api.getDisplayedRowCount()).toBe(5);
        expect(!!api.getRowNode('100')).toBe(false);
        expect(results.length).toBe(1);
        expect(results[0].status).toBe('StoreNotFound');
    });

    test('flush emits asyncTransactionsFlushed even when nothing applies, without a data change', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);

        const results: ServerSideTransactionResult[] = [];
        const flushed = waitForEvent('asyncTransactionsFlushed', api);
        // Unknown route: the transaction resolves to StoreNotFound, so nothing applies.
        api.applyServerSideTransactionAsync({ route: ['does-not-exist'], add: [{ id: 100, value: 'X' }] }, (r) =>
            results.push(r)
        );
        api.flushServerSideAsyncTransactions();
        await flushed;

        expect(results.length).toBe(1);
        expect(results[0].status).toBe('StoreNotFound');
        // Nothing applied: the displayed rows are untouched.
        expect(api.getDisplayedRowCount()).toBe(5);
        expect(!!api.getRowNode('100')).toBe(false);
    });

    test('the result callback is deferred to a later task, not invoked synchronously during flush', async () => {
        const rowData = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide' as const,
            getRowId: (params: any) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params: any) => {
                    const rowDataS = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: rowDataS, rowCount: rowData.length });
                },
            },
        };

        const api = gridsManager.createGrid(null, gridOptions);
        await waitForEvent('firstDataRendered', api);
        expect(api.getDisplayedRowCount()).toBe(5);

        const results: ServerSideTransactionResult[] = [];
        const called = new Promise<void>((resolve) => {
            api.applyServerSideTransactionAsync({ add: [{ id: 100, value: 'Added' }] }, (r) => {
                results.push(r);
                resolve();
            });
        });
        api.flushServerSideAsyncTransactions();

        // The transaction has already been applied synchronously by the flush (the row is present),
        // but the user callback is intentionally deferred to a later task.
        expect(!!api.getRowNode('100')).toBe(true);
        expect(results.length).toBe(0);

        await called;
        expect(results.length).toBe(1);
        expect(results[0].status).toBe('Applied');
    });
});
