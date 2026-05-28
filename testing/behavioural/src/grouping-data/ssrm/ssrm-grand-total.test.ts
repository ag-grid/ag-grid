import type {
    GetRowIdParams,
    GridApi,
    GridOptions,
    IServerSideDatasource,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import {
    GRAND_TOTAL_ROW_ID,
    NumberFilterModule,
    PaginationModule,
    PinnedRowModule,
    ROOT_NODE_ID,
} from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import {
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    unindentText,
    waitForEvent,
    waitForNoLoadingRows,
} from '../../test-utils';

const GRAND_TOTAL_ID = GRAND_TOTAL_ROW_ID;

describe('SSRM grand total row', () => {
    const gridManager = new TestGridsManager({
        modules: [
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            RowGroupingModule,
            PaginationModule,
            NumberFilterModule,
            PinnedRowModule,
        ],
    });

    afterEach(() => {
        gridManager.reset();
    });

    interface RowData {
        id: string;
        value: number;
        category?: string;
    }

    const flatRows: RowData[] = [
        { id: '1', value: 10 },
        { id: '2', value: 20 },
        { id: '3', value: 30 },
    ];

    function createFlatDatasource(opts?: {
        grandTotalValue?: number;
        onGetRows?: (params: IServerSideGetRowsParams) => void;
    }): IServerSideDatasource {
        return {
            getRows(params: IServerSideGetRowsParams) {
                opts?.onGetRows?.(params);
                const rowData: any[] = [...flatRows];
                if (params.needsGrandTotal) {
                    rowData.push({ id: GRAND_TOTAL_ID, value: opts?.grandTotalValue ?? 60 });
                }
                setTimeout(() => {
                    params.success({ rowData, rowCount: flatRows.length });
                }, 0);
            },
        };
    }

    function createFlatGridOptions(
        overrides: Partial<GridOptions<RowData>> & { grandTotalRow: GridOptions['grandTotalRow'] }
    ): GridOptions<RowData> {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            serverSideDatasource: createFlatDatasource(),
            ...overrides,
        };
    }

    // --- Flat grid tests ---

    test('grand total at bottom - flat grid', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'bottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'flat grand total bottom');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('grand total at top - flat grid', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'top',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'flat grand total top');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
    });

    test('needsGrandTotal is true for root store, false when grandTotalRow not set', async () => {
        const getRowsCalls: { needsGrandTotal: boolean; groupKeys: string[] }[] = [];

        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    getRowsCalls.push({
                        needsGrandTotal: params.needsGrandTotal,
                        groupKeys: params.request.groupKeys,
                    });
                    const rowData: any[] = [...flatRows];
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ID, value: 60 });
                    }
                    setTimeout(() => {
                        params.success({ rowData, rowCount: flatRows.length });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(getRowsCalls.length).toBeGreaterThanOrEqual(1);
        // Root store call should have needsGrandTotal = true
        expect(getRowsCalls[0].needsGrandTotal).toBe(true);
        expect(getRowsCalls[0].groupKeys).toEqual([]);
    });

    test('needsGrandTotal is false when grandTotalRow option not set', async () => {
        const getRowsCalls: { needsGrandTotal: boolean }[] = [];

        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            // No grandTotalRow set
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    getRowsCalls.push({
                        needsGrandTotal: params.needsGrandTotal,
                    });
                    setTimeout(() => {
                        params.success({ rowData: flatRows, rowCount: flatRows.length });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(getRowsCalls.length).toBeGreaterThanOrEqual(1);
        expect(getRowsCalls[0].needsGrandTotal).toBe(false);
    });

    test('needsGrandTotal becomes true again after filter change', async () => {
        const getRowsCalls: { needsGrandTotal: boolean }[] = [];

        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', filter: 'agNumberColumnFilter' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    getRowsCalls.push({ needsGrandTotal: params.needsGrandTotal });
                    const filter = params.request.filterModel as { value?: { filter?: number } } | null;
                    const threshold = filter?.value?.filter;
                    const filtered = threshold != null ? flatRows.filter((r) => r.value > threshold) : flatRows;
                    const rowData: any[] = [...filtered];
                    if (params.needsGrandTotal) {
                        const total = filtered.reduce((sum, r) => sum + r.value, 0);
                        rowData.push({ id: GRAND_TOTAL_ID, value: total });
                    }
                    setTimeout(() => {
                        params.success({ rowData, rowCount: filtered.length });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(getRowsCalls[0].needsGrandTotal).toBe(true);

        const callsBeforeFilter = getRowsCalls.length;
        api.setFilterModel({ value: { type: 'greaterThan', filter: 15 } });
        await waitForNoLoadingRows(api);

        // A new root load must have occurred after the filter change, with needsGrandTotal=true
        expect(getRowsCalls.length).toBeGreaterThan(callsBeforeFilter);
        expect(getRowsCalls[callsBeforeFilter].needsGrandTotal).toBe(true);
    });

    test('needsGrandTotal becomes true again after aggregation change', async () => {
        const getRowsCalls: { needsGrandTotal: boolean }[] = [];

        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    getRowsCalls.push({ needsGrandTotal: params.needsGrandTotal });
                    const rowData: any[] = [...flatRows];
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ID, value: 60 });
                    }
                    setTimeout(() => {
                        params.success({ rowData, rowCount: flatRows.length });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(getRowsCalls[0].needsGrandTotal).toBe(true);

        const callsBeforeAgg = getRowsCalls.length;
        api.setColumnAggFunc('value', 'avg');
        await waitForNoLoadingRows(api);

        // Aggregation change resets the root store, so the next load requires fresh grand total data
        expect(getRowsCalls.length).toBeGreaterThan(callsBeforeAgg);
        expect(getRowsCalls[callsBeforeAgg].needsGrandTotal).toBe(true);
    });

    test('needsGrandTotal stays false after sort change (grand total data retained)', async () => {
        const getRowsCalls: { needsGrandTotal: boolean }[] = [];

        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', sortable: true }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    getRowsCalls.push({ needsGrandTotal: params.needsGrandTotal });
                    const sorted = [...flatRows];
                    const sort = params.request.sortModel[0];
                    if (sort?.colId === 'value') {
                        sorted.sort((a, b) => (sort.sort === 'asc' ? a.value - b.value : b.value - a.value));
                    }
                    const rowData: any[] = sorted;
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ID, value: 60 });
                    }
                    setTimeout(() => {
                        params.success({ rowData, rowCount: flatRows.length });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(getRowsCalls[0].needsGrandTotal).toBe(true);

        const callsBeforeSort = getRowsCalls.length;
        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });
        await waitForNoLoadingRows(api);

        // Sort rebuilds the cache but the grand total data on the store is retained,
        // so subsequent loads must not request it again.
        expect(getRowsCalls.length).toBeGreaterThan(callsBeforeSort);
        for (let i = callsBeforeSort; i < getRowsCalls.length; i++) {
            expect(getRowsCalls[i].needsGrandTotal).toBe(false);
        }
    });

    test('grand total row in response is filtered from display but data is kept when grandTotalRow not configured', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            // No grandTotalRow set
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    // Server always includes grand total row
                    const rows: any[] = [...flatRows, { id: GRAND_TOTAL_ID, value: 60 }];
                    setTimeout(() => {
                        params.success({ rowData: rows, rowCount: flatRows.length });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Grand total row should be filtered out — only data rows visible
        const gridRows = new GridRows(api, 'no grand total configured');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);

        // Grand total node should not exist as a displayed row
        expect(api.getRowNode(GRAND_TOTAL_ID)).toBeUndefined();
    });

    test('duplicate grand total rows in response triggers warning', async () => {
        // Suppress expected console warnings for duplicate IDs
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        let getRowsCalled = false;
        gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    getRowsCalled = true;
                    // Server accidentally returns two grand total rows — triggers duplicate ID warning
                    const rows: any[] = [
                        { id: GRAND_TOTAL_ID, value: 100 },
                        ...flatRows,
                        { id: GRAND_TOTAL_ID, value: 60 },
                    ];
                    setTimeout(() => {
                        params.success({ rowData: rows, rowCount: flatRows.length });
                    }, 0);
                },
            },
        });

        // Wait for getRows to be called and the response to be processed
        while (!getRowsCalled) {
            await new Promise((r) => setTimeout(r, 1));
        }
        await new Promise((r) => setTimeout(r, 50));

        // The duplicate warning should have been issued
        expect(warnSpy).toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    // --- Transaction tests ---

    test('transaction update grand total row', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'bottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Update grand total value
        api.applyServerSideTransaction({
            update: [{ id: GRAND_TOTAL_ID, value: 999 }],
        });

        const gridRows = new GridRows(api, 'after update');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:999
        `);
    });

    test('transaction remove grand total row', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'bottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Remove grand total
        api.applyServerSideTransaction({
            remove: [{ id: GRAND_TOTAL_ID, value: 60 }],
        });

        const gridRows = new GridRows(api, 'after remove');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
    });

    test('transaction add grand total row', async () => {
        // Start without grand total in response
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    // Don't include grand total in initial response
                    setTimeout(() => {
                        params.success({ rowData: [...flatRows], rowCount: flatRows.length });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // No grand total yet
        let gridRows = new GridRows(api, 'before add');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);

        // Add grand total via transaction
        api.applyServerSideTransaction({
            add: [{ id: GRAND_TOTAL_ID, value: 60 }],
        });

        gridRows = new GridRows(api, 'after add');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    // --- Grand total row properties ---

    test('grand total row has correct properties', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'bottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const grandTotalNode = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotalNode).toBeDefined();
        expect(grandTotalNode!.footer).toBe(true);
        expect(grandTotalNode!.level).toBe(-1);
        expect(grandTotalNode!.group).toBe(false);
        expect(grandTotalNode!.id).toBe(GRAND_TOTAL_ID);
        expect(grandTotalNode!.data.value).toBe(60);

        const rootNode = api.getRowNode(ROOT_NODE_ID);
        expect(rootNode?.level).toBe(-1);
        expect(rootNode?.group).toBe(true);
    });

    // --- Grand total does not break pagination / row count ---

    test('grand total row does not inflate displayed row count for pagination', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'bottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // The grand total row should be accessible via getRowNode
        const grandTotal = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotal).toBeDefined();

        // Display count includes the grand total row (it has a display index)
        const displayedCount = api.getDisplayedRowCount();
        // 3 data rows + 1 grand total = 4 displayed rows
        expect(displayedCount).toBe(4);
    });

    // --- Grouped grid with grand total ---

    test('grand total with grouped grid', async () => {
        interface GroupedRow {
            id: string;
            category: string;
            value: number;
            group?: true;
            leafGroup?: boolean;
            key?: string | null;
        }

        const serverRows: GroupedRow[] = [
            { id: 'a1', category: 'A', value: 10 },
            { id: 'a2', category: 'A', value: 20 },
            { id: 'b1', category: 'B', value: 30 },
        ];

        const datasource: IServerSideDatasource = {
            getRows(params: IServerSideGetRowsParams) {
                const { request } = params;
                let rowData: any[];

                if (request.groupKeys.length === 0) {
                    // Root level — return groups
                    const groups = new Map<string, number>();
                    for (const row of serverRows) {
                        groups.set(row.category, (groups.get(row.category) ?? 0) + row.value);
                    }
                    rowData = [...groups.entries()].map(([category, value]) => ({
                        id: `category:${category}`,
                        category,
                        value,
                        group: true,
                        leafGroup: true,
                        key: category,
                    }));
                    if (params.needsGrandTotal) {
                        const totalValue = serverRows.reduce((sum, r) => sum + r.value, 0);
                        rowData.push({ id: GRAND_TOTAL_ID, value: totalValue });
                    }
                } else {
                    // Child level — return leaf rows for the group
                    const groupKey = request.groupKeys[0];
                    rowData = serverRows.filter((r) => r.category === groupKey).map((r) => ({ ...r }));
                }

                // rowCount excludes the grand total — it represents data rows only
                const dataRowCount =
                    request.groupKeys.length === 0
                        ? rowData.filter((r: any) => r.id !== GRAND_TOTAL_ID).length
                        : rowData.length;
                setTimeout(() => {
                    params.success({ rowData, rowCount: dataRowCount });
                }, 0);
            },
        };

        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<GroupedRow>) => params.data.id,
            serverSideDatasource: datasource,
            grandTotalRow: 'bottom',
            groupTotalRow: 'bottom',
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'grouped with grand total');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:"category:A" ag-Grid-AutoColumn:"A" category:"A" value:30
            ├── GROUP-leafGroup collapsed id:"category:B" ag-Grid-AutoColumn:"B" category:"B" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " value:60
        `);

        const grandTotalNode = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotalNode?.footer).toBe(true);
        expect(grandTotalNode?.data?.value).toBe(60);
    });

    // --- Pagination tests ---

    test('grand total row with pagination', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            pagination: true,
            paginationPageSize: 2,
            paginationPageSizeSelector: false,
            serverSideDatasource: createFlatDatasource(),
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Grand total should be visible alongside data rows
        const grandTotal = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotal).toBeDefined();

        // getDisplayedRowCount includes the grand total
        expect(api.getDisplayedRowCount()).toBe(4);
    });

    test('grand total at pinnedBottom renders in pinned area, not inline', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'pinnedBottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Grand total is in the pinned bottom area, not inline with data rows
        await new GridRows(api, 'pinnedBottom').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);

        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(60);
        // Displayed (non-pinned) row count should not include the pinned grand total
        expect(api.getDisplayedRowCount()).toBe(3);
    });

    test('grand total at pinnedTop renders in pinned area, not inline', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'pinnedTop',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'pinnedTop').check(unindentText`
            PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);

        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(0);
        expect(api.getPinnedTopRow(0)?.data?.value).toBe(60);
        expect(api.getDisplayedRowCount()).toBe(3);
    });

    test('cycle through grandTotalRow positions including pinned', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'bottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // bottom (inline)
        await new GridRows(api, 'bottom').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
        expect(api.getPinnedBottomRowCount()).toBe(0);

        // bottom → pinnedBottom
        api.setGridOption('grandTotalRow', 'pinnedBottom');
        await asyncSetTimeout(10);

        await new GridRows(api, 'pinnedBottom').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedTopRowCount()).toBe(0);
        const pinnedBottomNode = api.getPinnedBottomRow(0)!;
        expect(pinnedBottomNode.destroyed).toBe(false);

        // pinnedBottom → pinnedTop: the previous pinned-bottom sibling must be destroyed,
        // not orphaned in the bottom container.
        api.setGridOption('grandTotalRow', 'pinnedTop');
        await asyncSetTimeout(10);

        await new GridRows(api, 'pinnedTop').check(unindentText`
            PINNED_TOP id:t-top-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(0);
        expect(pinnedBottomNode.destroyed).toBe(true);
        const pinnedTopNode = api.getPinnedTopRow(0)!;
        expect(pinnedTopNode.destroyed).toBe(false);

        // pinnedTop → top (back to inline). The pinned-top sibling must be destroyed.
        api.setGridOption('grandTotalRow', 'top');
        await asyncSetTimeout(10);
        expect(pinnedTopNode.destroyed).toBe(true);

        await new GridRows(api, 'top').check(unindentText`
            ROOT id:<no-id>
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(api.getPinnedBottomRowCount()).toBe(0);

        // top → pinnedBottom
        api.setGridOption('grandTotalRow', 'pinnedBottom');
        await asyncSetTimeout(10);

        await new GridRows(api, 'pinnedBottom again').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        // pinnedBottom → undefined (grand total removed). The pinned sibling must be destroyed.
        const lastPinnedBottomNode = api.getPinnedBottomRow(0)!;
        api.setGridOption('grandTotalRow', undefined);
        await asyncSetTimeout(10);

        await new GridRows(api, 'disabled').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
        expect(api.getPinnedBottomRowCount()).toBe(0);
        expect(api.getPinnedTopRowCount()).toBe(0);
        expect(lastPinnedBottomNode.destroyed).toBe(true);
    });

    test('pinned grand total updates when value changes via transaction', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'pinnedBottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(60);

        api.applyServerSideTransaction({
            update: [{ id: GRAND_TOTAL_ID, value: 999 }],
        });
        await asyncSetTimeout(10);

        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(999);
        await new GridRows(api, 'after pinned grand total update').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:999
        `);
    });

    test('pinned grand total with grouped grid', async () => {
        interface GroupedRow {
            id: string;
            category: string;
            value: number;
        }

        const serverRows: GroupedRow[] = [
            { id: 'a1', category: 'A', value: 10 },
            { id: 'a2', category: 'A', value: 20 },
            { id: 'b1', category: 'B', value: 30 },
        ];

        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<GroupedRow>) => params.data.id,
            grandTotalRow: 'pinnedBottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const { request } = params;
                    let rowData: any[];

                    if (request.groupKeys.length === 0) {
                        const groups = new Map<string, number>();
                        for (const row of serverRows) {
                            groups.set(row.category, (groups.get(row.category) ?? 0) + row.value);
                        }
                        rowData = [...groups.entries()].map(([category, value]) => ({
                            id: `category:${category}`,
                            category,
                            value,
                            group: true,
                            leafGroup: true,
                            key: category,
                        }));
                        if (params.needsGrandTotal) {
                            const total = serverRows.reduce((s, r) => s + r.value, 0);
                            rowData.push({ id: GRAND_TOTAL_ID, value: total });
                        }
                    } else {
                        const groupKey = request.groupKeys[0];
                        rowData = serverRows.filter((r) => r.category === groupKey).map((r) => ({ ...r }));
                    }

                    const dataRowCount =
                        request.groupKeys.length === 0
                            ? rowData.filter((r: any) => r.id !== GRAND_TOTAL_ID).length
                            : rowData.length;
                    setTimeout(() => params.success({ rowData, rowCount: dataRowCount }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        await new GridRows(api, 'grouped pinnedBottom').check(unindentText`
            ROOT id:<no-id>
            ├── GROUP-leafGroup collapsed id:"category:A" ag-Grid-AutoColumn:"A" category:"A" value:30
            └── GROUP-leafGroup collapsed id:"category:B" ag-Grid-AutoColumn:"B" category:"B" value:30
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID ag-Grid-AutoColumn:"Total " value:60
        `);

        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(60);
    });

    // --- Updating grand total via getRows / transaction ---

    test('grand total updates when getRows returns a new value via id in rowData', async () => {
        let total = 60;
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const rowData: any[] = [...flatRows];
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ID, value: total });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: flatRows.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(60);

        const originalNodeId = api.getRowNode(GRAND_TOTAL_ID)?.id;
        total = 999;
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // The same node is updated in place (compare by id to avoid row-node deep diff on failure)
        expect(api.getRowNode(GRAND_TOTAL_ID)?.id).toBe(originalNodeId);
        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(999);

        await new GridRows(api, 'after getRows id update').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:999
        `);
    });

    test('pinned grand total updates when value changes via transaction update', async () => {
        const api = gridManager.createGrid(null, createFlatGridOptions({ grandTotalRow: 'pinnedTop' }));

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getPinnedTopRow(0)?.data?.value).toBe(60);

        api.applyServerSideTransaction({ update: [{ id: GRAND_TOTAL_ID, value: 321 }] });
        await asyncSetTimeout(10);

        expect(api.getPinnedTopRow(0)?.data?.value).toBe(321);
        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(0);
    });

    test('grand total updates when getRows returns a new value via grandTotalData field', async () => {
        let total = 60;
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({
                            rowData: [...flatRows],
                            rowCount: flatRows.length,
                            grandTotalData: { id: GRAND_TOTAL_ID, value: total },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(60);

        const originalNodeId = api.getRowNode(GRAND_TOTAL_ID)?.id;
        total = 123;
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(123);
        expect(api.getRowNode(GRAND_TOTAL_ID)?.id).toBe(originalNodeId);
    });

    test('grand total is unaffected when getRows is called on a child group', async () => {
        // Expanding a group calls getRows on the group's store (not the root). The root's
        // grand total must not be destroyed or duplicated by that load.
        interface GroupedRow {
            id: string;
            category: string;
            value: number;
        }

        const serverRows: GroupedRow[] = [
            { id: 'a1', category: 'A', value: 10 },
            { id: 'a2', category: 'A', value: 20 },
            { id: 'b1', category: 'B', value: 30 },
        ];
        const groupKeysCalls: string[][] = [];

        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<GroupedRow>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const { request } = params;
                    groupKeysCalls.push([...request.groupKeys]);
                    let rowData: any[];

                    if (request.groupKeys.length === 0) {
                        const groups = new Map<string, number>();
                        for (const row of serverRows) {
                            groups.set(row.category, (groups.get(row.category) ?? 0) + row.value);
                        }
                        rowData = [...groups.entries()].map(([category, value]) => ({
                            id: `category:${category}`,
                            category,
                            value,
                            group: true,
                            leafGroup: true,
                            key: category,
                        }));
                        if (params.needsGrandTotal) {
                            const total = serverRows.reduce((s, r) => s + r.value, 0);
                            rowData.push({ id: GRAND_TOTAL_ID, value: total });
                        }
                    } else {
                        const groupKey = request.groupKeys[0];
                        rowData = serverRows.filter((r) => r.category === groupKey).map((r) => ({ ...r }));
                    }

                    const dataRowCount =
                        request.groupKeys.length === 0
                            ? rowData.filter((r: any) => r.id !== GRAND_TOTAL_ID).length
                            : rowData.length;
                    setTimeout(() => params.success({ rowData, rowCount: dataRowCount }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        const grandTotalNodeId = api.getRowNode(GRAND_TOTAL_ID)?.id;
        expect(grandTotalNodeId).toBeDefined();
        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(60);

        // Expanding group A triggers getRows({groupKeys: ['A']}) on the group store
        groupKeysCalls.length = 0;
        api.getRowNode('category:A')?.setExpanded(true);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(10);

        expect(groupKeysCalls).toEqual([['A']]);
        // The root's grand total is the same instance with the same data
        expect(api.getRowNode(GRAND_TOTAL_ID)?.id).toBe(grandTotalNodeId);
        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(60);
    });

    test('grand total updates when value changes via transaction (inline)', async () => {
        const api = gridManager.createGrid(null, createFlatGridOptions({ grandTotalRow: 'bottom' }));

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const originalNodeId = api.getRowNode(GRAND_TOTAL_ID)?.id;
        api.applyServerSideTransaction({ update: [{ id: GRAND_TOTAL_ID, value: 999 }] });
        await asyncSetTimeout(10);

        expect(api.getRowNode(GRAND_TOTAL_ID)?.id).toBe(originalNodeId);
        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(999);
        await new GridRows(api, 'after inline transaction update').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:999
        `);
    });

    // --- grandTotalData field tests ---

    test('grand total via grandTotalData field', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({
                            rowData: [...flatRows],
                            rowCount: flatRows.length,
                            grandTotalData: { id: GRAND_TOTAL_ID, value: 60 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'via grandTotalData field');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('grandTotalData works without the grand total ID in the data', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({
                            rowData: [...flatRows],
                            rowCount: flatRows.length,
                            // Data has a custom ID, not 'rowGroupFooter_ROOT_NODE_ID' — grid assigns the correct ID
                            grandTotalData: { id: 'my-custom-total', value: 60 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Node should have 'rowGroupFooter_ROOT_NODE_ID' as ID, not the custom one
        const grandTotal = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotal).toBeDefined();
        expect(grandTotal!.data.value).toBe(60);

        const gridRows = new GridRows(api, 'custom id in data');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"my-custom-total" value:60
        `);
    });

    test('grandTotalData field takes priority over rowData array', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({
                            // Grand total in rowData with value 100
                            rowData: [...flatRows, { id: GRAND_TOTAL_ID, value: 100 }],
                            rowCount: flatRows.length,
                            // grandTotalData with value 999 — should take priority
                            grandTotalData: { id: GRAND_TOTAL_ID, value: 999 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const grandTotal = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotal).toBeDefined();
        expect(grandTotal!.data.value).toBe(999);
    });

    test('grandTotalData: undefined does not override in-array grand total', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({
                            // Grand total in rowData
                            rowData: [...flatRows, { id: GRAND_TOTAL_ID, value: 42 }],
                            rowCount: flatRows.length,
                            // grandTotalData not set (undefined) — should NOT override the array row
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'undefined does not override array');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:42
        `);
    });

    test('grandTotalData: null removes existing grand total', async () => {
        let callCount = 0;
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    callCount++;
                    setTimeout(() => {
                        if (callCount === 1) {
                            // First load: include grand total
                            params.success({
                                rowData: [...flatRows],
                                rowCount: flatRows.length,
                                grandTotalData: { id: GRAND_TOTAL_ID, value: 60 },
                            });
                        } else {
                            // Second load: remove grand total
                            params.success({
                                rowData: [...flatRows],
                                rowCount: flatRows.length,
                                grandTotalData: null,
                            });
                        }
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Grand total should exist after first load
        expect(api.getRowNode(GRAND_TOTAL_ID)).toBeDefined();

        // Refresh to trigger second load with null
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        // Grand total should be removed
        const gridRows2 = new GridRows(api, 'after null removal');
        await gridRows2.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
    });

    // --- Dynamic option toggle ---

    test('dynamically enabling grandTotalRow uses cached data', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            // Start with no grandTotalRow — but server still sends the data
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({
                            rowData: [...flatRows],
                            rowCount: flatRows.length,
                            grandTotalData: { id: GRAND_TOTAL_ID, value: 60 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // No grand total visible (option not set)
        const gridRows1 = new GridRows(api, 'before enabling');
        await gridRows1.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);

        // Enable grandTotalRow — should use cached data without new server request
        api.setGridOption('grandTotalRow', 'bottom');

        const gridRows2 = new GridRows(api, 'after enabling');
        await gridRows2.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);

        // Disable grandTotalRow — grand total should disappear
        api.setGridOption('grandTotalRow', undefined);

        const gridRows3 = new GridRows(api, 'after disabling');
        await gridRows3.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
    });

    test('cycle through all grandTotalRow positions', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: createFlatDatasource(),
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // bottom
        await new GridRows(api, 'bottom').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);

        // bottom → top
        api.setGridOption('grandTotalRow', 'top');
        await new GridRows(api, 'top').check(unindentText`
            ROOT id:<no-id>
            ├─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);

        // top → disabled
        api.setGridOption('grandTotalRow', undefined);
        await new GridRows(api, 'disabled').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);

        // disabled → bottom (re-enable from cached data)
        api.setGridOption('grandTotalRow', 'bottom');
        await new GridRows(api, 're-enabled bottom').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);

        // bottom → disabled again
        api.setGridOption('grandTotalRow', undefined);
        await new GridRows(api, 'disabled again').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
        `);
    });

    // --- Without getRowId ---

    test('grand total via grandTotalData field without getRowId', async () => {
        const api = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            // No getRowId provided
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({
                            rowData: flatRows.map((r) => ({ ...r })),
                            rowCount: flatRows.length,
                            grandTotalData: { id: GRAND_TOTAL_ID, value: 60 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'no getRowId with grandTotalData');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:0 id:"1" value:10
            ├── LEAF id:1 id:"2" value:20
            ├── LEAF id:2 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('async grand total via transaction: add after initial success', async () => {
        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    setTimeout(() => {
                        params.success({ rowData: flatRows, rowCount: flatRows.length });
                        if (params.needsGrandTotal) {
                            api.applyServerSideTransaction({ remove: [{ id: GRAND_TOTAL_ID } as any] });
                            setTimeout(() => {
                                api.applyServerSideTransaction({
                                    add: [{ id: GRAND_TOTAL_ID, value: 60 } as any],
                                });
                            }, 5);
                        }
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        const gridRows = new GridRows(api, 'after async grand total applied');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('async grand total via transaction: transaction remove sets needsGrandTotal=false for subsequent blocks', async () => {
        // Locks in the semantic contract: transaction `remove` of GRAND_TOTAL_ROW_ID sets
        // store.grandTotalData = null (explicit "no grand total"), so paged block requests in
        // the same store report needsGrandTotal=false. Only a store reset (filter/agg change)
        // flips it back to true.
        const manyRows: RowData[] = Array.from({ length: 200 }, (_, i) => ({ id: String(i), value: i }));
        const expectedTotal = manyRows.reduce((s, r) => s + r.value, 0);
        const getRowsCalls: { startRow?: number; needsGrandTotal: boolean }[] = [];

        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            cacheBlockSize: 20,
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const { startRow = 0, endRow = manyRows.length } = params.request;
                    getRowsCalls.push({ startRow, needsGrandTotal: params.needsGrandTotal });
                    const page = manyRows.slice(startRow, endRow);
                    setTimeout(() => {
                        params.success({ rowData: page, rowCount: manyRows.length });
                        if (params.needsGrandTotal) {
                            api.applyServerSideTransaction({ remove: [{ id: GRAND_TOTAL_ID } as any] });
                            setTimeout(() => {
                                api.applyServerSideTransaction({
                                    add: [{ id: GRAND_TOTAL_ID, value: expectedTotal } as any],
                                });
                            }, 5);
                        }
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        expect(getRowsCalls[0].needsGrandTotal).toBe(true);
        for (let i = 1; i < getRowsCalls.length; i++) {
            expect(getRowsCalls[i].needsGrandTotal).toBe(false);
        }
        expect(api.getRowNode(GRAND_TOTAL_ID)?.data?.value).toBe(expectedTotal);
    });

    test('pinnedBottom grand total is replaced (not duplicated) after filter change', async () => {
        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', filter: 'agNumberColumnFilter' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'pinnedBottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const filter = params.request.filterModel as { value?: { filter?: number } } | null;
                    const threshold = filter?.value?.filter;
                    const filtered = threshold != null ? flatRows.filter((r) => r.value > threshold) : flatRows;
                    const rowData: any[] = [...filtered];
                    if (params.needsGrandTotal) {
                        const total = filtered.reduce((s, r) => s + r.value, 0);
                        rowData.push({ id: GRAND_TOTAL_ID, value: total });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: filtered.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(60);

        await new GridRows(api, 'pinnedBottom initial').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);

        api.setFilterModel({ value: { type: 'greaterThan', filter: 15 } });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(50);

        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(50);

        await new GridRows(api, 'pinnedBottom after filter').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" value:20
            └── LEAF id:3 id:"3" value:30
            PINNED_BOTTOM id:b-bottom-rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:50
        `);
    });

    test('pinnedTop grand total is replaced (not duplicated) after filter change', async () => {
        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', filter: 'agNumberColumnFilter' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'pinnedTop',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const filter = params.request.filterModel as { value?: { filter?: number } } | null;
                    const threshold = filter?.value?.filter;
                    const filtered = threshold != null ? flatRows.filter((r) => r.value > threshold) : flatRows;
                    const rowData: any[] = [...filtered];
                    if (params.needsGrandTotal) {
                        const total = filtered.reduce((s, r) => s + r.value, 0);
                        rowData.push({ id: GRAND_TOTAL_ID, value: total });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: filtered.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedTopRow(0)?.data?.value).toBe(60);

        api.setFilterModel({ value: { type: 'greaterThan', filter: 15 } });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        expect(api.getPinnedTopRowCount()).toBe(1);
        expect(api.getPinnedBottomRowCount()).toBe(0);
        expect(api.getPinnedTopRow(0)?.data?.value).toBe(50);
    });

    test('pinnedBottom grand total survives repeated filter changes', async () => {
        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', filter: 'agNumberColumnFilter' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'pinnedBottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const filter = params.request.filterModel as { value?: { filter?: number } } | null;
                    const threshold = filter?.value?.filter;
                    const filtered = threshold != null ? flatRows.filter((r) => r.value > threshold) : flatRows;
                    const rowData: any[] = [...filtered];
                    if (params.needsGrandTotal) {
                        const total = filtered.reduce((s, r) => s + r.value, 0);
                        rowData.push({ id: GRAND_TOTAL_ID, value: total });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: filtered.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const thresholds = [15, 25, undefined, 9, 15];
        const expectedValues = [50, 30, 60, 60, 50];
        for (let i = 0; i < thresholds.length; i++) {
            const t = thresholds[i];
            api.setFilterModel(t === undefined ? null : { value: { type: 'greaterThan', filter: t } });
            await waitForNoLoadingRows(api);
            await asyncSetTimeout(10);

            expect(api.getPinnedBottomRowCount()).toBe(1);
            expect(api.getPinnedBottomRow(0)?.data?.value).toBe(expectedValues[i]);
        }
    });

    test('pinnedBottom grand total is replaced after aggregation change', async () => {
        // Aggregation change resets the store entirely — exercises the pinned cleanup path.
        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', aggFunc: 'sum' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'pinnedBottom',
            serverSideDatasource: createFlatDatasource(),
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        api.setColumnAggFunc('value', 'avg');
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        expect(api.getPinnedBottomRowCount()).toBe(1);
    });

    test('pinnedBottom grand total is replaced after refreshServerSide({ purge: true })', async () => {
        let total = 60;
        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'pinnedBottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const rowData: any[] = [...flatRows];
                    if (params.needsGrandTotal) {
                        rowData.push({ id: GRAND_TOTAL_ID, value: total });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: flatRows.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(60);

        total = 123;
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(123);
    });

    test('pinnedBottom grand total with grouped grid survives filter change', async () => {
        interface GroupedRow {
            id: string;
            category: string;
            value: number;
        }

        const serverRows: GroupedRow[] = [
            { id: 'a1', category: 'A', value: 10 },
            { id: 'a2', category: 'A', value: 20 },
            { id: 'b1', category: 'B', value: 30 },
        ];

        const api = gridManager.createGrid(null, {
            columnDefs: [
                { field: 'category', rowGroup: true, hide: true },
                { field: 'value', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            autoGroupColumnDef: { headerName: 'Category' },
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<GroupedRow>) => params.data.id,
            grandTotalRow: 'pinnedBottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const { request } = params;
                    const filter = request.filterModel as { value?: { filter?: number } } | null;
                    const threshold = filter?.value?.filter;
                    const filtered = threshold != null ? serverRows.filter((r) => r.value > threshold) : serverRows;
                    let rowData: any[];

                    if (request.groupKeys.length === 0) {
                        const groups = new Map<string, number>();
                        for (const row of filtered) {
                            groups.set(row.category, (groups.get(row.category) ?? 0) + row.value);
                        }
                        rowData = [...groups.entries()].map(([category, value]) => ({
                            id: `category:${category}`,
                            category,
                            value,
                            group: true,
                            leafGroup: true,
                            key: category,
                        }));
                        if (params.needsGrandTotal) {
                            const total = filtered.reduce((s, r) => s + r.value, 0);
                            rowData.push({ id: GRAND_TOTAL_ID, value: total });
                        }
                    } else {
                        const groupKey = request.groupKeys[0];
                        rowData = filtered.filter((r) => r.category === groupKey).map((r) => ({ ...r }));
                    }

                    const dataRowCount =
                        request.groupKeys.length === 0
                            ? rowData.filter((r: any) => r.id !== GRAND_TOTAL_ID).length
                            : rowData.length;
                    setTimeout(() => params.success({ rowData, rowCount: dataRowCount }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(60);

        // Filter out category A entirely
        api.setFilterModel({ value: { type: 'greaterThan', filter: 25 } });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        expect(api.getPinnedBottomRowCount()).toBe(1);
        expect(api.getPinnedBottomRow(0)?.data?.value).toBe(30);
    });

    test('switching from pinnedBottom to bottom after filter change leaves no orphan pinned row', async () => {
        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', filter: 'agNumberColumnFilter' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'pinnedBottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const filter = params.request.filterModel as { value?: { filter?: number } } | null;
                    const threshold = filter?.value?.filter;
                    const filtered = threshold != null ? flatRows.filter((r) => r.value > threshold) : flatRows;
                    const rowData: any[] = [...filtered];
                    if (params.needsGrandTotal) {
                        const total = filtered.reduce((s, r) => s + r.value, 0);
                        rowData.push({ id: GRAND_TOTAL_ID, value: total });
                    }
                    setTimeout(() => params.success({ rowData, rowCount: filtered.length }), 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        api.setFilterModel({ value: { type: 'greaterThan', filter: 15 } });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);
        expect(api.getPinnedBottomRowCount()).toBe(1);

        api.setGridOption('grandTotalRow', 'bottom');
        await asyncSetTimeout(20);

        expect(api.getPinnedBottomRowCount()).toBe(0);
        expect(api.getPinnedTopRowCount()).toBe(0);

        await new GridRows(api, 'after switch to inline bottom').check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:50
        `);
    });

    test('async grand total via transaction: filter change hides then restores grand total', async () => {
        const computeTotal = (threshold?: number) =>
            flatRows.filter((r) => threshold === undefined || r.value > threshold).reduce((s, r) => s + r.value, 0);

        const api: GridApi<RowData> = gridManager.createGrid(null, {
            columnDefs: [{ field: 'id' }, { field: 'value', filter: 'agNumberColumnFilter' }],
            rowModelType: 'serverSide',
            getRowId: (params: GetRowIdParams<RowData>) => params.data.id,
            grandTotalRow: 'bottom',
            serverSideDatasource: {
                getRows(params: IServerSideGetRowsParams) {
                    const filter = params.request.filterModel as { value?: { filter?: number } } | null;
                    const threshold = filter?.value?.filter;
                    const filtered = threshold != null ? flatRows.filter((r) => r.value > threshold) : flatRows;
                    setTimeout(() => {
                        params.success({ rowData: filtered, rowCount: filtered.length });
                        if (params.needsGrandTotal) {
                            api.applyServerSideTransaction({ remove: [{ id: GRAND_TOTAL_ID } as any] });
                            setTimeout(() => {
                                api.applyServerSideTransaction({
                                    add: [{ id: GRAND_TOTAL_ID, value: computeTotal(threshold) } as any],
                                });
                            }, 5);
                        }
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        const gridRows1 = new GridRows(api, 'initial');
        await gridRows1.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);

        api.setFilterModel({ value: { type: 'greaterThan', filter: 15 } });
        await waitForNoLoadingRows(api);
        await asyncSetTimeout(20);

        const gridRows2 = new GridRows(api, 'after filter');
        await gridRows2.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:50
        `);
    });
});
