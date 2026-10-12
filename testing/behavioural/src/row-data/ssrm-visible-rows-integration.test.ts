import { waitFor } from '@testing-library/dom';
import {
    TestGridsManager,
    mockGridLayout,
    nextAnimationFrame,
    waitForEvent,
    waitForNoLoadingRows,
} from 'ag-test-utils';

import type { GridApi, GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import {
    NumberFilterModule,
    PaginationModule,
    PinnedRowModule,
    RowSelectionModule,
    ScrollApiModule,
    VisibleRowsModule,
} from 'ag-grid-community';
import {
    MasterDetailModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import { createRecorder, range } from './visibleRowsTestUtils';

describe('SSRM subscribeToVisibleRows integration', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            VisibleRowsModule,
            ScrollApiModule,
            NumberFilterModule,
            PaginationModule,
            PinnedRowModule,
            RowSelectionModule,
            RowGroupingModule,
            TreeDataModule,
            MasterDetailModule,
        ],
    });

    let originalGridHeight: number;

    beforeAll(() => {
        // The grid then shows rows 0-5 (rows are 42px high), with row 5 partly visible.
        mockGridLayout.useRealOffsetDimensions = true;
        originalGridHeight = mockGridLayout.gridHeight;
        mockGridLayout.gridHeight = 300;
    });

    afterAll(() => {
        mockGridLayout.useRealOffsetDimensions = false;
        mockGridLayout.gridHeight = originalGridHeight;
    });

    afterEach(() => {
        gridsManager.reset();
    });

    type Row = { id: string; value: number };

    function createRows(count: number): Row[] {
        return Array.from({ length: count }, (_, i) => ({ id: String(i), value: i }));
    }

    function respond(params: IServerSideGetRowsParams, rows: Row[]): void {
        const { startRow = 0, endRow = 0 } = params.request;
        params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
    }

    function createFlatDatasource(rows: () => Row[]): IServerSideDatasource {
        return { getRows: (params) => respond(params, rows()) };
    }

    async function createFlatGrid(options: GridOptions = {}, rowCount = 1000): Promise<GridApi> {
        const rows = createRows(rowCount);
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 100,
            rowBuffer: 5,
            suppressRowVirtualisation: false,
            getRowId: (params) => params.data.id,
            serverSideDatasource: createFlatDatasource(() => rows),
            ...options,
        });
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        return api;
    }

    /** Waits long enough for any batch a change scheduled to have been delivered. */
    async function settle(api: GridApi): Promise<void> {
        await waitForNoLoadingRows(api);
        await nextAnimationFrame();
        await nextAnimationFrame();
    }

    describe('tree data', () => {
        const tree: Record<string, { id: string; group: boolean }[]> = {
            '': [
                { id: 'A', group: true },
                { id: 'B', group: false },
                { id: 'C', group: true },
            ],
            A: [
                { id: 'A1', group: true },
                { id: 'A2', group: false },
            ],
            'A/A1': [{ id: 'A1x', group: false }],
            C: [{ id: 'C1', group: false }],
        };

        function createTreeGrid(options: GridOptions = {}): GridApi {
            return gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }],
                rowModelType: 'serverSide',
                treeData: true,
                isServerSideGroup: (data) => data.group,
                getServerSideGroupKey: (data) => data.id,
                getRowId: (params) => params.data.id,
                serverSideDatasource: {
                    getRows: (params) => {
                        const rowData = tree[params.request.groupKeys.join('/')] ?? [];
                        params.success({ rowData, rowCount: rowData.length });
                    },
                },
                ...options,
            });
        }

        test('expanding a tree group subscribes its children once they load, with their route', async () => {
            const api = createTreeGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(['A', 'B', 'C']);

            api.setRowNodeExpanded(api.getRowNode('A')!, true);

            await waitFor(() => expect(recorder.ids()).toEqual(['A', 'A1', 'A2', 'B', 'C']));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'subscribe', reason: 'load', ids: ['A1', 'A2'] }]);
            expect(recorder.subscribed.get('A1')).toMatchObject({ route: ['A', 'A1'], parentKeys: ['A'], level: 1 });
            expect(recorder.subscribed.get('A2')).toMatchObject({ parentKeys: ['A'], level: 1, group: false });
            expect(recorder.violations).toEqual([]);
        });

        test('groups opened by isServerSideGroupOpenByDefault subscribe their children as they load, without unsubscribing anything', async () => {
            const recorder = createRecorder();
            const api = createTreeGrid({ isServerSideGroupOpenByDefault: () => true });
            api.subscribeToVisibleRows(recorder.handlers);

            await waitFor(() => expect(recorder.ids()).toEqual(['A', 'A1', 'A1x', 'A2', 'B', 'C']));
            expect(recorder.calls[0]).toEqual({ type: 'subscribe', reason: 'initial', ids: [] });
            expect(recorder.calls.filter((c) => c.type === 'unsubscribe')).toEqual([]);
            // No group was opened through the API, so no row is reported as expanded.
            expect(recorder.calls.filter((c) => c.reason === 'expand')).toEqual([]);
            expect(recorder.subscribed.get('A1x')).toMatchObject({ parentKeys: ['A', 'A1'], level: 2 });
            expect(recorder.violations).toEqual([]);
        });

        // BUG: a body height change in the same frame as a block load marks the batch as a scroll, so rows
        // that loaded outside the previous range are reported with reason 'scroll'. Fails intermittently here
        // (about 1 run in 15), depending on which frame the change lands in; see the pivot mode test in the
        // CSRM suite for a deterministic case.
        test.skip('rows loaded by isServerSideGroupOpenByDefault are all reported with reason load', async () => {
            const recorder = createRecorder();
            const api = createTreeGrid({ isServerSideGroupOpenByDefault: () => true });
            api.subscribeToVisibleRows(recorder.handlers);

            await waitFor(() => expect(recorder.ids()).toEqual(['A', 'A1', 'A1x', 'A2', 'B', 'C']));
            // How many batches there are depends on load timing.
            expect(new Set(recorder.calls.slice(1).map((c) => `${c.type}:${c.reason}`))).toEqual(
                new Set(['subscribe:load'])
            );
        });

        test('collapsing a tree group unsubscribes its loaded descendants with reason collapse', async () => {
            const api = createTreeGrid({ isServerSideGroupOpenByDefault: () => true });
            await waitForNoLoadingRows(api);
            await nextAnimationFrame();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(['A', 'A1', 'A1x', 'A2', 'B', 'C']);

            api.setRowNodeExpanded(api.getRowNode('A')!, false);

            await waitFor(() => expect(recorder.ids()).toEqual(['A', 'B', 'C', 'C1']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', reason: 'collapse', ids: ['A1', 'A1x', 'A2'] },
                { type: 'subscribe', reason: 'collapse', ids: ['C1'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('tree data group flag and route', () => {
        function createTreeGrid(): GridApi {
            return gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'id' }],
                rowModelType: 'serverSide',
                treeData: true,
                isServerSideGroup: (data) => data.group,
                getServerSideGroupKey: (data) => data.id,
                getRowId: (params) => params.data.id,
                serverSideDatasource: {
                    getRows: (params) => {
                        const rowData = [
                            { id: 'A', group: true },
                            { id: 'B', group: false },
                        ];
                        params.success({ rowData, rowCount: rowData.length });
                    },
                },
            });
        }

        test('expandable tree rows are passed with group true, and leaf rows, which have no key, without a route', async () => {
            const api = createTreeGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers);

            expect(recorder.subscribed.get('A')).toMatchObject({ group: true, route: ['A'] });
            expect(recorder.subscribed.get('B')).toMatchObject({ group: false });
            expect(recorder.subscribed.get('B')!.route).toBeUndefined();
        });

        test('includeGroups false leaves out the expandable tree rows', async () => {
            const api = createTreeGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers, { includeGroups: false });

            expect(recorder.ids()).toEqual(['B']);
        });
    });

    describe('row grouping', () => {
        const countries = ['Ireland', 'Spain', 'France'];

        function createGroupedGrid(options: GridOptions = {}): GridApi {
            return gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'sport' }, { field: 'value' }],
                rowModelType: 'serverSide',
                rowBuffer: 5,
                suppressRowVirtualisation: false,
                getRowId: ({ data, parentKeys = [] }) =>
                    [...parentKeys, data.id ?? data.country ?? data.sport].join('/'),
                serverSideDatasource: {
                    getRows: (params) => {
                        const { groupKeys, rowGroupCols } = params.request;
                        const field = rowGroupCols[groupKeys.length]?.field;
                        const rowData =
                            field === 'country'
                                ? countries.map((country) => ({ country }))
                                : field === 'sport'
                                  ? [{ sport: 'Golf' }, { sport: 'Rugby' }]
                                  : Array.from({ length: 10 }, (_, i) => ({ id: `${groupKeys[0]}-${i}`, value: i }));
                        params.success({ rowData, rowCount: rowData.length });
                    },
                },
                ...options,
            });
        }

        test('expandAll subscribes the rows that load into view and scrolls out the groups it pushes down', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.expandAll();

            await waitFor(() =>
                expect(recorder.ids()).toEqual(['Ireland', ...range(0, 4).map((i) => `Ireland/Ireland-${i}`)])
            );
            expect(recorder.reasons('unsubscribe')).toEqual(['scroll']);
            expect(recorder.calls.find((c) => c.type === 'unsubscribe')!.ids).toEqual(['Spain', 'France']);
            expect(recorder.violations).toEqual([]);
        });

        test('changing the group column unsubscribes the old groups with reason reset', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);
            expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']);

            api.applyColumnState({
                state: [
                    { colId: 'country', rowGroup: false },
                    { colId: 'sport', rowGroup: true },
                ],
            });

            await waitFor(() => expect(recorder.ids()).toEqual(['Golf', 'Rugby']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', reason: 'reset', ids: countries },
                { type: 'subscribe', reason: 'load', ids: ['Golf', 'Rugby'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('master/detail', () => {
        test('expanding a master row never reports its detail row, and scrolls the rows it pushes out of view', async () => {
            const api = await createFlatGrid({
                masterDetail: true,
                detailCellRenderer: () => 'detail',
                detailRowHeight: 100,
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.setRowNodeExpanded(api.getRowNode('1')!, true);

            // Rows 0 and 1, the 100px detail row, then row 2.
            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 2)));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', reason: 'scroll', ids: range(3, 5) }]);

            api.setRowNodeExpanded(api.getRowNode('1')!, false);

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', reason: 'collapse', ids: range(3, 5) }]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('filtering and pinned rows', () => {
        test('a filter that the server applies resets the rows it drops and loads the new ones', async () => {
            let min = -1;
            const all = createRows(1000);
            const api = await createFlatGrid({
                columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
                serverSideDatasource: createFlatDatasource(() => all.filter((row) => row.value > min)),
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            min = 2;
            await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 2 });
            api.onFilterChanged();

            await waitFor(() => expect(recorder.ids()).toEqual(range(3, 8)));
            await settle(api);
            expect(recorder.reasons('unsubscribe')).toEqual(['reset']);
            expect(recorder.calls.find((c) => c.type === 'unsubscribe')!.ids).toEqual(range(0, 5));
            expect(recorder.reasons('subscribe')).toEqual(['initial', 'load']);
            expect(recorder.violations).toEqual([]);
        });

        test('a filter that removes every row unsubscribes them all', async () => {
            let empty = false;
            const all = createRows(1000);
            const api = await createFlatGrid({
                columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
                serverSideDatasource: createFlatDatasource(() => (empty ? [] : all)),
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            empty = true;
            await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 5000 });
            api.onFilterChanged();

            await waitFor(() => expect(recorder.subscribed.size).toBe(0));
            await settle(api);
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', reason: 'reset', ids: range(0, 5) }]);
            expect(recorder.violations).toEqual([]);
        });

        test('pinned rows are never reported', async () => {
            const api = await createFlatGrid({
                pinnedTopRowData: [{ id: 'top', value: -1 }],
                pinnedBottomRowData: [{ id: 'bottom', value: -2 }],
            });
            const recorder = createRecorder();

            api.subscribeToVisibleRows(recorder.handlers, { includeBuffer: true });

            expect(recorder.ids()).not.toContain('top');
            expect(recorder.ids()).not.toContain('bottom');
            expect(recorder.ids()).toEqual(range(api.getFirstDisplayedRowIndex(), api.getLastDisplayedRowIndex()));
        });
    });

    describe('pagination', () => {
        test('paging unsubscribes the old page and subscribes the new one once it loads', async () => {
            const api = await createFlatGrid({ pagination: true, paginationPageSize: 20 });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.paginationGoToPage(10);

            await waitFor(() => expect(recorder.ids()).toEqual(range(200, 205)));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', reason: 'scroll', ids: range(0, 5) },
                { type: 'subscribe', reason: 'load', ids: range(200, 205) },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('loading', () => {
        test('rows still loading are not reported until their block loads', async () => {
            const pending: IServerSideGetRowsParams[] = [];
            const rows = createRows(1000);
            let defer = false;
            const api = await createFlatGrid({
                serverSideInitialRowCount: 1000,
                serverSideDatasource: {
                    getRows: (params) => (defer ? pending.push(params) : respond(params, rows)),
                },
            });
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            defer = true;
            api.ensureIndexVisible(500, 'top');

            await waitFor(() => expect(recorder.subscribed.size).toBe(0));
            await waitFor(() => expect(pending.length).toBeGreaterThan(0));
            await nextAnimationFrame();
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', reason: 'scroll', ids: range(0, 5) }]);

            pending.splice(0).forEach((params) => respond(params, rows));

            await waitFor(() => expect(recorder.ids()).toEqual(range(500, 505)));
            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', reason: 'load', ids: range(500, 505) }]);
            expect(recorder.violations).toEqual([]);
        });

        test('rows whose load failed are not reported, and a retry reports them with reason load', async () => {
            let fail = true;
            const rows = createRows(1000);
            const recorder = createRecorder();
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'value' }],
                rowModelType: 'serverSide',
                serverSideInitialRowCount: 1000,
                getRowId: (params) => params.data.id,
                serverSideDatasource: {
                    getRows: (params) => (fail ? params.fail() : respond(params, rows)),
                },
            });
            api.subscribeToVisibleRows(recorder.handlers);
            await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.failedLoad).toBe(true));
            // Failed rows stay stubs, so waitForNoLoadingRows would never return.
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toEqual([{ type: 'subscribe', reason: 'initial', ids: [] }]);

            fail = false;
            api.retryServerSideLoads();

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'subscribe', reason: 'load', ids: range(0, 5) }]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('refresh and transactions', () => {
        test('refreshing without a purge keeps unchanged rows subscribed', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.refreshServerSide({ purge: false });
            await settle(api);

            expect(recorder.calls).toHaveLength(1);
            expect(recorder.ids()).toEqual(range(0, 5));
        });

        test('a transaction adding a row at the top subscribes it and scrolls out the row it pushes down', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.applyServerSideTransaction({ add: [{ id: 'new', value: -1 }], addIndex: 0 });

            await waitFor(() => expect(recorder.ids()).toEqual([...range(0, 4), 'new']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', reason: 'scroll', ids: ['5'] },
                { type: 'subscribe', reason: 'load', ids: ['new'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('async transactions are reported once they are flushed', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            api.subscribeToVisibleRows(recorder.handlers);

            api.applyServerSideTransactionAsync({ remove: [{ id: '1' }] });
            api.applyServerSideTransactionAsync({ update: [{ id: '2', value: 200 }] });
            await settle(api);
            expect(recorder.calls).toHaveLength(1);

            api.flushServerSideAsyncTransactions();

            await waitFor(() => expect(recorder.ids()).toEqual(['0', ...range(2, 6)]));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', reason: 'remove', ids: ['1'] },
                { type: 'subscribe', reason: 'load', ids: ['6'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    test('selecting rows does not resubscribe them', async () => {
        const api = await createFlatGrid({ rowSelection: { mode: 'multiRow' } });
        const recorder = createRecorder();
        api.subscribeToVisibleRows(recorder.handlers);

        api.setNodesSelected({ nodes: [api.getRowNode('1')!, api.getRowNode('2')!], newValue: true });
        await waitFor(() => expect(api.getSelectedNodes()).toHaveLength(2));
        await settle(api);

        expect(recorder.calls).toHaveLength(1);
    });
});
