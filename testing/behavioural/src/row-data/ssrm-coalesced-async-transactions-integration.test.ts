import { ALL_SEVERITIES, GridRows, TestGridsManager, waitForEvent, waitForNoLoadingRows } from 'ag-test-utils';

import type {
    AsyncTransactionsFlushed,
    GridApi,
    GridOptions,
    IServerSideGetRowsParams,
    ServerSideTransaction,
    ServerSideTransactionResult,
} from 'ag-grid-community';
import {
    CellSpanModule,
    DETAIL_ROW_ID_PREFIX,
    GRAND_TOTAL_ROW_ID,
    PaginationModule,
    PinnedRowModule,
    RenderApiModule,
    RowSelectionModule,
    ScrollApiModule,
    enableDevValidations,
} from 'ag-grid-community';
import {
    MasterDetailModule,
    PivotModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelMergeTransactionsModule,
    ServerSideRowModelModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

/**
 * How coalescing queued async transactions (`serverSideMergeAsyncTransactions`) interacts with other grid
 * options. Each scenario runs once applying the transactions in turn and once coalesced, requires the two to end
 * with the same rows and results, then pins the coalesced outcome.
 */
describe('SSRM coalesced async transactions with other grid options', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ServerSideRowModelApiModule,
            ServerSideRowModelModule,
            ServerSideRowModelMergeTransactionsModule,
            RowGroupingModule,
            TreeDataModule,
            MasterDetailModule,
            PivotModule,
            PaginationModule,
            PinnedRowModule,
            RowSelectionModule,
            CellSpanModule,
            RenderApiModule,
            ScrollApiModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    interface Row {
        id: string;
        value: string;
    }

    const ROW = (id: string | number, value: string): Row => ({ id: String(id), value });
    const INITIAL: Row[] = Array.from({ length: 5 }, (_, i) => ROW(i, `Row ${i}`));

    interface ResultSummary {
        status: string;
        update?: (string | undefined)[];
        add?: (string | undefined)[];
        remove?: (string | undefined)[];
    }

    const summarise = (result: ServerSideTransactionResult): ResultSummary => {
        const summary: ResultSummary = { status: result.status };
        for (const op of ['update', 'add', 'remove'] as const) {
            const nodes = result[op];
            if (nodes) {
                summary[op] = nodes.map((node) => node.id);
            }
        }
        return summary;
    };

    /** Queues the transactions, flushes them, and waits for every result callback. */
    async function applyAsync(api: GridApi, transactions: ServerSideTransaction[]) {
        const results: ServerSideTransactionResult[] = [];
        let flushed: ServerSideTransactionResult[] = [];
        const onFlushed = (event: AsyncTransactionsFlushed) => {
            flushed = event.results as ServerSideTransactionResult[];
        };
        api.addEventListener('asyncTransactionsFlushed', onFlushed);
        transactions.forEach((transaction, index) =>
            api.applyServerSideTransactionAsync(transaction, (result) => {
                results[index] = result;
            })
        );
        api.flushServerSideAsyncTransactions();
        api.removeEventListener('asyncTransactionsFlushed', onFlushed);
        await vi.waitFor(() => expect(results.filter(Boolean)).toHaveLength(transactions.length));
        return { results: results.map(summarise), flushed };
    }

    const rowsOf = (api: GridApi) => {
        const rows: [string | undefined, unknown][] = [];
        api.forEachNode((node) => rows.push([node.id, node.data]));
        return rows;
    };

    /** The rows the model holds, without the DOM, which some scenarios render a frame later. */
    const diagramOf = (api: GridApi) => new GridRows(api, '', { checkDom: false }).makeDiagram(true);

    /** Runs the scenario applying transactions in turn, then coalesced, and requires the same outcome. */
    async function compareWithSequential<T>(run: (merge: boolean) => Promise<T>): Promise<T> {
        const sequential = await run(false);
        gridsManager.reset();
        const coalesced = await run(true);
        expect(coalesced).toEqual(sequential);
        return coalesced;
    }

    function flatOptions(merge: boolean, extra: Partial<GridOptions> = {}, initial: Row[] = INITIAL): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            serverSideMergeAsyncTransactions: merge,
            getRowId: (params) => params.data.id,
            serverSideDatasource: {
                getRows: (params) => {
                    const rowData = initial.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData, rowCount: initial.length });
                },
            },
            ...extra,
        };
    }

    // an update before and after a batch boundary, an add followed by an update of the added row, and a removal
    const FLAT_TRANSACTIONS: ServerSideTransaction[] = [
        { update: [ROW(1, 'a')] },
        { add: [ROW(50, 'new')] },
        { update: [ROW(50, 'new 2')] },
        { remove: [ROW(2, 'Row 2')] },
        { update: [ROW(1, 'b')] },
    ];
    const FLAT_EXPECTED_ROWS = [
        ['0', ROW(0, 'Row 0')],
        ['1', ROW(1, 'b')],
        ['3', ROW(3, 'Row 3')],
        ['4', ROW(4, 'Row 4')],
        ['50', ROW(50, 'new 2')],
    ];
    const FLAT_EXPECTED_RESULTS: ResultSummary[] = [
        { status: 'Applied', update: ['1'] },
        { status: 'Applied', add: ['50'] },
        { status: 'Applied', update: ['50'] },
        { status: 'Applied', remove: ['2'] },
        { status: 'Applied', update: ['1'] },
    ];

    const renderedIds = (api: GridApi) => api.getRenderedNodes().map((node) => node.id);

    interface FlatVariant {
        name: string;
        options: Partial<GridOptions>;
        before?: (api: GridApi) => void;
        observe: (api: GridApi) => unknown;
        expected: unknown;
    }

    test.each<FlatVariant>([
        {
            name: 'pagination',
            options: { pagination: true, paginationPageSize: 2, paginationPageSizeSelector: false },
            observe: (api) => ({ pages: api.paginationGetTotalPages(), rowCount: api.paginationGetRowCount() }),
            expected: { pages: 3, rowCount: 5 },
        },
        {
            name: 'domLayout autoHeight',
            options: { domLayout: 'autoHeight' },
            observe: renderedIds,
            expected: ['0', '1', '3', '4', '50'],
        },
        {
            name: 'row virtualisation with rowBuffer 0, scrolled to the added row',
            options: { suppressRowVirtualisation: false, rowBuffer: 0 },
            observe: (api) => {
                const before = renderedIds(api);
                api.ensureIndexVisible(4);
                return { before, after: renderedIds(api) };
            },
            // happy-dom has no viewport height, so only one row is rendered at a time
            expected: { before: ['0'], after: ['50'] },
        },
        {
            // a row keeps the height it was added with when it is updated, so the add must not take the later data
            name: 'getRowHeight from row data',
            options: { getRowHeight: (params) => (params.data?.value === 'new' ? 40 : 25) },
            observe: (api) => {
                const heights: Record<string, [number | null | undefined, number | null | undefined]> = {};
                api.forEachNode((node) => (heights[node.id!] = [node.rowHeight, node.rowTop]));
                return heights;
            },
            expected: { 0: [25, 0], 1: [25, 25], 3: [25, 50], 4: [25, 75], 50: [40, 100] },
        },
        {
            name: 'pinned top and bottom rows',
            options: {
                pinnedTopRowData: [ROW('top', 'pinned top')],
                pinnedBottomRowData: [ROW('bottom', 'pinned bottom')],
            },
            observe: (api) => [api.getPinnedTopRow(0)?.data, api.getPinnedBottomRow(0)?.data],
            expected: [ROW('top', 'pinned top'), ROW('bottom', 'pinned bottom')],
        },
        {
            // the server sorts, so transactions do not reorder the rows
            name: 'a server-side sort on the updated column',
            options: { columnDefs: [{ field: 'id' }, { field: 'value', sort: 'desc' }] },
            observe: (api) =>
                Array.from({ length: api.getDisplayedRowCount() }, (_, i) => api.getDisplayedRowAtIndex(i)?.id),
            expected: ['0', '1', '3', '4', '50'],
        },
        {
            name: 'multi-row selection of an updated row and a removed row',
            options: { rowSelection: { mode: 'multiRow' } },
            before: (api) =>
                api.setNodesSelected({ nodes: [api.getRowNode('1')!, api.getRowNode('2')!], newValue: true }),
            observe: (api) => api.getSelectedNodes().map((node) => node.id),
            expected: ['1'],
        },
    ])(
        '$name gives the same rows as applying the transactions in turn',
        async ({ options, before, observe, expected }) => {
            const coalesced = await compareWithSequential(async (merge) => {
                const api = gridsManager.createGrid(null, flatOptions(merge, options));
                await waitForEvent('firstDataRendered', api);
                before?.(api);
                const { results } = await applyAsync(api, FLAT_TRANSACTIONS);
                return { results, rows: rowsOf(api), diagram: diagramOf(api), observed: observe(api) };
            });

            expect(coalesced.rows).toEqual(FLAT_EXPECTED_ROWS);
            expect(coalesced.results).toEqual(FLAT_EXPECTED_RESULTS);
            expect(coalesced.observed).toEqual(expected);
        }
    );

    interface Leaf {
        id: string;
        country: string;
        athlete: string;
        sales: number;
    }

    const LEAVES: Leaf[] = [
        { id: 'uk-alice', country: 'UK', athlete: 'Alice', sales: 1 },
        { id: 'uk-bob', country: 'UK', athlete: 'Bob', sales: 2 },
        { id: 'us-frank', country: 'US', athlete: 'Frank', sales: 3 },
    ];
    const GROUP = (country: string, sales: number) => ({ country, sales });

    function groupedOptions(merge: boolean, extra: Partial<GridOptions> = {}, onGetRows?: (keys: string[]) => void) {
        const options: GridOptions = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'sales', aggFunc: 'sum' },
            ],
            rowModelType: 'serverSide',
            serverSideMergeAsyncTransactions: merge,
            getRowId: (params) => params.data.id ?? `group-${params.data.country}`,
            serverSideDatasource: {
                getRows: (params) => {
                    const keys = params.request.groupKeys;
                    onGetRows?.(keys);
                    const rowData =
                        params.request.rowGroupCols.length === keys.length
                            ? LEAVES.filter((leaf) => keys.length === 0 || leaf.country === keys[0])
                            : [GROUP('UK', 3), GROUP('US', 3)];
                    params.success({ rowData, rowCount: rowData.length });
                },
            },
            ...extra,
        };
        return options;
    }

    async function createGroupedGrid(options: GridOptions, expandIds = ['group-UK']) {
        const api = gridsManager.createGrid(null, options);
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        for (const id of expandIds) {
            api.setRowNodeExpanded(api.getRowNode(id)!, true);
        }
        await waitForNoLoadingRows(api);
        return api;
    }

    test('group total rows show the latest group data and aggregates after coalesced updates', async () => {
        let api!: GridApi;
        const coalesced = await compareWithSequential(async (merge) => {
            api = await createGroupedGrid(groupedOptions(merge, { groupTotalRow: 'bottom' }));
            const { results } = await applyAsync(api, [
                { update: [GROUP('UK', 10)] },
                { route: ['UK'], update: [{ ...LEAVES[0], sales: 8 }] },
                { update: [GROUP('UK', 11)] },
                { route: ['UK'], add: [{ id: 'uk-zed', country: 'UK', athlete: 'Zed', sales: 1 }] },
            ]);
            return { results, diagram: diagramOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['group-UK'] },
            { status: 'Applied', update: ['uk-alice'] },
            { status: 'Applied', update: ['group-UK'] },
            { status: 'Applied', add: ['uk-zed'] },
        ]);
        // the DOM is not checked: after an add into a group with a group total row, the total row keeps its old
        // row-index attribute whether or not the transactions are coalesced
        await new GridRows(api, 'coalesced', { checkDom: false }).check(`
            ROOT id:<no-id>
            ├─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK"
            │ ├── LEAF id:uk-alice country:"UK" athlete:"Alice" sales:8
            │ ├── LEAF id:uk-bob country:"UK" athlete:"Bob" sales:2
            │ ├── LEAF id:uk-zed country:"UK" athlete:"Zed" sales:1
            │ └─ footer collapsed id:rowGroupFooter_group-UK ag-Grid-AutoColumn:"Total UK" country:"UK" sales:11
            └── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US" sales:3
        `);
    });

    test.each<[string, Partial<GridOptions>]>([
        ['singleColumn', {}],
        ['multipleColumns', { groupDisplayType: 'multipleColumns' }],
        ['groupRows', { groupDisplayType: 'groupRows' }],
        [
            'multipleColumns with groupHideOpenParents',
            { groupDisplayType: 'multipleColumns', groupHideOpenParents: true },
        ],
    ])(
        'groupDisplayType %s: coalesced updates to an expanded group keep it expanded without reloading it',
        async (_name, extra) => {
            const coalesced = await compareWithSequential(async (merge) => {
                const requests: string[][] = [];
                const api = await createGroupedGrid(groupedOptions(merge, extra, (keys) => requests.push(keys)));
                const loadedBefore = requests.length;
                const { results } = await applyAsync(api, [
                    { update: [GROUP('UK', 10)] },
                    { update: [GROUP('UK', 20)] },
                    { route: ['UK'], update: [{ ...LEAVES[1], athlete: 'Bob 2' }] },
                ]);
                await waitForNoLoadingRows(api);
                return {
                    results,
                    requestsAfter: requests.slice(loadedBefore),
                    expanded: api.getRowNode('group-UK')!.expanded,
                    rows: rowsOf(api),
                    diagram: diagramOf(api),
                };
            });

            expect(coalesced.results).toEqual([
                { status: 'Applied', update: ['group-UK'] },
                { status: 'Applied', update: ['group-UK'] },
                { status: 'Applied', update: ['uk-bob'] },
            ]);
            expect(coalesced.requestsAfter).toEqual([]);
            expect(coalesced.expanded).toBe(true);
            expect(coalesced.rows).toEqual([
                ['group-UK', GROUP('UK', 20)],
                ['uk-alice', LEAVES[0]],
                ['uk-bob', { ...LEAVES[1], athlete: 'Bob 2' }],
                ['group-US', GROUP('US', 3)],
            ]);
        }
    );

    test('removing an expanded group and adding it back in one flush restores it expanded and reloads its children, as in turn', async () => {
        let api!: GridApi;
        const coalesced = await compareWithSequential(async (merge) => {
            api = await createGroupedGrid(groupedOptions(merge));
            const { results } = await applyAsync(api, [
                { route: ['UK'], update: [{ ...LEAVES[0], athlete: 'Alice 2' }] },
                { remove: [GROUP('UK', 3)] },
                { add: [GROUP('UK', 0)] },
                { route: ['UK'], add: [{ id: 'uk-zed', country: 'UK', athlete: 'Zed', sales: 1 }] },
            ]);
            return { results, expanded: api.getRowNode('group-UK')!.expanded, diagram: diagramOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['uk-alice'] },
            { status: 'Applied', remove: ['group-UK'] },
            { status: 'Applied', add: ['group-UK'] },
            { status: 'Applied', add: [] },
        ]);
        expect(coalesced.expanded).toBe(true);
        await new GridRows(api, 'coalesced').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:group-US ag-Grid-AutoColumn:"US" country:"US" sales:3
            └─┬ GROUP-leafGroup id:group-UK ag-Grid-AutoColumn:"UK" country:"UK" sales:0
            · ├── LEAF id:uk-alice country:"UK" athlete:"Alice" sales:1
            · └── LEAF id:uk-bob country:"UK" athlete:"Bob" sales:2
        `);
    });

    test('transactions queued before the row groups change are applied to the new stores as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const api = await createGroupedGrid(groupedOptions(merge));
            const queued: ServerSideTransactionResult[] = [];
            api.applyServerSideTransactionAsync(
                { route: ['UK'], update: [{ ...LEAVES[0], athlete: 'Alice 2' }] },
                (r) => queued.push(r)
            );
            api.applyServerSideTransactionAsync({ update: [{ ...LEAVES[2], athlete: 'Frank 2' }] }, (r) =>
                queued.push(r)
            );
            api.applyServerSideTransactionAsync({ update: [{ ...LEAVES[2], athlete: 'Frank 3' }] }, (r) =>
                queued.push(r)
            );
            api.setGridOption('columnDefs', [
                { field: 'country', rowGroup: false },
                { field: 'athlete' },
                { field: 'sales' },
            ]);
            await waitForNoLoadingRows(api);
            api.flushServerSideAsyncTransactions();
            await vi.waitFor(() => expect(queued).toHaveLength(3));
            return { results: queued.map(summarise), rows: rowsOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'StoreNotFound' },
            { status: 'Applied', update: ['us-frank'] },
            { status: 'Applied', update: ['us-frank'] },
        ]);
        expect(coalesced.rows).toEqual([
            ['uk-alice', LEAVES[0]],
            ['uk-bob', LEAVES[1]],
            ['us-frank', { ...LEAVES[2], athlete: 'Frank 3' }],
        ]);
    });

    test('grand total row: transactions on the total row split the coalesced batches and keep the latest total', async () => {
        let api!: GridApi;
        const coalesced = await compareWithSequential(async (merge) => {
            api = gridsManager.createGrid(
                null,
                flatOptions(merge, {
                    grandTotalRow: 'bottom',
                    serverSideDatasource: {
                        getRows: (params: IServerSideGetRowsParams) => {
                            const rowData: Row[] = [...INITIAL];
                            if (params.needsGrandTotal) {
                                rowData.push(ROW(GRAND_TOTAL_ROW_ID, 'total'));
                            }
                            params.success({ rowData, rowCount: INITIAL.length });
                        },
                    },
                })
            );
            await waitForEvent('firstDataRendered', api);
            const { results } = await applyAsync(api, [
                { update: [ROW(1, 'a')] },
                { update: [ROW(GRAND_TOTAL_ROW_ID, 'total 1')] },
                { update: [ROW(1, 'b')] },
                { update: [ROW(GRAND_TOTAL_ROW_ID, 'total 2')] },
                { remove: [ROW(GRAND_TOTAL_ROW_ID, 'total 2')] },
                { add: [ROW(GRAND_TOTAL_ROW_ID, 'total 3')] },
                { update: [ROW(3, 'c')] },
            ]);
            return { results, diagram: diagramOf(api) };
        });

        const totalId = 'rowGroupFooter_ROOT_NODE_ID';
        // the store keeps the total row outside its rows, so adding or removing it reports no nodes
        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', update: [totalId] },
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', update: [totalId] },
            { status: 'Applied', remove: [] },
            { status: 'Applied', add: [] },
            { status: 'Applied', update: ['3'] },
        ]);
        expect(api.getRowNode(GRAND_TOTAL_ROW_ID)?.data).toEqual(ROW(GRAND_TOTAL_ROW_ID, 'total 3'));
        await new GridRows(api, 'coalesced').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:"0" value:"Row 0"
            ├── LEAF id:1 id:"1" value:"b"
            ├── LEAF id:2 id:"2" value:"Row 2"
            ├── LEAF id:3 id:"3" value:"c"
            ├── LEAF id:4 id:"4" value:"Row 4"
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:"total 3"
        `);
    });

    test('tree data: child adds, a group rename and a sibling removal in one flush give the same tree as in turn', async () => {
        const ROOT = [
            { id: 'p', group: true, name: 'P' },
            { id: 'q', group: false, name: 'Q' },
            { id: 'r', group: false, name: 'R' },
        ];
        const CHILDREN = [{ id: 'c1', group: false, name: 'C1' }];
        let api!: GridApi;
        const coalesced = await compareWithSequential(async (merge) => {
            api = gridsManager.createGrid(null, {
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
            const { results } = await applyAsync(api, [
                { route: ['p'], add: [{ id: 'c2', group: false, name: 'C2' }] },
                { update: [{ ...ROOT[0], name: 'P 2' }] },
                { remove: [ROOT[2]] },
                { route: ['p'], update: [{ ...CHILDREN[0], name: 'C1 2' }] },
            ]);
            return { results, expanded: api.getRowNode('p')!.expanded, diagram: diagramOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', add: ['c2'] },
            { status: 'Applied', update: ['p'] },
            { status: 'Applied', remove: ['r'] },
            { status: 'Applied', update: ['c1'] },
        ]);
        expect(coalesced.expanded).toBe(true);
        await new GridRows(api, 'coalesced').check(`
            ROOT id:<no-id>
            ├─┬ p GROUP id:p ag-Grid-AutoColumn:"p" name:"P 2"
            │ ├── LEAF id:c1 ag-Grid-AutoColumn:null name:"C1 2"
            │ └── LEAF id:c2 ag-Grid-AutoColumn:null name:"C2"
            └── LEAF id:q ag-Grid-AutoColumn:null name:"Q"
        `);
    });

    test('master/detail: an expanded master keeps its detail through coalesced updates, and a re-added master is expanded again', async () => {
        const MASTERS = ['A', 'B', 'C'].map((id) => ({ id, name: `Account ${id}`, records: [{ name: `${id}0` }] }));
        const coalesced = await compareWithSequential(async (merge) => {
            const api = gridsManager.createGrid(null, {
                columnDefs: [{ field: 'id' }, { field: 'name' }],
                rowModelType: 'serverSide',
                serverSideMergeAsyncTransactions: merge,
                masterDetail: true,
                isRowMaster: (data) => !!data?.records?.length,
                detailCellRendererParams: {
                    detailGridOptions: { columnDefs: [{ field: 'name' }] },
                    getDetailRowData: (params: any) => params.successCallback(params.data.records),
                },
                getRowId: (params) => params.data.id,
                serverSideDatasource: {
                    getRows: (params) => params.success({ rowData: MASTERS, rowCount: MASTERS.length }),
                },
            });
            await waitForEvent('firstDataRendered', api);
            api.setRowNodeExpanded(api.getRowNode('A')!, true);
            api.setRowNodeExpanded(api.getRowNode('B')!, true);
            const { results } = await applyAsync(api, [
                { update: [{ ...MASTERS[0], name: 'Account A 2' }] },
                { update: [{ ...MASTERS[0], name: 'Account A 3' }] },
                { remove: [MASTERS[1]] },
                { add: [MASTERS[1]] },
            ]);
            const a = api.getRowNode('A')!;
            const b = api.getRowNode('B')!;
            const hasDetail = (id: string) => !!api.getRowNode(DETAIL_ROW_ID_PREFIX + id)?.detail;
            return {
                results,
                a: { name: a.data.name, expanded: a.expanded, hasDetail: hasDetail('A') },
                b: { expanded: b.expanded, hasDetail: hasDetail('B') },
                displayedIds: Array.from(
                    { length: api.getDisplayedRowCount() },
                    (_, i) => api.getDisplayedRowAtIndex(i)?.id
                ),
            };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['A'] },
            { status: 'Applied', update: ['A'] },
            { status: 'Applied', remove: ['B'] },
            { status: 'Applied', add: ['B'] },
        ]);
        expect(coalesced.a).toEqual({ name: 'Account A 3', expanded: true, hasDetail: true });
        expect(coalesced.b).toEqual({ expanded: true, hasDetail: true });
        expect(coalesced.displayedIds).toEqual(['A', 'detail_A', 'C', 'B', 'detail_B']);
    });

    test('full-width rows follow the latest data after coalesced updates', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const api = gridsManager.createGrid(
                null,
                flatOptions(merge, {
                    isFullWidthRow: (params) => !!params.rowNode.data?.fullWidth,
                    fullWidthCellRenderer: () => 'full width',
                })
            );
            await waitForEvent('firstDataRendered', api);
            const { results } = await applyAsync(api, [
                { update: [{ ...ROW(1, 'a'), fullWidth: true }] },
                { update: [{ ...ROW(1, 'b'), fullWidth: false }] },
                { update: [{ ...ROW(3, 'c'), fullWidth: true }] },
            ]);
            const gridElement = TestGridsManager.getHTMLElement(api)!;
            const fullWidthIds = Array.from(gridElement.querySelectorAll('.ag-full-width-row'), (el) =>
                el.getAttribute('row-id')
            );
            return { results, fullWidthIds, diagram: diagramOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', update: ['3'] },
        ]);
        expect(coalesced.fullWidthIds).toEqual(['3']);
    });

    test('pivot mode: coalesced updates to a group row leave the latest pivot result values', async () => {
        let api!: GridApi;
        const coalesced = await compareWithSequential(async (merge) => {
            api = gridsManager.createGrid(null, {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                pivotMode: true,
                rowModelType: 'serverSide',
                serverSideMergeAsyncTransactions: merge,
                getRowId: (params) => params.data.country,
                serverSideDatasource: {
                    getRows: (params) =>
                        params.success({
                            rowData: [
                                { country: 'USA', '2000_gold': 1, '2004_gold': 2 },
                                { country: 'Russia', '2000_gold': 3, '2004_gold': 4 },
                            ],
                            rowCount: 2,
                            pivotResultFields: ['2000_gold', '2004_gold'],
                        }),
                },
            });
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            const { results } = await applyAsync(api, [
                { update: [{ country: 'USA', '2000_gold': 5, '2004_gold': 2 }] },
                { update: [{ country: 'Russia', '2000_gold': 3, '2004_gold': 9 }] },
                { update: [{ country: 'USA', '2000_gold': 6, '2004_gold': 7 }] },
            ]);
            return { results, rows: rowsOf(api), diagram: diagramOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['USA'] },
            { status: 'Applied', update: ['Russia'] },
            { status: 'Applied', update: ['USA'] },
        ]);
        expect(coalesced.rows).toEqual([
            ['USA', { country: 'USA', '2000_gold': 6, '2004_gold': 7 }],
            ['Russia', { country: 'Russia', '2000_gold': 3, '2004_gold': 9 }],
        ]);
        await new GridRows(api, 'coalesced').check(`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:USA ag-Grid-AutoColumn:"USA" 2000_gold:6 2004_gold:7
            └── GROUP-leafGroup collapsed id:Russia ag-Grid-AutoColumn:"Russia" 2000_gold:3 2004_gold:9
        `);
    });

    test('row spanning: spans follow the latest values after coalesced updates', async () => {
        let api!: GridApi;
        await compareWithSequential(async (merge) => {
            api = gridsManager.createGrid(
                null,
                flatOptions(merge, {
                    enableCellSpan: true,
                    columnDefs: [{ field: 'id' }, { field: 'value', spanRows: true }],
                })
            );
            await waitForEvent('firstDataRendered', api);
            const { results } = await applyAsync(api, [
                { update: [ROW(3, 'Row 4')] },
                { update: [ROW(1, 'Row 0')] },
                { update: [ROW(1, 'Row 2')] },
            ]);
            return { results, diagram: diagramOf(api) };
        });

        await new GridRows(api, 'coalesced').check(`
            ROOT id:<no-id>
            ├── LEAF id:0 id:"0" value:"Row 0"
            ├── LEAF id:1 id:"1" value:"Row 2"↧2
            ├── LEAF id:2 id:"2" value:"Row 2"↥
            ├── LEAF id:3 id:"3" value:"Row 4"↧2
            └── LEAF id:4 id:"4" value:"Row 4"↥
        `);
    });

    test('a sync transaction between queued async ones applies first, as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const api = gridsManager.createGrid(null, flatOptions(merge));
            await waitForEvent('firstDataRendered', api);
            const results: ServerSideTransactionResult[] = [];
            const queue = (tx: ServerSideTransaction) =>
                api.applyServerSideTransactionAsync(tx, (r) => results.push(r));
            queue({ update: [ROW(1, 'async 1')] });
            queue({ update: [ROW(3, 'async 3')] });
            const sync = api.applyServerSideTransaction({ update: [ROW(1, 'sync')], remove: [ROW(3, 'Row 3')] });
            queue({ update: [ROW(1, 'async 2')] });
            expect(api.getRowNode('1')!.data).toEqual(ROW(1, 'sync'));
            api.flushServerSideAsyncTransactions();
            await vi.waitFor(() => expect(results).toHaveLength(3));
            return { sync: summarise(sync!), results: results.map(summarise), rows: rowsOf(api) };
        });

        expect(coalesced.sync).toEqual({ status: 'Applied', update: ['1'], remove: ['3'] });
        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', update: [] },
            { status: 'Applied', update: ['1'] },
        ]);
        expect(coalesced.rows).toEqual([
            ['0', ROW(0, 'Row 0')],
            ['1', ROW(1, 'async 2')],
            ['2', ROW(2, 'Row 2')],
            ['4', ROW(4, 'Row 4')],
        ]);
    });

    test('without getRowId every queued transaction is cancelled, as in turn', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [206] });
        const coalesced = await compareWithSequential(async (merge) => {
            const api = gridsManager.createGrid(null, flatOptions(merge, { getRowId: undefined }));
            await waitForEvent('firstDataRendered', api);
            const { results } = await applyAsync(api, [
                { add: [ROW(50, 'new')] },
                { update: [ROW(1, 'a')] },
                { remove: [ROW(2, 'Row 2')] },
            ]);
            return { results, data: rowsOf(api).map(([, data]) => data) };
        });

        expect(coalesced.results).toEqual([{ status: 'Cancelled' }, { status: 'Cancelled' }, { status: 'Cancelled' }]);
        expect(coalesced.data).toEqual(INITIAL);
    });

    test('a purge between queueing and flushing applies the transactions to the reloaded rows, as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const api = gridsManager.createGrid(null, flatOptions(merge));
            await waitForEvent('firstDataRendered', api);
            const results: ServerSideTransactionResult[] = [];
            for (const tx of [{ update: [ROW(1, 'a')] }, { add: [ROW(50, 'new')] }, { update: [ROW(1, 'b')] }]) {
                api.applyServerSideTransactionAsync(tx, (r) => results.push(r));
            }
            api.refreshServerSide({ purge: true });
            await waitForNoLoadingRows(api);
            api.flushServerSideAsyncTransactions();
            await vi.waitFor(() => expect(results).toHaveLength(3));
            return { results: results.map(summarise), rows: rowsOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', add: ['50'] },
            { status: 'Applied', update: ['1'] },
        ]);
        expect(coalesced.rows).toEqual([
            ['0', ROW(0, 'Row 0')],
            ['1', ROW(1, 'b')],
            ['2', ROW(2, 'Row 2')],
            ['3', ROW(3, 'Row 3')],
            ['4', ROW(4, 'Row 4')],
            ['50', ROW(50, 'new')],
        ]);
    });

    test('transactions flushed while the first block is loading give the same rows as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            let pending: IServerSideGetRowsParams | undefined;
            const api = gridsManager.createGrid(
                null,
                flatOptions(merge, {
                    serverSideDatasource: {
                        getRows: (params) => {
                            pending = params;
                        },
                    },
                })
            );
            await vi.waitFor(() => expect(pending).toBeDefined());
            const { results } = await applyAsync(api, [
                { update: [ROW(1, 'a')] },
                { add: [ROW(50, 'new')] },
                { update: [ROW(1, 'b')] },
                { remove: [ROW(2, 'Row 2')] },
            ]);
            pending!.success({ rowData: INITIAL, rowCount: INITIAL.length });
            await waitForNoLoadingRows(api);
            return { results, rows: rowsOf(api) };
        });

        // a store with no rows loaded yet ignores the changes, and the loaded block then replaces it
        expect(coalesced.results).toEqual([
            { status: 'Applied', update: [] },
            { status: 'Applied', add: [] },
            { status: 'Applied', update: [] },
            { status: 'Applied', remove: [] },
        ]);
        expect(coalesced.rows).toEqual(INITIAL.map((row) => [row.id, row]));
    });

    test('transactions for a route whose load failed report the same results as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            let failed = false;
            const options = groupedOptions(merge);
            const getRows = options.serverSideDatasource!.getRows;
            options.serverSideDatasource = {
                getRows: (params) => {
                    if (params.request.groupKeys.length) {
                        failed = true;
                        params.fail();
                    } else {
                        getRows(params);
                    }
                },
            };
            const api = await createGroupedGrid(options, []);
            api.setRowNodeExpanded(api.getRowNode('group-UK')!, true);
            await vi.waitFor(() => expect(failed).toBe(true));
            const { results } = await applyAsync(api, [
                { route: ['UK'], add: [{ id: 'uk-zed', country: 'UK', athlete: 'Zed', sales: 1 }] },
                { route: ['UK'], update: [{ ...LEAVES[0], athlete: 'Alice 2' }] },
                { update: [GROUP('UK', 10)] },
            ]);
            return { results, rows: rowsOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', add: [] },
            { status: 'Applied', update: [] },
            { status: 'Applied', update: ['group-UK'] },
        ]);
        // the failed block is left as a single stub row with no id
        expect(coalesced.rows).toEqual([
            ['group-UK', GROUP('UK', 10)],
            [undefined, undefined],
            ['group-US', GROUP('US', 3)],
        ]);
    });

    test('a transaction queued from isApplyServerSideTransaction during a flush is applied after the queued ones', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const late: ServerSideTransactionResult[] = [];
            let queuedLate = false;
            const api = gridsManager.createGrid(
                null,
                flatOptions(merge, {
                    isApplyServerSideTransaction: (params) => {
                        if (!queuedLate) {
                            queuedLate = true;
                            params.api.applyServerSideTransactionAsync({ update: [ROW(1, 'late')] }, (r) =>
                                late.push(r)
                            );
                        }
                        return true;
                    },
                })
            );
            await waitForEvent('firstDataRendered', api);
            const { results, flushed } = await applyAsync(api, [
                { update: [ROW(1, 'first')] },
                { update: [ROW(1, 'second')] },
            ]);
            await vi.waitFor(() => expect(late).toHaveLength(1));
            return {
                results,
                late: late.map(summarise),
                flushed: flushed.map(summarise),
                row1: api.getRowNode('1')!.data,
            };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', update: ['1'] },
        ]);
        expect(coalesced.late).toEqual([{ status: 'Applied', update: ['1'] }]);
        expect(coalesced.flushed).toEqual([...coalesced.results, ...coalesced.late]);
        expect(coalesced.row1).toEqual(ROW(1, 'late'));
    });

    test('the flushed event and each result callback receive the same result object for coalesced transactions', async () => {
        const api = gridsManager.createGrid(null, flatOptions(true));
        await waitForEvent('firstDataRendered', api);
        const callbackResults: ServerSideTransactionResult[] = [];
        let flushed: ServerSideTransactionResult[] = [];
        api.addEventListener(
            'asyncTransactionsFlushed',
            (event) => (flushed = event.results as ServerSideTransactionResult[])
        );
        FLAT_TRANSACTIONS.forEach((tx, index) =>
            api.applyServerSideTransactionAsync(tx, (result) => (callbackResults[index] = result))
        );
        api.flushServerSideAsyncTransactions();
        await vi.waitFor(() => expect(callbackResults.filter(Boolean)).toHaveLength(FLAT_TRANSACTIONS.length));

        expect(flushed).toHaveLength(FLAT_TRANSACTIONS.length);
        flushed.forEach((result, index) => expect(result).toBe(callbackResults[index]));
        expect(flushed.map(summarise)).toEqual(FLAT_EXPECTED_RESULTS);
    });

    test('destroying the grid before the queue is flushed reports the same results as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const api = gridsManager.createGrid(null, flatOptions(merge, { asyncTransactionWaitMillis: 0 }));
            await waitForEvent('firstDataRendered', api);
            const results: ServerSideTransactionResult[] = [];
            api.applyServerSideTransactionAsync({ update: [ROW(1, 'a')] }, (r) => results.push(r));
            api.applyServerSideTransactionAsync({ update: [ROW(1, 'b')] }, (r) => results.push(r));
            api.destroy();
            await vi.waitFor(() => expect(results).toHaveLength(2));
            return results.map(summarise);
        });

        expect(coalesced).toEqual([{ status: 'StoreNotFound' }, { status: 'StoreNotFound' }]);
    });

    test('turning the option on or off at runtime changes how the queued transactions are applied', async () => {
        const seen: string[] = [];
        const api = gridsManager.createGrid(
            null,
            flatOptions(false, {
                isApplyServerSideTransaction: (params) => {
                    seen.push(params.api.getRowNode('1')!.data.value);
                    return true;
                },
            })
        );
        await waitForEvent('firstDataRendered', api);

        api.applyServerSideTransactionAsync({ update: [ROW(1, 'first')] });
        api.applyServerSideTransactionAsync({ update: [ROW(1, 'second')] });
        api.setGridOption('serverSideMergeAsyncTransactions', true);
        api.flushServerSideAsyncTransactions();
        // coalesced: both are accepted against the state from before the batch
        expect(seen).toEqual(['Row 1', 'Row 1']);
        expect(api.getRowNode('1')!.data).toEqual(ROW(1, 'second'));

        api.applyServerSideTransactionAsync({ update: [ROW(1, 'third')] });
        api.applyServerSideTransactionAsync({ update: [ROW(1, 'fourth')] });
        api.setGridOption('serverSideMergeAsyncTransactions', false);
        api.flushServerSideAsyncTransactions();
        // in turn: each is accepted against the result of the one before
        expect(seen).toEqual(['Row 1', 'Row 1', 'second', 'third']);
        expect(api.getRowNode('1')!.data).toEqual(ROW(1, 'fourth'));
    });

    test('a store left empty by the server takes coalesced adds, updates and removes as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const api = gridsManager.createGrid(null, flatOptions(merge, {}, []));
            await waitForNoLoadingRows(api);
            const { results } = await applyAsync(api, [
                { add: [ROW('a', 'A'), ROW('b', 'B')] },
                { update: [ROW('a', 'A 2')] },
                { remove: [ROW('b', 'B')] },
                { add: [ROW('c', 'C')] },
            ]);
            return { results, rows: rowsOf(api), displayed: api.getDisplayedRowCount() };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', add: ['a', 'b'] },
            { status: 'Applied', update: ['a'] },
            { status: 'Applied', remove: ['b'] },
            { status: 'Applied', add: ['c'] },
        ]);
        expect(coalesced.rows).toEqual([
            ['a', ROW('a', 'A 2')],
            ['c', ROW('c', 'C')],
        ]);
        expect(coalesced.displayed).toBe(2);
    });

    test('the flush scheduled by asyncTransactionWaitMillis coalesces the queued transactions too', async () => {
        const seen: string[] = [];
        const api = gridsManager.createGrid(
            null,
            flatOptions(true, {
                asyncTransactionWaitMillis: 0,
                isApplyServerSideTransaction: (params) => {
                    seen.push(params.api.getRowNode('1')!.data.value);
                    return true;
                },
            })
        );
        await waitForEvent('firstDataRendered', api);
        const results: ServerSideTransactionResult[] = [];
        api.applyServerSideTransactionAsync({ update: [ROW(1, 'first')] }, (r) => results.push(r));
        api.applyServerSideTransactionAsync({ update: [ROW(1, 'second')] }, (r) => results.push(r));
        await vi.waitFor(() => expect(results).toHaveLength(2));

        expect(seen).toEqual(['Row 1', 'Row 1']);
        expect(results.map(summarise)).toEqual([
            { status: 'Applied', update: ['1'] },
            { status: 'Applied', update: ['1'] },
        ]);
        expect(api.getRowNode('1')!.data).toEqual(ROW(1, 'second'));
    });

    test('row ids built from parentKeys resolve to the same rows for coalesced child transactions as in turn', async () => {
        const coalesced = await compareWithSequential(async (merge) => {
            const api = await createGroupedGrid(
                groupedOptions(merge, {
                    getRowId: ({ data, parentKeys }) => [...(parentKeys ?? []), data.id ?? data.country].join('/'),
                }),
                ['UK', 'US']
            );
            expect(api.getRowNode('UK/uk-bob')).toBeDefined();
            const { results } = await applyAsync(api, [
                { route: ['UK'], update: [{ ...LEAVES[0], athlete: 'Alice 2' }] },
                { route: ['UK'], remove: [LEAVES[1]] },
                { route: ['US'], update: [{ ...LEAVES[2], athlete: 'Frank 2' }] },
                { route: ['UK'], add: [{ id: 'uk-zed', country: 'UK', athlete: 'Zed', sales: 1 }] },
                { route: ['UK'], update: [{ ...LEAVES[0], athlete: 'Alice 3' }] },
            ]);
            return { results, rows: rowsOf(api) };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['UK/uk-alice'] },
            { status: 'Applied', remove: ['UK/uk-bob'] },
            { status: 'Applied', update: ['US/us-frank'] },
            { status: 'Applied', add: ['UK/uk-zed'] },
            { status: 'Applied', update: ['UK/uk-alice'] },
        ]);
        expect(coalesced.rows).toEqual([
            ['UK', GROUP('UK', 3)],
            ['UK/uk-alice', { ...LEAVES[0], athlete: 'Alice 3' }],
            ['UK/uk-zed', { id: 'uk-zed', country: 'UK', athlete: 'Zed', sales: 1 }],
            ['US', GROUP('US', 3)],
            ['US/us-frank', { ...LEAVES[2], athlete: 'Frank 2' }],
        ]);
    });

    test('a partially loaded store takes coalesced adds and updates across loaded and unloaded blocks as in turn', async () => {
        const SERVER_ROWS = Array.from({ length: 300 }, (_, i) => ROW(i, `Row ${i}`));
        const coalesced = await compareWithSequential(async (merge) => {
            const requests: [number | undefined, number | undefined][] = [];
            const api = gridsManager.createGrid(
                null,
                flatOptions(merge, {
                    cacheBlockSize: 100,
                    maxBlocksInCache: 2,
                    rowBuffer: 0,
                    suppressRowVirtualisation: false,
                    serverSideDatasource: {
                        getRows: (params) => {
                            requests.push([params.request.startRow, params.request.endRow]);
                            const rowData = SERVER_ROWS.slice(params.request.startRow, params.request.endRow);
                            params.success({ rowData, rowCount: SERVER_ROWS.length });
                        },
                    },
                })
            );
            await waitForEvent('firstDataRendered', api);
            api.ensureIndexVisible(250);
            await waitForNoLoadingRows(api);
            const loadedBefore = requests.length;

            const { results } = await applyAsync(api, [
                { update: [ROW(5, 'a')] },
                { add: [ROW('n1', 'new 1')] },
                { update: [ROW(150, 'unloaded')] },
                { add: [ROW('n2', 'new 2')] },
                { update: [ROW(5, 'b'), ROW(250, 'c')] },
            ]);
            await waitForNoLoadingRows(api);
            return {
                results,
                requestsAfter: requests.slice(loadedBefore),
                cached: ['5', '150', '250', 'n1', 'n2'].map((id) => api.getRowNode(id)?.data ?? null),
                displayedRowCount: api.getDisplayedRowCount(),
            };
        });

        expect(coalesced.results).toEqual([
            { status: 'Applied', update: ['5'] },
            { status: 'Applied', add: ['n1'] },
            { status: 'Applied', update: [] },
            { status: 'Applied', add: ['n2'] },
            { status: 'Applied', update: ['5', '250'] },
        ]);
        expect(coalesced.requestsAfter).toEqual([]);
        expect(coalesced.displayedRowCount).toBe(302);
        // row 5 is updated, then its block is no longer cached after the flush, in both modes
        expect(coalesced.cached).toEqual([null, null, ROW(250, 'c'), ROW('n1', 'new 1'), ROW('n2', 'new 2')]);
    });
});
