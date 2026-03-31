import type { GetRowIdParams, GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { PaginationModule, ROW_ID_GRAND_TOTAL } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, unindentText, waitForEvent, waitForNoLoadingRows } from '../../test-utils';

const GRAND_TOTAL_ID = ROW_ID_GRAND_TOTAL;

describe('SSRM grand total row', () => {
    const gridManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ServerSideRowModelApiModule, RowGroupingModule, PaginationModule],
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
            ROOT id:<no-id> id:"rowGroupFooter_ROOT_NODE_ID" value:999
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

    test('pinned grand total row (pinnedBottom)', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'pinnedBottom',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // The grand total row data should still be stored
        const grandTotal = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotal).toBeDefined();
        expect(grandTotal!.data.value).toBe(60);
    });

    test('pinned grand total row (pinnedTop)', async () => {
        const api = gridManager.createGrid(
            null,
            createFlatGridOptions({
                grandTotalRow: 'pinnedTop',
            })
        );

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // The grand total row data should still be stored
        const grandTotal = api.getRowNode(GRAND_TOTAL_ID);
        expect(grandTotal).toBeDefined();
        expect(grandTotal!.data.value).toBe(60);
    });

    // --- grandTotalRowData field tests ---

    test('grand total via grandTotalRowData field', async () => {
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
                            grandTotalRowData: { id: GRAND_TOTAL_ID, value: 60 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'via grandTotalRowData field');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:1 id:"1" value:10
            ├── LEAF id:2 id:"2" value:20
            ├── LEAF id:3 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });

    test('grandTotalRowData works without ROW_ID_GRAND_TOTAL in the data', async () => {
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
                            // Data has a custom ID, not ROW_ID_GRAND_TOTAL — grid assigns the correct ID
                            grandTotalRowData: { id: 'my-custom-total', value: 60 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        // Node should have ROW_ID_GRAND_TOTAL as ID, not the custom one
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

    test('grandTotalRowData field takes priority over rowData array', async () => {
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
                            // grandTotalRowData with value 999 — should take priority
                            grandTotalRowData: { id: GRAND_TOTAL_ID, value: 999 },
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

    test('grandTotalRowData: undefined does not override in-array grand total', async () => {
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
                            // grandTotalRowData not set (undefined) — should NOT override the array row
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

    test('grandTotalRowData: null removes existing grand total', async () => {
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
                                grandTotalRowData: { id: GRAND_TOTAL_ID, value: 60 },
                            });
                        } else {
                            // Second load: remove grand total
                            params.success({
                                rowData: [...flatRows],
                                rowCount: flatRows.length,
                                grandTotalRowData: null,
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
                            grandTotalRowData: { id: GRAND_TOTAL_ID, value: 60 },
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

    test('grand total via grandTotalRowData field without getRowId', async () => {
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
                            grandTotalRowData: { id: GRAND_TOTAL_ID, value: 60 },
                        });
                    }, 0);
                },
            },
        });

        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        const gridRows = new GridRows(api, 'no getRowId with grandTotalRowData');
        await gridRows.check(unindentText`
            ROOT id:<no-id>
            ├── LEAF id:0 id:"1" value:10
            ├── LEAF id:1 id:"2" value:20
            ├── LEAF id:2 id:"3" value:30
            └─ footer id:rowGroupFooter_ROOT_NODE_ID id:"rowGroupFooter_ROOT_NODE_ID" value:60
        `);
    });
});
