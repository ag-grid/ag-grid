import type { GridState, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../test-utils';

describe('StateService - Grid State Management', () => {
    const gridsManager = new TestGridsManager({
        modules: [AllEnterpriseModule],
    });

    const defaultRowData = [
        { id: '1', name: 'Alice', age: 30, sport: 'Football' },
        { id: '2', name: 'Bob', age: 25, sport: 'Tennis' },
        { id: '3', name: 'Charlie', age: 35, sport: 'Golf' },
        { id: '4', name: 'David', age: 28, sport: 'Basketball' },
        { id: '5', name: 'Eve', age: 32, sport: 'Swimming' },
    ];

    const defaultColumnDefs = [{ field: 'id' }, { field: 'name' }, { field: 'age' }, { field: 'sport' }];

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    // ===== COLUMN STATE TESTS =====
    describe('Column State', () => {
        test('should capture column order state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            expect(api.getState().columnOrder).toEqual({ orderedColIds: ['id', 'name', 'age', 'sport'] });

            // Apply column order
            api.applyColumnState({
                state: [{ colId: 'sport' }, { colId: 'id' }, { colId: 'name' }, { colId: 'age' }],
                applyOrder: true,
            });

            expect(api.getState().columnOrder).toEqual({ orderedColIds: ['sport', 'id', 'name', 'age'] });
        });

        test('should capture column visibility state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            expect(api.getState().columnVisibility).toBeUndefined();

            // Hide a column
            api.setColumnsVisible(['age'], false);

            expect(api.getState().columnVisibility).toEqual({ hiddenColIds: ['age'] });
        });

        test('should capture column sizing state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            // Set column width
            api.setColumnWidths([{ key: 'name', newWidth: 222 }]);

            expect(api.getState().columnSizing).toEqual({
                columnSizingModel: [
                    {
                        colId: 'id',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'name',
                        flex: undefined,
                        width: 222,
                    },
                    {
                        colId: 'age',
                        flex: undefined,
                        width: 200,
                    },
                    {
                        colId: 'sport',
                        flex: undefined,
                        width: 200,
                    },
                ],
            });
        });

        test('should capture column pinning state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            // Pin column
            api.applyColumnState({
                state: [
                    { colId: 'id', pinned: 'left' },
                    { colId: 'age', pinned: 'right' },
                ],
            });

            expect(api.getState().columnPinning).toEqual({ leftColIds: ['id'], rightColIds: ['age'] });
        });

        test('should capture sort state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            // Apply sort
            api.applyColumnState({
                state: [
                    { colId: 'name', sort: 'asc' },
                    { colId: 'age', sort: 'desc', sortType: 'absolute' },
                ],
            });

            expect(api.getState().sort?.sortModel).toEqual([
                {
                    colId: 'name',
                    sort: 'asc',
                    type: 'default',
                },
                {
                    colId: 'age',
                    sort: 'desc',
                    type: 'absolute',
                },
            ]);
        });

        test('should capture row group state', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
                { field: 'name', hide: false },
                { field: 'age', hide: false },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });

            expect(api.getState().rowGroup).toEqual({
                groupColIds: ['sport'],
            });
        });

        test('should capture aggregation state', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
                { field: 'age', hide: false, aggFunc: 'sum' },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });

            expect(api.getState().aggregation).toEqual({
                aggregationModel: [
                    {
                        aggFunc: 'sum',
                        colId: 'age',
                    },
                ],
            });
        });

        test('should capture pivot state', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false },
                { field: 'name', hide: false },
                { field: 'age', hide: false, aggFunc: 'sum' },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });

            // Apply pivot state via setState
            api.setState({
                pivot: {
                    pivotMode: true,
                    pivotColIds: ['sport'],
                },
            });

            expect(api.getState().pivot).toEqual({
                pivotColIds: ['sport'],
                pivotMode: true,
            });
        });

        test('should capture column group state', async () => {
            const columnDefs = [
                {
                    headerName: 'Name & Country',
                    children: [{ field: 'athlete' }, { field: 'country' }],
                },
                {
                    headerName: 'Sports Results',
                    groupId: 'sportsGroup',
                    children: [
                        { columnGroupShow: 'closed', field: 'total' },
                        { columnGroupShow: 'open', field: 'gold' },
                        { columnGroupShow: 'open', field: 'silver' },
                        { columnGroupShow: 'open', field: 'bronze' },
                    ],
                },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: defaultRowData,
            });

            expect(api.getState().columnGroup).toEqual(undefined);

            // Open a group
            api.setColumnGroupOpened('sportsGroup', true);

            expect(api.getState().columnGroup).toEqual({
                openColumnGroupIds: ['sportsGroup'],
            });

            // Collapse a group
            api.setColumnGroupOpened('sportsGroup', false);
            expect(api.getState().columnGroup).toEqual(undefined);
        });
    });

    // ===== ROW STATE TESTS =====
    describe('Row State', () => {
        test('should capture row selection state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
            });

            // Apply row selection via setState
            api.setState({
                rowSelection: ['0', '2'],
            });

            expect(api.getState().rowSelection).toEqual(['0', '2']);
        });

        test('CSRM: getState captures rowGroupExpansion, setState restores it', async () => {
            const columnDefs = [
                { field: 'id', hide: false },
                { field: 'sport', hide: false, rowGroup: true },
                { field: 'name', hide: false },
                { field: 'age', hide: false },
            ];
            const api = gridsManager.createGrid('source', {
                columnDefs,
                rowData: defaultRowData,
                getRowId: ({ data }) => data.id,
            });

            // Initially all groups collapsed
            expect(api.getState().rowGroupExpansion).toEqual({
                collapsedRowGroupIds: [],
                expandedRowGroupIds: [],
            });
            expect(api.getState().ssrmRowGroupExpansion).toBeUndefined();

            api.expandAll();

            const savedState = api.getState();
            expect(savedState.rowGroupExpansion).toEqual({
                collapsedRowGroupIds: [],
                expandedRowGroupIds: [
                    'row-group-sport-Football',
                    'row-group-sport-Tennis',
                    'row-group-sport-Golf',
                    'row-group-sport-Basketball',
                    'row-group-sport-Swimming',
                ],
            });
            expect(savedState.ssrmRowGroupExpansion).toBeUndefined();

            // Restore into a fresh grid
            const api2 = gridsManager.createGrid('target', {
                columnDefs,
                rowData: defaultRowData,
                getRowId: ({ data }) => data.id,
                initialState: savedState,
            });

            expect(api2.getState().rowGroupExpansion).toEqual(savedState.rowGroupExpansion);
        });

        test('SSRM: getState captures rowGroupExpansion, setState restores it', async () => {
            const datasource: IServerSideDatasource = {
                getRows({ request, success }: IServerSideGetRowsParams) {
                    if (request.groupKeys.length === 0) {
                        success({
                            rowData: [
                                { id: 'ie', country: 'Ireland' },
                                { id: 'fr', country: 'France' },
                            ],
                        });
                    } else {
                        success({
                            rowData: [{ id: `${request.groupKeys[0]}-leaf`, country: request.groupKeys[0], medals: 5 }],
                        });
                    }
                },
            };

            const api = gridsManager.createGrid('ssrmSource', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }],
                rowModelType: 'serverSide',
                serverSideDatasource: datasource,
                getRowId: ({ data }) => data.id,
            });

            await waitForNoLoadingRows(api);

            // Without ssrmExpandAllAffectsAllRows, SSRM uses rowGroupExpansion (same as CSRM)
            expect(api.getState().rowGroupExpansion).toEqual({ expandedRowGroupIds: [], collapsedRowGroupIds: [] });
            expect(api.getState().ssrmRowGroupExpansion).toBeUndefined();

            // Expand Ireland
            api.setRowNodeExpanded(api.getRowNode('ie')!, true);
            await waitForNoLoadingRows(api);

            const savedState = api.getState();
            expect(savedState.rowGroupExpansion).toEqual({
                expandedRowGroupIds: ['ie'],
                collapsedRowGroupIds: [],
            });
            expect(savedState.ssrmRowGroupExpansion).toBeUndefined();

            // Collapse Ireland
            api.setRowNodeExpanded(api.getRowNode('ie')!, false);
            expect(api.getRowNode('ie')!.expanded).toBe(false);

            // Restore the saved state
            api.setState(savedState);
            await waitForNoLoadingRows(api);

            expect(api.getRowNode('ie')!.expanded).toBe(true);
            expect(api.getState().rowGroupExpansion).toEqual(savedState.rowGroupExpansion);
        });

        test('SSRM expandAll strategy: getState captures RowGroupBulkExpansionState, setState restores it', async () => {
            const datasource: IServerSideDatasource = {
                getRows({ request, success }: IServerSideGetRowsParams) {
                    if (request.groupKeys.length === 0) {
                        success({
                            rowData: [
                                { id: 'ie', key: 'Ireland', country: 'Ireland', group: true },
                                { id: 'fr', key: 'France', country: 'France', group: true },
                            ],
                        });
                    } else {
                        success({
                            rowData: [{ id: `${request.groupKeys[0]}-leaf`, country: request.groupKeys[0], medals: 1 }],
                        });
                    }
                },
            };

            const gridOpts = {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }],
                rowModelType: 'serverSide' as const,
                serverSideDatasource: datasource,
                getRowId: ({ data }: any) => data.id,
                ssrmExpandAllAffectsAllRows: true,
            };

            const api = gridsManager.createGrid('ssrmBulkSource', gridOpts);
            await waitForNoLoadingRows(api);

            // Expand all — switches to ExpandAllStrategy
            api.expandAll();
            await waitForNoLoadingRows(api);

            // Collapse France individually — recorded as an exception in ExpandAllStrategy
            api.setRowNodeExpanded(api.getRowNode('fr')!, false);
            await asyncSetTimeout(0); // allow debounced state update to flush

            const savedState = api.getState();
            expect(savedState.ssrmRowGroupExpansion).toEqual({
                expandAll: true,
                invertedRowGroupIds: ['fr'],
            });
            expect(savedState.rowGroupExpansion).toBeUndefined();

            // Collapse all to reset state
            api.collapseAll();
            expect(api.getRowNode('ie')!.expanded).toBe(false);
            expect(api.getRowNode('fr')!.expanded).toBe(false);

            // Restore saved state — previously broken (ssrmRowGroupExpansion was ignored)
            api.setState(savedState);
            await waitForNoLoadingRows(api);

            // Ireland should be expanded (expandAll: true), France collapsed (in invertedRowGroupIds)
            expect(api.getRowNode('ie')!.expanded).toBe(true);
            expect(api.getRowNode('fr')!.expanded).toBe(false);
        });

        test('SSRM expandAll strategy: initialState with ssrmRowGroupExpansion restores on grid creation', async () => {
            // Tests the gridInitializing path: ssrmRowGroupExpansion must be checked (not just
            // rowGroupExpansion) when deciding whether to call setRowGroupExpansionState.
            const datasource: IServerSideDatasource = {
                getRows({ request, success }: IServerSideGetRowsParams) {
                    if (request.groupKeys.length === 0) {
                        success({
                            rowData: [
                                { id: 'ie', country: 'Ireland' },
                                { id: 'fr', country: 'France' },
                            ],
                        });
                    } else {
                        success({
                            rowData: [{ id: `${request.groupKeys[0]}-leaf`, country: request.groupKeys[0], medals: 1 }],
                        });
                    }
                },
            };

            const gridOpts = {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'medals' }],
                rowModelType: 'serverSide' as const,
                serverSideDatasource: datasource,
                getRowId: ({ data }: any) => data.id,
                ssrmExpandAllAffectsAllRows: true,
                initialState: {
                    ssrmRowGroupExpansion: { expandAll: true, invertedRowGroupIds: ['fr'] },
                },
            };

            const api = gridsManager.createGrid('ssrmBulkInit', gridOpts);
            await waitForNoLoadingRows(api);

            // Ireland should be expanded (expandAll: true), France collapsed (in invertedRowGroupIds)
            expect(api.getRowNode('ie')!.expanded).toBe(true);
            expect(api.getRowNode('fr')!.expanded).toBe(false);
        });

        test('CSRM: getState reflects new node IDs after group column change via setGridOption', async () => {
            // columnRowGroupChanged fires while changeEventsDispatching=true (before CSRM re-groups),
            // so expansion state must be refreshed on newColumnsLoaded instead.
            const api = gridsManager.createGrid('csrmRegroup', {
                columnDefs: [
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'name', rowGroup: false, hide: true },
                    { field: 'age' },
                ],
                rowData: defaultRowData,
                getRowId: ({ data }) => data.id,
            });

            // expandAll uses the synchronous onGroupExpandedOrCollapsed path
            api.expandAll();
            await asyncSetTimeout(0);
            expect(api.getState().rowGroupExpansion?.expandedRowGroupIds).toContain('row-group-sport-Football');

            // Switch grouping to name — all sport-based IDs are gone
            api.setGridOption('columnDefs', [
                { field: 'sport', rowGroup: false, hide: true },
                { field: 'name', rowGroup: true, hide: true },
                { field: 'age' },
            ]);
            await asyncSetTimeout(0);

            // Cached state must reflect the new name-based IDs, not stale sport-based IDs
            const expansion = api.getState().rowGroupExpansion;
            expect(expansion?.expandedRowGroupIds).not.toContain('row-group-sport-Football');
        });

        test('should capture pagination state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });

            // Go to page 2
            api.paginationGoToPage(1);
            expect(api.getState().pagination).toEqual({
                page: 1,
                pageSize: 2,
            });
            api.paginationGoToLastPage();
            expect(api.getState().pagination).toEqual({
                page: 2,
                pageSize: 2,
            });
            api.paginationGoToFirstPage();
            expect(api.getState().pagination).toEqual({
                page: 0,
                pageSize: 2,
            });
            api.paginationGoToNextPage();
            expect(api.getState().pagination).toEqual({
                page: 1,
                pageSize: 2,
            });
            api.paginationGoToPreviousPage();
            expect(api.getState().pagination).toEqual({
                page: 0,
                pageSize: 2,
            });
        });

        test('should capture row pinning state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                enableRowPinning: true,
            });

            // Apply row pinning state
            api.setState({
                rowPinning: {
                    top: ['0'],
                    bottom: ['1'],
                },
            });

            expect(api.getState().rowPinning).toEqual({ bottom: ['1'], top: ['0'] });
        });

        test('should capture filter state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                defaultColDef: { filter: 'agTextColumnFilter' },
            });

            expect(api.getState().filter).toEqual({
                advancedFilterModel: undefined,
                columnFilterState: undefined,
                filterModel: undefined,
                selectableFilters: {},
            });

            // Apply filter - using the filter manager API
            api.setFilterModel({
                name: { filterType: 'text', type: 'startsWith', filter: 'A' },
            });

            await asyncSetTimeout(50);

            expect(api.getState().filter).toEqual({
                advancedFilterModel: undefined,
                columnFilterState: undefined,
                filterModel: {
                    name: {
                        filter: 'A',
                        filterType: 'text',
                        type: 'startsWith',
                    },
                },
                selectableFilters: {},
            });
        });

        test('should serialise bigint filter state and rehydrate on setState', async () => {
            const columnDefs = [{ field: 'id', cellDataType: 'bigint', filter: 'agBigIntColumnFilter' }];
            const rowData = [{ id: 1n }, { id: 2n }, { id: 3n }];

            const api = gridsManager.createGrid('bigIntStateSource', {
                columnDefs,
                rowData,
            });

            api.setFilterModel({
                id: { filterType: 'bigint', type: 'equals', filter: '2n' },
            });

            await asyncSetTimeout(20);

            const savedState = api.getState();
            expect(savedState.filter?.filterModel?.id?.filter).toBe('2n');

            const api2 = gridsManager.createGrid('bigIntStateTarget', {
                columnDefs,
                rowData,
            });

            api2.setState(savedState as GridState);

            await asyncSetTimeout(20);

            const restoredFilterModel = api2.getFilterModel();
            expect(restoredFilterModel?.id?.filter).toBe('2n');
        });
    });

    // ===== CELL STATE TESTS =====
    describe('Cell State', () => {
        test('should capture focused cell state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            await asyncSetTimeout(20);

            // Focus a cell
            api.setFocusedCell(0, 'name');

            await asyncSetTimeout(50);

            expect(api.getState().focusedCell).toEqual({
                colId: 'name',
                rowIndex: 0,
                rowPinned: null,
            });
        });

        test('should capture cell selection state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                cellSelection: true,
            });

            api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: ['name'] });

            await asyncSetTimeout(50);

            expect(api.getState().cellSelection).toEqual({
                cellRanges: [
                    {
                        colIds: ['name'],
                        endRow: {
                            rowIndex: 1,
                            rowPinned: undefined,
                        },
                        id: undefined,
                        startColId: 'name',
                        startRow: {
                            rowIndex: 0,
                            rowPinned: undefined,
                        },
                        type: undefined,
                    },
                ],
            });

            api.clearCellSelection();

            expect(api.getState().cellSelection).toEqual(undefined);
        });

        test('should capture scroll state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: [
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                    ...defaultRowData,
                ],
            });

            expect(api.getState().scroll).toEqual(undefined);

            api.ensureIndexVisible(20);

            await asyncSetTimeout(50);

            expect(api.getState().scroll).toEqual({
                left: 0,
                top: 840,
            });
        });
    });

    // ===== UI STATE TESTS =====
    describe('UI State', () => {
        test('should capture sidebar state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                sideBar: {
                    toolPanels: [
                        {
                            id: 'columns',
                            labelDefault: 'Columns',
                            labelKey: 'columns',
                            iconKey: 'columns',
                            toolPanel: 'agColumnsToolPanel',
                        },
                    ],
                    defaultToolPanel: 'columns',
                },
            });

            expect(api.getState().sideBar).toEqual({
                openToolPanel: 'columns',
                position: 'right',
                toolPanels: {
                    columns: {
                        expandedGroupIds: [],
                    },
                },
                visible: true,
            });

            api.closeToolPanel();

            expect(api.getState().sideBar).toEqual({
                openToolPanel: null,
                position: 'right',
                toolPanels: {
                    columns: {
                        expandedGroupIds: [],
                    },
                },
                visible: true,
            });
        });
    });

    // ===== COMBINED STATE TESTS =====
    describe('Combined State Operations', () => {
        test('should set state and apply all features', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });

            const stateToApply: GridState = {
                sort: {
                    sortModel: [{ colId: 'name', sort: 'asc' }],
                },
                columnVisibility: {
                    hiddenColIds: ['age'],
                },
                columnOrder: {
                    orderedColIds: ['name', 'id', 'sport', 'age'],
                },
                pagination: {
                    page: 1,
                    pageSize: 2,
                },
                rowSelection: ['1', '3'],
            };

            api.setState(stateToApply);
            await asyncSetTimeout(50);

            const state = api.getState();
            expect(state.sort?.sortModel).toHaveLength(1);
            expect(state.columnVisibility?.hiddenColIds).toContain('age');
            expect(state.pagination?.page).toBe(1);
        });

        test('should setState with propertiesToIgnore parameter', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
            });

            // First select some rows
            api.selectAll('filtered');

            const stateToApply: GridState = {
                sort: {
                    sortModel: [{ colId: 'name', sort: 'asc' }],
                },
                rowSelection: ['3', '4'],
            };

            // Apply state but ignore rowSelection
            api.setState(stateToApply, ['rowSelection']);
            await asyncSetTimeout(50);

            const state = api.getState();
            expect(state.sort?.sortModel).toHaveLength(1);
            // Row selection should not have changed
            if (Array.isArray(state.rowSelection)) {
                expect(state.rowSelection).toContain('1');
                expect(state.rowSelection).toContain('2');
            }
        });
    });

    // ===== STATE PERSISTENCE TESTS =====
    describe('State Persistence', () => {
        test('should restore full state from saved state ', async () => {
            // First grid - set some state
            const api1 = gridsManager.createGrid('grid1', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });

            api1.selectAll('filtered');
            api1.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
            api1.setColumnsVisible(['age'], false);
            api1.applyColumnState({
                state: [{ colId: 'id', pinned: 'left' }],
            });

            const savedState = api1.getState();

            // Second grid - restore state
            gridsManager.reset();
            const api2 = gridsManager.createGrid('grid2', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                rowSelection: { mode: 'multiRow' },
                pagination: true,
                paginationPageSize: 2,
                paginationPageSizeSelector: [2],
            });

            api2.setState(savedState);
            await asyncSetTimeout(50);

            const restoredState = api2.getState();
            expect(restoredState).toEqual(savedState);
        });

        test('should preserve absolute sort type when restoring state via setState', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            api.applyColumnState({
                state: [{ colId: 'age', sort: 'asc', sortType: 'absolute' }],
            });

            const savedState = api.getState();
            expect(savedState.sort?.sortModel).toEqual([{ colId: 'age', sort: 'asc', type: 'absolute' }]);

            // Clear sort and restore from saved state
            api.applyColumnState({ state: [{ colId: 'age', sort: null }] });
            expect(api.getState().sort?.sortModel ?? []).toHaveLength(0);

            api.setState(savedState);
            await asyncSetTimeout(50);

            expect(api.getState().sort?.sortModel).toEqual([{ colId: 'age', sort: 'asc', type: 'absolute' }]);
        });

        test('should clear absolute sort from a column not present in the restored sort state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            // Set absolute sort on 'age', default sort on 'name'
            api.applyColumnState({
                state: [
                    { colId: 'age', sort: 'asc', sortType: 'absolute', sortIndex: 0 },
                    { colId: 'name', sort: 'desc', sortIndex: 1 },
                ],
            });

            expect(api.getState().sort?.sortModel).toEqual([
                { colId: 'age', sort: 'asc', type: 'absolute' },
                { colId: 'name', sort: 'desc', type: 'default' },
            ]);

            // Restore a state that only sorts 'name' — 'age' absolute sort should be cleared
            api.setState({ sort: { sortModel: [{ colId: 'name', sort: 'asc', type: 'default' }] } });
            await asyncSetTimeout(50);

            expect(api.getState().sort?.sortModel).toEqual([{ colId: 'name', sort: 'asc', type: 'default' }]);
        });

        test('should initialize grid with initial state', async () => {
            const initialState: GridState = {
                sort: {
                    sortModel: [{ colId: 'name', sort: 'desc' }],
                },
                columnVisibility: {
                    hiddenColIds: ['sport'],
                },
                pagination: {
                    page: 0,
                    pageSize: 3,
                },
            };

            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
                initialState,
                pagination: true,
                paginationPageSize: 3,
                paginationPageSizeSelector: [3],
            });

            const state = api.getState();
            expect(state.sort).toEqual({
                sortModel: [
                    {
                        colId: 'name',
                        sort: 'desc',
                        type: 'default',
                    },
                ],
            });
            expect(state.columnVisibility).toEqual({
                hiddenColIds: ['sport'],
            });

            expect(state.pagination).toEqual({
                page: 0,
                pageSize: 3,
            });
        });
    });

    // ===== STATE UPDATES TESTS =====
    describe('State Updates and Events', () => {
        test('should emit stateUpdated event when state changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defaultColumnDefs,
                rowData: defaultRowData,
            });

            await asyncSetTimeout(20);

            let eventFired = false;
            let eventState: any;

            api.addEventListener('stateUpdated', (event) => {
                eventFired = true;
                eventState = event.state;
            });

            api.applyColumnState({ state: [{ colId: 'name', sort: 'asc' }] });
            await asyncSetTimeout(50);

            expect(eventFired).toBe(true);
            expect(eventState?.sort).toBeDefined();
        });
    });
});
