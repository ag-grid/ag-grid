import { TestGridsManager, waitForEvent } from 'ag-test-utils';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridApi, GridOptions, ServerSideTransaction, ServerSideTransactionResult } from 'ag-grid-community';
import { ScrollApiModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

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
        modules: [ServerSideRowModelApiModule, ScrollApiModule, ServerSideRowModelModule, RowGroupingModule],
    });

    afterEach(() => {
        gridsManager.reset();
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

    test('a transaction rejected by isApplyServerSideTransaction is cancelled while the others merge', async () => {
        const api = await createFlatGrid(true, {
            isApplyServerSideTransaction: (params) => params.transaction.update?.[0]?.value !== 'rejected',
        });
        const outcome = await applyAsync(api, [
            { update: [NEW(1, 'first')] },
            { update: [NEW(1, 'rejected')] },
            { update: [NEW(1, 'last')], add: [NEW(50, 'added')] },
        ]);

        expect(outcome.results.map((r) => r.status)).toEqual(['Applied', 'Cancelled', 'Applied']);
        expect(api.getRowNode('1')!.data).toEqual(NEW(1, 'last'));
        expect(api.getRowNode('50')!.data).toEqual(NEW(50, 'added'));
        expect(outcome.flushedResultsLength).toBe(3);
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
        ];

        const run = async (merge: boolean) => {
            const api = gridsManager.createGrid(null, {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
                autoGroupColumnDef: { field: 'athlete' },
                rowModelType: 'serverSide',
                serverSideMergeAsyncTransactions: merge,
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
            return { ...outcome, rows: collectRows(api) };
        };

        const sequential = await run(false);
        gridsManager.reset();
        const merged = await run(true);

        expect(merged.rows).toEqual(sequential.rows);
        expect(merged.results.map((r) => r.status)).toEqual(sequential.results.map((r) => r.status));
        expect(merged.results.map((r) => r.status)).toEqual(['Applied', 'Applied', 'Applied', 'Applied', 'Applied']);
        expect(merged.flushedResultsLength).toBe(transactions.length);
        expect(merged.rows.map((r) => r.id)).not.toContain('group-UK');
    });
});
