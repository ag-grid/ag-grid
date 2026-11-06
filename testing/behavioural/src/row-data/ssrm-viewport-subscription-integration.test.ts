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
    ViewportSubscriptionModule,
} from 'ag-grid-community';
import {
    MasterDetailModule,
    PivotModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import { createFakeServer, createServerSideDatasource } from '../columnToolPanel/deferredPivotModeFakeServer';
import type { Recorder } from './viewportSubscriptionTestUtils';
import { createRecorder, range, subscribe } from './viewportSubscriptionTestUtils';

describe('SSRM viewportSubscription integration', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            ViewportSubscriptionModule,
            ScrollApiModule,
            NumberFilterModule,
            PaginationModule,
            PinnedRowModule,
            RowSelectionModule,
            RowGroupingModule,
            TreeDataModule,
            MasterDetailModule,
            PivotModule,
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
            subscribe(api, recorder);
            expect(recorder.ids()).toEqual(['A', 'B', 'C']);

            api.setRowNodeExpanded(api.getRowNode('A')!, true);

            await waitFor(() => expect(recorder.ids()).toEqual(['A', 'A1', 'A2', 'B', 'C']));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'subscribe', ids: ['A1', 'A2'] }]);
            expect(recorder.subscribed.get('A1')).toMatchObject({
                type: 'tree',
                route: ['A', 'A1'],
                parentKeys: ['A'],
                level: 1,
                hasChildren: true,
            });
            expect(recorder.subscribed.get('A2')).toMatchObject({
                type: 'tree',
                parentKeys: ['A'],
                level: 1,
                hasChildren: false,
            });
            expect(recorder.violations).toEqual([]);
        });

        test('groups opened by isServerSideGroupOpenByDefault subscribe their children as they load, without unsubscribing anything', async () => {
            const recorder = createRecorder();
            createTreeGrid({ isServerSideGroupOpenByDefault: () => true, viewportSubscription: recorder.handlers });

            await waitFor(() => expect(recorder.ids()).toEqual(['A', 'A1', 'A1x', 'A2', 'B', 'C']));
            expect(recorder.calls[0]).toEqual({ type: 'subscribe', ids: [] });
            expect(recorder.calls.filter((c) => c.type === 'unsubscribe')).toEqual([]);
            expect(recorder.subscribed.get('A1x')).toMatchObject({ parentKeys: ['A', 'A1'], level: 2 });
            expect(recorder.violations).toEqual([]);
        });

        test('collapsing a tree group unsubscribes its loaded descendants', async () => {
            const api = createTreeGrid({ isServerSideGroupOpenByDefault: () => true });
            await waitForNoLoadingRows(api);
            await nextAnimationFrame();
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.ids()).toEqual(['A', 'A1', 'A1x', 'A2', 'B', 'C']);

            api.setRowNodeExpanded(api.getRowNode('A')!, false);

            await waitFor(() => expect(recorder.ids()).toEqual(['A', 'B', 'C', 'C1']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['A1', 'A1x', 'A2'] },
                { type: 'subscribe', ids: ['C1'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('tree data type and route', () => {
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

        test('tree rows are passed with type tree; expandable rows have children and a route, and leaf rows, which have no key, have no route', async () => {
            const api = createTreeGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();

            subscribe(api, recorder);

            expect(recorder.subscribed.get('A')).toEqual({
                type: 'tree',
                id: 'A',
                route: ['A'],
                parentKeys: [],
                level: 0,
                hasChildren: true,
                data: { id: 'A', group: true },
            });
            expect(recorder.subscribed.get('B')).toEqual({
                type: 'tree',
                id: 'B',
                parentKeys: [],
                level: 0,
                hasChildren: false,
                data: { id: 'B', group: false },
            });
        });

        test('includeGroups false leaves out the expandable tree rows', async () => {
            const api = createTreeGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();

            subscribe(api, recorder, { includeGroups: false });

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
            subscribe(api, recorder);

            api.expandAll();

            await waitFor(() =>
                expect(recorder.ids()).toEqual(['Ireland', ...range(0, 4).map((i) => `Ireland/Ireland-${i}`)])
            );
            expect(recorder.batches('unsubscribe')).toEqual([['Spain', 'France']]);
            expect(recorder.violations).toEqual([]);
        });

        test('changing the group column unsubscribes the old groups', async () => {
            const api = createGroupedGrid();
            await waitForNoLoadingRows(api);
            const recorder = createRecorder();
            subscribe(api, recorder);
            expect(recorder.ids()).toEqual(['France', 'Ireland', 'Spain']);

            api.applyColumnState({
                state: [
                    { colId: 'country', rowGroup: false },
                    { colId: 'sport', rowGroup: true },
                ],
            });

            await waitFor(() => expect(recorder.ids()).toEqual(['Golf', 'Rugby']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: countries },
                { type: 'subscribe', ids: ['Golf', 'Rugby'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('pivot mode', () => {
        const olympicRows = ['USA', 'Russia'].flatMap((country) =>
            [2000, 2004].flatMap((year) =>
                ['Swimming', 'Rowing'].map((sport) => ({
                    athlete: `${country}-${year}-${sport}`,
                    age: 20,
                    country,
                    year,
                    date: '',
                    sport,
                    gold: 1,
                    silver: sport === 'Swimming' ? 1 : 0,
                    bronze: 0,
                    total: 1,
                }))
            )
        );

        function createPivotGrid(recorder: Recorder, options: GridOptions = {}) {
            const getRowIdData: any[] = [];
            const server = createFakeServer(olympicRows);
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', rowGroup: true, hide: true },
                    { field: 'sport', pivot: true, hide: true },
                    { field: 'silver', hide: true },
                    { field: 'gold', aggFunc: 'sum', hide: true },
                ],
                pivotMode: true,
                rowModelType: 'serverSide',
                rowBuffer: 5,
                suppressRowVirtualisation: false,
                getRowId: ({ data, parentKeys = [] }) => {
                    getRowIdData.push(data);
                    return [...parentKeys, data.athlete ?? (parentKeys.length ? data.year : data.country)].join('/');
                },
                // The grid sends the pivot columns outside pivot mode too, so they are dropped then.
                serverSideDatasource: createServerSideDatasource({
                    getData: (request) => server.getData(request.pivotMode ? request : { ...request, pivotCols: [] }),
                }),
                viewportSubscription: recorder.handlers,
                ...options,
            });
            return { api, getRowIdData };
        }

        /**
         * Waits until the subscribed rows are the given ones, and no further batch arrives.
         * Blocks of open groups out of view never load, so this cannot wait for no loading rows.
         */
        async function waitForIds(recorder: Recorder, ids: string[]): Promise<void> {
            await waitFor(() => expect(recorder.ids()).toEqual(ids));
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.ids()).toEqual(ids);
        }

        test('subscribes the group rows the server returns, with the pivoted data and the id from getRowId', async () => {
            const recorder = createRecorder();
            const { getRowIdData } = createPivotGrid(recorder);

            await waitForIds(recorder, ['Russia', 'USA']);

            expect(recorder.calls).toEqual([
                { type: 'subscribe', ids: [] },
                { type: 'subscribe', ids: ['Russia', 'USA'] },
            ]);
            expect(recorder.subscribed.get('USA')).toEqual({
                type: 'group',
                id: 'USA',
                route: ['USA'],
                parentKeys: [],
                level: 0,
                data: { country: 'USA', childCount: 4, Rowing_gold: 2, Swimming_gold: 2 },
            });
            // Unlike the Client-Side Row Model, getRowId gives the group rows their ids.
            expect(getRowIdData.every((data) => data.country && !data.athlete)).toBe(true);
        });

        test('expanding and collapsing a group subscribes and unsubscribes its child groups', async () => {
            const recorder = createRecorder();
            const { api } = createPivotGrid(recorder);
            await waitForIds(recorder, ['Russia', 'USA']);

            api.setRowNodeExpanded(api.getRowNode('USA')!, true);
            await waitForIds(recorder, ['Russia', 'USA', 'USA/2000', 'USA/2004']);
            expect(recorder.subscribed.get('USA/2000')).toEqual({
                type: 'group',
                id: 'USA/2000',
                route: ['USA', '2000'],
                parentKeys: ['USA'],
                level: 1,
                data: { year: '2000', childCount: 2, Rowing_gold: 1, Swimming_gold: 1 },
            });

            api.setRowNodeExpanded(api.getRowNode('USA')!, false);
            await waitForIds(recorder, ['Russia', 'USA']);

            expect(recorder.calls.slice(2)).toEqual([
                { type: 'subscribe', ids: ['USA/2000', 'USA/2004'] },
                { type: 'unsubscribe', ids: ['USA/2000', 'USA/2004'] },
            ]);
            expect(recorder.unsubscribedRefs).toEqual([
                { type: 'group', id: 'USA/2000', route: ['USA', '2000'], parentKeys: ['USA'], level: 1 },
                { type: 'group', id: 'USA/2004', route: ['USA', '2004'], parentKeys: ['USA'], level: 1 },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('turning pivot mode off and on reloads the rows, so unsubscribes every row and subscribes the reloaded rows in view', async () => {
            const recorder = createRecorder();
            const { api } = createPivotGrid(recorder, { isServerSideGroupOpenByDefault: () => true });
            // Rows 0-4 are in view: the pivot result columns take two header rows.
            const pivotRowsInView = ['Russia', 'Russia/2000', 'Russia/2004', 'USA', 'USA/2000'];
            await waitForIds(recorder, pivotRowsInView);
            const callsInPivotMode = recorder.calls.length;

            api.setGridOption('pivotMode', false);

            // Rows 0-5 are in view, now with leaf rows under the expanded year groups.
            await waitForIds(recorder, [
                'Russia',
                'Russia/2000',
                'Russia/2000/Russia-2000-Rowing',
                'Russia/2000/Russia-2000-Swimming',
                'Russia/2004',
                'Russia/2004/Russia-2004-Swimming',
            ]);
            expect(recorder.calls[callsInPivotMode].type).toBe('unsubscribe');
            expect([...recorder.calls[callsInPivotMode].ids].sort()).toEqual(pivotRowsInView);
            expect(recorder.subscribed.get('Russia/2000/Russia-2000-Swimming')).toMatchObject({
                type: 'leaf',
                parentKeys: ['Russia', '2000'],
                level: 2,
            });

            api.setGridOption('pivotMode', true);

            await waitForIds(recorder, pivotRowsInView);
            expect(recorder.subscribed.get('Russia')!.data).toEqual({
                country: 'Russia',
                childCount: 4,
                Rowing_gold: 2,
                Swimming_gold: 2,
            });
            expect(recorder.violations).toEqual([]);
        });

        test('changing the pivot columns reloads the rows, so unsubscribes every row and subscribes the reloaded rows with their new data', async () => {
            const recorder = createRecorder();
            const { api } = createPivotGrid(recorder);
            await waitForIds(recorder, ['Russia', 'USA']);

            api.setPivotColumns(['silver']);

            await waitFor(() => expect(recorder.subscribed.get('USA')?.data).toHaveProperty('1_gold', 2));
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls.slice(2)).toEqual([
                { type: 'unsubscribe', ids: ['Russia', 'USA'] },
                { type: 'subscribe', ids: ['Russia', 'USA'] },
            ]);

            api.setPivotColumns([]);

            await waitFor(() => expect(recorder.subscribed.get('USA')?.data).not.toHaveProperty('1_gold'));
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls.slice(4)).toEqual([
                { type: 'unsubscribe', ids: ['Russia', 'USA'] },
                { type: 'subscribe', ids: ['Russia', 'USA'] },
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
            subscribe(api, recorder);

            api.setRowNodeExpanded(api.getRowNode('1')!, true);

            // Rows 0 and 1, the 100px detail row, then row 2.
            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 2)));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: range(3, 5) }]);

            api.setRowNodeExpanded(api.getRowNode('1')!, false);

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(3, 5) }]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('filtering and pinned rows', () => {
        test('a filter that the server applies unsubscribes the rows, then subscribes the reloaded ones', async () => {
            let min = -1;
            const all = createRows(1000);
            const api = await createFlatGrid({
                columnDefs: [{ field: 'value', filter: 'agNumberColumnFilter' }],
                serverSideDatasource: createFlatDatasource(() => all.filter((row) => row.value > min)),
            });
            const recorder = createRecorder();
            subscribe(api, recorder);

            min = 2;
            await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 2 });
            api.onFilterChanged();

            await waitFor(() => expect(recorder.ids()).toEqual(range(3, 8)));
            await settle(api);
            expect(recorder.batches('unsubscribe')).toEqual([range(0, 5)]);
            expect(recorder.batches('subscribe')).toEqual([range(0, 5), range(3, 8)]);
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
            subscribe(api, recorder);

            empty = true;
            await api.setColumnFilterModel('value', { filterType: 'number', type: 'greaterThan', filter: 5000 });
            api.onFilterChanged();

            await waitFor(() => expect(recorder.subscribed.size).toBe(0));
            await settle(api);
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: range(0, 5) }]);
            expect(recorder.violations).toEqual([]);
        });

        test('pinned rows are never reported', async () => {
            const api = await createFlatGrid({
                pinnedTopRowData: [{ id: 'top', value: -1 }],
                pinnedBottomRowData: [{ id: 'bottom', value: -2 }],
            });
            const recorder = createRecorder();

            subscribe(api, recorder, { includeBuffer: true });

            expect(recorder.ids()).not.toContain('top');
            expect(recorder.ids()).not.toContain('bottom');
            expect(recorder.ids()).toEqual(range(api.getFirstDisplayedRowIndex(), api.getLastDisplayedRowIndex()));
        });
    });

    describe('pagination', () => {
        test('paging unsubscribes the old page and subscribes the new one once it loads', async () => {
            const api = await createFlatGrid({ pagination: true, paginationPageSize: 20 });
            const recorder = createRecorder();
            subscribe(api, recorder);

            api.paginationGoToPage(10);

            await waitFor(() => expect(recorder.ids()).toEqual(range(200, 205)));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: range(0, 5) },
                { type: 'subscribe', ids: range(200, 205) },
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
            subscribe(api, recorder);

            defer = true;
            api.ensureIndexVisible(500, 'top');

            await waitFor(() => expect(recorder.subscribed.size).toBe(0));
            await waitFor(() => expect(pending.length).toBeGreaterThan(0));
            await nextAnimationFrame();
            expect(recorder.calls.slice(1)).toEqual([{ type: 'unsubscribe', ids: range(0, 5) }]);

            pending.splice(0).forEach((params) => respond(params, rows));

            await waitFor(() => expect(recorder.ids()).toEqual(range(500, 505)));
            expect(recorder.calls.slice(2)).toEqual([{ type: 'subscribe', ids: range(500, 505) }]);
            expect(recorder.violations).toEqual([]);
        });

        test('rows whose load failed are not reported, and a retry subscribes them', async () => {
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
                viewportSubscription: recorder.handlers,
            });
            await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.failedLoad).toBe(true));
            // Failed rows stay stubs, so waitForNoLoadingRows would never return.
            await nextAnimationFrame();
            await nextAnimationFrame();
            expect(recorder.calls).toEqual([{ type: 'subscribe', ids: [] }]);

            fail = false;
            api.retryServerSideLoads();

            await waitFor(() => expect(recorder.ids()).toEqual(range(0, 5)));
            expect(recorder.calls.slice(1)).toEqual([{ type: 'subscribe', ids: range(0, 5) }]);
            expect(recorder.violations).toEqual([]);
        });
    });

    describe('refresh and transactions', () => {
        test('refreshing without a purge keeps unchanged rows subscribed', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            subscribe(api, recorder);

            api.refreshServerSide({ purge: false });
            await settle(api);

            expect(recorder.calls).toHaveLength(1);
            expect(recorder.ids()).toEqual(range(0, 5));
        });

        test('a transaction adding a row at the top subscribes it and scrolls out the row it pushes down', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            subscribe(api, recorder);

            api.applyServerSideTransaction({ add: [{ id: 'new', value: -1 }], addIndex: 0 });

            await waitFor(() => expect(recorder.ids()).toEqual([...range(0, 4), 'new']));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['5'] },
                { type: 'subscribe', ids: ['new'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });

        test('async transactions are reported once they are flushed', async () => {
            const api = await createFlatGrid();
            const recorder = createRecorder();
            subscribe(api, recorder);

            api.applyServerSideTransactionAsync({ remove: [{ id: '1' }] });
            api.applyServerSideTransactionAsync({ update: [{ id: '2', value: 200 }] });
            await settle(api);
            expect(recorder.calls).toHaveLength(1);

            api.flushServerSideAsyncTransactions();

            await waitFor(() => expect(recorder.ids()).toEqual(['0', ...range(2, 6)]));
            expect(recorder.calls.slice(1)).toEqual([
                { type: 'unsubscribe', ids: ['1'] },
                { type: 'subscribe', ids: ['6'] },
            ]);
            expect(recorder.violations).toEqual([]);
        });
    });

    test('selecting rows does not resubscribe them', async () => {
        const api = await createFlatGrid({ rowSelection: { mode: 'multiRow' } });
        const recorder = createRecorder();
        subscribe(api, recorder);

        api.setNodesSelected({ nodes: [api.getRowNode('1')!, api.getRowNode('2')!], newValue: true });
        await waitFor(() => expect(api.getSelectedNodes()).toHaveLength(2));
        await settle(api);

        expect(recorder.calls).toHaveLength(1);
    });
});
