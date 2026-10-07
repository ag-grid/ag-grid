import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
import { ScrollApiModule, enableDevValidations } from 'ag-grid-community';
import {
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelMergeTransactionsModule,
    ServerSideRowModelModule,
} from 'ag-grid-enterprise';

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

interface Row {
    id: string | number;
    value: string;
}

interface Outcome {
    rows: { id: string | undefined; data: unknown }[];
    results: ServerSideTransactionResult[];
    flushedResultsLength: number;
}

describe('SSRM merged async transactions', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelApiModule,
            ScrollApiModule,
            ServerSideRowModelModule,
            ServerSideRowModelMergeTransactionsModule,
            RowGroupingModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    const INITIAL: Row[] = Array.from({ length: 5 }, (_, i) => ({ id: i, value: `Row ${i}` }));

    function collectRows(api: GridApi) {
        const rows: Outcome['rows'] = [];
        api.forEachNode((node) => rows.push({ id: node.id, data: node.data }));
        return rows;
    }

    async function createFlatGrid(merge: boolean, extra: Partial<GridOptions> = {}) {
        const api = gridsManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideMergeAsyncTransactions: merge,
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    params.success({
                        rowData: INITIAL.slice(params.request.startRow, params.request.endRow),
                        rowCount: INITIAL.length,
                    });
                },
            },
            ...extra,
        });
        await waitForEvent('firstDataRendered', api);
        return api;
    }

    async function applyAsync(api: GridApi, transactions: ServerSideTransaction[]): Promise<Outcome> {
        const results: ServerSideTransactionResult[] = [];
        let flushedResultsLength = -1;
        api.addEventListener('asyncTransactionsFlushed', (event) => {
            flushedResultsLength = event.results.length;
        });
        for (const tx of transactions) {
            api.applyServerSideTransactionAsync(tx, (r) => results.push(r));
        }
        api.flushServerSideAsyncTransactions();
        await vi.waitFor(() => expect(results).toHaveLength(transactions.length));
        return { rows: collectRows(api), results, flushedResultsLength };
    }

    async function compareWithSequential(transactions: ServerSideTransaction[]) {
        const sequential = await applyAsync(await createFlatGrid(false), transactions);
        gridsManager.reset();
        const merged = await applyAsync(await createFlatGrid(true), transactions);

        expect(merged.rows).toEqual(sequential.rows);
        expect(merged.results.map((r) => r.status)).toEqual(sequential.results.map((r) => r.status));
        expect(merged.flushedResultsLength).toBe(transactions.length);
        return merged;
    }

    const NEW = (id: string | number, value: string): Row => ({ id, value });

    test.each<[string, ServerSideTransaction[]]>([
        ['update + update', [{ update: [NEW(1, 'a')] }, { update: [NEW(1, 'b')] }]],
        ['add + update', [{ add: [NEW(50, 'a')] }, { update: [NEW(50, 'b')] }]],
        ['add + remove', [{ add: [NEW(50, 'a')] }, { remove: [NEW(50, 'a')] }]],
        ['update + remove', [{ update: [NEW(1, 'a')] }, { remove: [NEW(1, 'a')] }]],
        ['remove + add appends the new node at the end', [{ remove: [NEW(1, 'x')] }, { add: [NEW(1, 'again')] }]],
        ['remove + update', [{ remove: [NEW(1, 'x')] }, { update: [NEW(1, 'a')] }]],
        ['add + add keeps the first data', [{ add: [NEW(50, 'first')] }, { add: [NEW(50, 'second')] }]],
        [
            'interleaved different rows',
            [
                { update: [NEW(0, 'u0')] },
                { add: [NEW('n1', 'n1')] },
                { remove: [NEW(2, 'x')] },
                { update: [NEW(0, 'u0b'), NEW(3, 'u3')] },
                { add: [NEW('n2', 'n2')] },
                { remove: [NEW('n1', 'n1')] },
            ],
        ],
        ['add with addIndex in the middle', [{ add: [NEW('a', 'a')] }, { add: [NEW('b', 'b')], addIndex: 2 }]],
        ['integer-like ids added in non-ascending order', [{ add: [NEW(10, 'ten')] }, { add: [NEW(2, 'two')] }]],
    ])('merged outcome equals sequential outcome: %s', async (_name, transactions) => {
        await compareWithSequential(transactions);
    });

    test('repeated updates to one row each report that row node and leave the latest data', async () => {
        const isApply = vi.fn(() => true);
        const api = await createFlatGrid(true, { isApplyServerSideTransaction: isApply });
        const outcome = await applyAsync(api, [
            { update: [NEW(1, 'v1')] },
            { update: [NEW(1, 'v2')] },
            { update: [NEW(1, 'v3')] },
        ]);

        expect(isApply).toHaveBeenCalledTimes(3);
        expect(api.getRowNode('1')!.data).toEqual(NEW(1, 'v3'));
        expect(outcome.results.map((r) => r.status)).toEqual(['Applied', 'Applied', 'Applied']);
        for (const result of outcome.results) {
            expect(result.update).toHaveLength(1);
            expect(result.update![0]).toBe(api.getRowNode('1'));
        }
    });

    test('add then remove of the same new row reports applied with no nodes for either caller', async () => {
        const api = await createFlatGrid(true);
        const outcome = await applyAsync(api, [{ add: [NEW(50, 'a')] }, { remove: [NEW(50, 'a')] }]);

        expect(outcome.results.map((r) => r.status)).toEqual(['Applied', 'Applied']);
        expect(outcome.results[0].add).toEqual([]);
        expect(outcome.results[1].remove).toEqual([]);
        expect(outcome.flushedResultsLength).toBe(2);
        expect(api.getRowNode('50')).toBeUndefined();
        expect(api.getDisplayedRowCount()).toBe(INITIAL.length);
    });

    test('isApplyServerSideTransaction sees the state from before its batch, and rejected transactions are left out', async () => {
        const seenValues: string[] = [];
        const api = await createFlatGrid(true, {
            isApplyServerSideTransaction: (params) => {
                seenValues.push(params.api.getRowNode('1')!.data.value);
                return params.transaction.update?.[0]?.value !== 'rejected';
            },
        });
        const outcome = await applyAsync(api, [
            { update: [NEW(1, 'first')] },
            { update: [NEW(1, 'rejected')] },
            { update: [NEW(1, 'last')], add: [NEW(50, 'added')] },
        ]);

        expect(seenValues).toEqual(['Row 1', 'Row 1', 'Row 1']);
        expect(outcome.results.map((r) => r.status)).toEqual(['Applied', 'Cancelled', 'Applied']);
        expect(api.getRowNode('1')!.data).toEqual(NEW(1, 'last'));
        expect(api.getRowNode('50')!.data).toEqual(NEW(50, 'added'));
        expect(outcome.flushedResultsLength).toBe(3);
    });

    test('isApplyServerSideTransaction for a later batch sees the results of earlier batches', async () => {
        const seenValues: string[] = [];
        const api = await createFlatGrid(true, {
            isApplyServerSideTransaction: (params) => {
                seenValues.push(params.api.getRowNode('1')!.data.value);
                return true;
            },
        });
        const outcome = await applyAsync(api, [
            { update: [NEW(1, 'first')] },
            { add: [NEW('x', 'x')], addIndex: 0 },
            { update: [NEW(1, 'second')] },
            { update: [NEW(1, 'third')] },
        ]);

        expect(seenValues).toEqual(['Row 1', 'first', 'first', 'first']);
        expect(outcome.results.map((r) => r.status)).toEqual(['Applied', 'Applied', 'Applied', 'Applied']);
        expect(api.getRowNode('1')!.data).toEqual(NEW(1, 'third'));
    });

    test('grouped routes: merged outcome equals sequential outcome including a later root-level group removal', async () => {
        const LEAVES = [
            { id: 'uk-alice', country: 'UK', athlete: 'Alice' },
            { id: 'uk-bob', country: 'UK', athlete: 'Bob' },
            { id: 'us-frank', country: 'US', athlete: 'Frank' },
            { id: 'fr-heidi', country: 'FR', athlete: 'Heidi' },
        ];
        const transactions: ServerSideTransaction[] = [
            { route: ['UK'], update: [{ id: 'uk-alice', country: 'UK', athlete: 'Alice 2' }] },
            { route: ['US'], add: [{ id: 'us-new', country: 'US', athlete: 'New' }] },
            { route: ['UK'], add: [{ id: 'uk-zed', country: 'UK', athlete: 'Zed' }], remove: [LEAVES[1]] },
            { route: ['US'], update: [{ id: 'us-new', country: 'US', athlete: 'New 2' }] },
            { remove: [{ id: 'group-UK', country: 'UK' }] },
            { route: ['UK'], update: [{ id: 'uk-alice', country: 'UK', athlete: 'Alice 3' }] },
        ];

        const run = async (merge: boolean) => {
            const acceptedRoutes: string[] = [];
            const api = gridsManager.createGrid(null, {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
                autoGroupColumnDef: { field: 'athlete' },
                rowModelType: 'serverSide',
                serverSideMergeAsyncTransactions: merge,
                isApplyServerSideTransaction: (params) => {
                    acceptedRoutes.push(params.parentNode.key ?? 'root');
                    return true;
                },
                getRowId: (p) => p.data.id ?? `group-${p.data.country}`,
                serverSideDatasource: {
                    getRows: (params) => {
                        const keys = (params.request.groupKeys ?? []) as string[];
                        const rowData =
                            keys.length === 0
                                ? ['UK', 'US', 'FR'].map((country) => ({ country }))
                                : LEAVES.filter((r) => r.country === keys[0]);
                        params.success({ rowData, rowCount: rowData.length });
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            api.setRowNodeExpanded(api.getRowNode('group-UK')!, true);
            api.setRowNodeExpanded(api.getRowNode('group-US')!, true);
            await waitForNoLoadingRows(api);
            const outcome = await applyAsync(api, transactions);
            await waitForNoLoadingRows(api);
            return { ...outcome, rows: collectRows(api), acceptedRoutes };
        };

        const sequential = await run(false);
        gridsManager.reset();
        const merged = await run(true);

        expect(merged.rows).toEqual(sequential.rows);
        expect(merged.results.map((r) => r.status)).toEqual(sequential.results.map((r) => r.status));
        expect(merged.results.map((r) => r.status)).toEqual([
            'Applied',
            'Applied',
            'Applied',
            'Applied',
            'Applied',
            'StoreNotFound',
        ]);
        expect(sequential.acceptedRoutes).toEqual(['UK', 'US', 'UK', 'US', 'root']);
        expect(merged.acceptedRoutes).toEqual(['UK', 'UK', 'US', 'US', 'root']);
        expect(merged.flushedResultsLength).toBe(transactions.length);
        expect(merged.rows.map((r) => r.id)).not.toContain('group-UK');
    });

    const clientSortOptions = (merge: boolean): GridOptions => ({
        columnDefs: [{ field: 'id' }, { field: 'value', sort: 'asc' }],
        rowModelType: 'serverSide',
        serverSideMergeAsyncTransactions: merge,
        serverSideEnableClientSideSort: true,
        getRowId: (params) => String(params.data.id),
        serverSideDatasource: {
            getRows: (params) => {
                params.success({ rowData: [NEW('A', '1'), NEW('B', '2')], rowCount: 2 });
            },
        },
    });

    test('warns that merging is ignored when client-side sorting is enabled', () => {
        expect(() => gridsManager.createGrid(null, clientSortOptions(true))).toThrow(
            /`serverSideMergeAsyncTransactions` is ignored when `serverSideEnableClientSideSort` is enabled/
        );
    });

    test('client-side sorting keeps the order of tied rows that applying the transactions in turn gives', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [322] });
        const run = async (merge: boolean) => {
            const api = gridsManager.createGrid(null, clientSortOptions(merge));
            await waitForEvent('firstDataRendered', api);
            return applyAsync(api, [{ update: [NEW('A', '3')] }, { update: [NEW('A', '2')] }]);
        };

        const sequential = await run(false);
        gridsManager.reset();
        const merged = await run(true);

        expect(sequential.rows.map((r) => r.id)).toEqual(['B', 'A']);
        expect(merged.rows).toEqual(sequential.rows);
    });

    test('tree data: an update that turns a group into a leaf still applies after earlier child transactions', async () => {
        const ROOT = [
            { id: 'p', group: true, name: 'P' },
            { id: 'q', group: false, name: 'Q' },
        ];
        const CHILDREN = [{ id: 'c1', group: false, name: 'C1' }];
        const transactions: ServerSideTransaction[] = [
            { update: [{ ...ROOT[1], name: 'Q 2' }] },
            { route: ['p'], update: [{ ...CHILDREN[0], name: 'C1 2' }] },
            { update: [{ ...ROOT[0], group: false }] },
        ];

        const run = async (merge: boolean) => {
            const api = gridsManager.createGrid(null, {
                columnDefs: [{ field: 'name' }],
                rowModelType: 'serverSide',
                treeData: true,
                serverSideMergeAsyncTransactions: merge,
                isServerSideGroup: (data) => data.group,
                getServerSideGroupKey: (data) => data.id,
                getRowId: (params) => params.data.id,
                serverSideDatasource: {
                    getRows: (params) => {
                        const rowData = params.request.groupKeys.length === 0 ? ROOT : CHILDREN;
                        params.success({ rowData, rowCount: rowData.length });
                    },
                },
            });
            await waitForEvent('firstDataRendered', api);
            api.setRowNodeExpanded(api.getRowNode('p')!, true);
            await waitForNoLoadingRows(api);
            return applyAsync(api, transactions);
        };

        const sequential = await run(false);
        gridsManager.reset();
        const merged = await run(true);

        const updatedIds = (outcome: Outcome) => outcome.results.map((r) => r.update?.map((node) => node.id));
        expect(updatedIds(sequential)).toEqual([['q'], ['c1'], ['p']]);
        expect(updatedIds(merged)).toEqual(updatedIds(sequential));
        expect(merged.rows).toEqual(sequential.rows);
    });

    test('reports the missing module when the option is enabled without it', () => {
        const createGrid = () =>
            new TestGridsManager({ modules: [ServerSideRowModelApiModule, ServerSideRowModelModule] }).createGrid(
                null,
                {
                    rowModelType: 'serverSide',
                    serverSideMergeAsyncTransactions: true,
                }
            );

        expect(createGrid).toThrow(/ServerSideRowModelMergeTransactionsModule/);
    });
});
