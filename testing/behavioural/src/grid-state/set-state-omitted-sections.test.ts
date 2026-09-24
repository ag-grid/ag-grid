import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForEvent } from 'ag-test-utils';

import type { GridApi, GridOptions, GridState, GridStateKey } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

interface Row {
    id: string;
    a: string;
    b: string;
    n: number;
}

const rowData: Row[] = Array.from({ length: 10 }, (_, i) => ({
    id: String(i),
    a: `a${i % 3}`,
    b: `b${i}`,
    n: i,
}));

const baseOptions: GridOptions<Row> = {
    columnDefs: [
        { colId: 'a', field: 'a', enableRowGroup: true, enablePivot: true },
        {
            groupId: 'g',
            headerName: 'G',
            children: [
                { colId: 'b', field: 'b', width: 200, filter: 'agTextColumnFilter' },
                { colId: 'n', field: 'n', enableValue: true, columnGroupShow: 'open' },
            ],
        },
    ],
    rowData,
    getRowId: ({ data }) => data.id,
};

const colState = (api: GridApi<Row>, colId: string) => api.getColumnState().find((col) => col.colId === colId);

/** Resolves once `setState` has finished, which the grid signals with a single `stateUpdated` event. */
async function setStateSettled(api: GridApi<Row>, state: GridState, propertiesToIgnore?: GridStateKey[]) {
    const settled = waitForEvent('stateUpdated', api);
    api.setState(state, propertiesToIgnore);
    await settled;
}

interface SectionCase {
    options?: GridOptions<Row>;
    /** A non-default value for the section, applied with `setState` so the grid moves off its defaults. */
    state: GridState;
    /** Reads the section from the live grid, not from `getState`, which echoes the state last set. */
    read: (api: GridApi<Row>) => unknown;
    /** Sections the reset keeps, when `read` depends on them; the reset omits everything else. */
    resetState?: GridState;
    /** Keys that must also be listed in `propertiesToIgnore` for this section's value to hold, beyond itself. */
    ignore?: GridStateKey[];
}

/** Every `GridStateKey` except `ssrmRowGroupExpansion` (out of scope: SSRM-only). */
const CASES: Record<Exclude<GridStateKey, 'ssrmRowGroupExpansion'>, SectionCase> = {
    sort: {
        state: { sort: { sortModel: [{ colId: 'b', sort: 'desc' }] } },
        read: (api) => colState(api, 'b')?.sort ?? null,
    },
    rowGroup: {
        state: { rowGroup: { groupColIds: ['a'] } },
        read: (api) => api.getRowGroupColumns().map((col) => col.getColId()),
    },
    aggregation: {
        state: { aggregation: { aggregationModel: [{ colId: 'n', aggFunc: 'sum' }] } },
        read: (api) => colState(api, 'n')?.aggFunc ?? null,
    },
    showValuesAs: {
        state: {
            aggregation: { aggregationModel: [{ colId: 'n', aggFunc: 'sum' }] },
            showValuesAs: { showValuesAsModel: [{ colId: 'n', showValuesAs: 'percentOfGrandTotal' }] },
        },
        read: (api) => colState(api, 'n')?.showValuesAs ?? null,
        resetState: { aggregation: { aggregationModel: [{ colId: 'n', aggFunc: 'sum' }] } },
        ignore: ['showValuesAs', 'aggregation'],
    },
    pivot: {
        state: { pivot: { pivotMode: true, pivotColIds: ['a'] } },
        read: (api) => ({
            pivotMode: api.isPivotMode(),
            pivotCols: api.getPivotColumns().map((col) => col.getColId()),
        }),
    },
    columnPinning: {
        state: { columnPinning: { leftColIds: ['b'], rightColIds: [] } },
        read: (api) => colState(api, 'b')?.pinned ?? null,
    },
    columnVisibility: {
        state: { columnVisibility: { hiddenColIds: ['b'] } },
        read: (api) => colState(api, 'b')?.hide ?? null,
    },
    columnSizing: {
        state: { columnSizing: { columnSizingModel: [{ colId: 'b', width: 321 }] } },
        read: (api) => colState(api, 'b')?.width,
    },
    columnOrder: {
        state: { columnOrder: { orderedColIds: ['n', 'b', 'a'] } },
        read: (api) => api.getColumnState().map((col) => col.colId),
    },
    columnHeaderName: {
        state: { columnHeaderName: { columnHeaderNames: [{ colId: 'b', headerName: 'Renamed' }] } },
        read: (api) => api.getDisplayNameForColumn(api.getColumn('b')!, 'header'),
    },
    columnGroup: {
        state: { columnGroup: { openColumnGroupIds: ['g'] } },
        read: (api) => api.getColumnGroupState().find((group) => group.groupId === 'g')?.open,
    },
    filter: {
        state: { filter: { filterModel: { b: { filterType: 'text', type: 'equals', filter: 'b1' } } } },
        read: (api) => api.getFilterModel(),
    },
    find: {
        options: { toolbar: { items: ['agFindToolbarItem'] } },
        state: { find: { searchValue: 'a0' } },
        read: (api) => api.getGridOption('findSearchValue') ?? '',
    },
    quickFilter: {
        options: { toolbar: { items: ['agQuickFilterToolbarItem'] } },
        state: { quickFilter: { text: 'a0' } },
        read: (api) => api.getGridOption('quickFilterText') ?? '',
    },
    focusedCell: {
        state: { focusedCell: { colId: 'b', rowIndex: 2, rowPinned: null } },
        read: (api) => api.getFocusedCell()?.rowIndex ?? null,
    },
    pagination: {
        options: { pagination: true, paginationPageSize: 2, paginationPageSizeSelector: false },
        state: { pagination: { page: 3, pageSize: 2 } },
        read: (api) => api.paginationGetCurrentPage(),
    },
    rowPinning: {
        options: { enableRowPinning: true },
        state: { rowPinning: { top: ['0'], bottom: [] } },
        read: (api) => api.getPinnedTopRowCount(),
    },
    cellSelection: {
        options: { cellSelection: true },
        state: {
            cellSelection: {
                cellRanges: [
                    {
                        startRow: { rowIndex: 0, rowPinned: null },
                        endRow: { rowIndex: 1, rowPinned: null },
                        colIds: ['b'],
                        startColId: 'b',
                    },
                ],
            },
        },
        read: (api) => api.getCellRanges()?.length ?? 0,
    },
    rowGroupExpansion: {
        options: { groupDefaultExpanded: 0, initialState: { rowGroup: { groupColIds: ['a'] } } },
        state: {
            rowGroup: { groupColIds: ['a'] },
            rowGroupExpansion: { expandedRowGroupIds: ['row-group-a-a0'], collapsedRowGroupIds: [] },
        },
        read: (api) => {
            let expanded = 0;
            api.forEachNode((node) => {
                if (node.group && node.expanded) {
                    expanded++;
                }
            });
            return expanded;
        },
        resetState: { rowGroup: { groupColIds: ['a'] } },
        ignore: ['rowGroupExpansion', 'rowGroup'],
    },
    rowSelection: {
        options: { rowSelection: { mode: 'multiRow' } },
        state: { rowSelection: ['0', '1'] },
        read: (api) => api.getSelectedNodes().length,
    },
    scroll: {
        state: { scroll: { top: 120, left: 0 } },
        read: (api) => api.getVerticalPixelRange().top,
    },
    sideBar: {
        options: { sideBar: ['columns', 'filters'] },
        state: { sideBar: { visible: true, position: 'right', openToolPanel: 'filters', toolPanels: {} } },
        read: (api) => api.getOpenedToolPanel(),
    },
    userColumns: {
        options: { calculatedColumns: true },
        state: {
            userColumns: [
                { colId: 'calc1', created: true, properties: [{ property: 'calculatedExpression', value: '[a]' }] },
            ],
        },
        read: (api) => api.getColumn('calc1') != null,
    },
};

describe('setState resets every section the state omits', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each(Object.entries(CASES))('%s', async (_key, { options, state, read, resetState }) => {
        const api = gridsManager.createGrid('myGrid', { ...baseOptions, ...options });
        await asyncSetTimeout(0);
        const baseline = read(api);

        api.setState({ version: api.getState().version, ...state });
        await waitFor(() => expect(read(api)).not.toEqual(baseline));

        api.setState({ ...resetState });
        await waitFor(() => expect(read(api)).toEqual(baseline));
    });
});

describe('setState with propertiesToIgnore leaves the ignored section unchanged', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each(Object.entries(CASES))('%s', async (key, { options, state, read, ignore }) => {
        const api = gridsManager.createGrid('myGrid', { ...baseOptions, ...options });
        await asyncSetTimeout(0);
        const baseline = read(api);

        await setStateSettled(api, { version: api.getState().version, ...state });
        const applied = read(api);
        expect(applied).not.toEqual(baseline);

        await setStateSettled(api, {}, ignore ?? [key as GridStateKey]);
        expect(read(api)).toEqual(applied);
    });
});

describe('setState columnSizing reset restores colDef width and flex', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('every column returns to the flex or width its colDef declares', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'flexCol', field: 'a', flex: 1 },
                { colId: 'initialFlexCol', field: 'a', initialFlex: 2 },
                { colId: 'widthCol', field: 'b', width: 150 },
                { colId: 'initialWidthCol', field: 'b', initialWidth: 120 },
                { colId: 'clampedCol', field: 'b', width: 30, minWidth: 80 },
                { colId: 'defaultCol', field: 'n' },
            ],
            rowData,
        });
        await asyncSetTimeout(0);
        const sizes = () =>
            api.getColumnState().map(({ colId, flex, width }) => (flex == null ? { colId, width } : { colId, flex }));
        const baseline = sizes();

        api.setState({
            columnSizing: {
                columnSizingModel: [
                    'flexCol',
                    'initialFlexCol',
                    'widthCol',
                    'initialWidthCol',
                    'clampedCol',
                    'defaultCol',
                ].map((colId) => ({ colId, width: 300 })),
            },
        });
        await waitFor(() => expect(colState(api, 'defaultCol')?.width).toBe(300));

        api.setState({});
        await waitFor(() => expect(sizes()).toEqual(baseline));
        expect(baseline).toEqual([
            { colId: 'flexCol', flex: 1 },
            { colId: 'initialFlexCol', flex: 2 },
            { colId: 'widthCol', width: 150 },
            { colId: 'initialWidthCol', width: 120 },
            { colId: 'clampedCol', width: 80 },
            { colId: 'defaultCol', width: 200 },
        ]);
    });

    test('a column the sizing model omits returns to its colDef width', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'listedCol', field: 'a' },
                { colId: 'unlistedCol', field: 'b', width: 150 },
            ],
            rowData,
        });
        await asyncSetTimeout(0);

        api.setState({ columnSizing: { columnSizingModel: [{ colId: 'unlistedCol', width: 400 }] } });
        await waitFor(() => expect(colState(api, 'unlistedCol')?.width).toBe(400));

        api.setState({ columnSizing: { columnSizingModel: [{ colId: 'listedCol', width: 250 }] } });
        await waitFor(() => {
            expect(colState(api, 'listedCol')?.width).toBe(250);
            expect(colState(api, 'unlistedCol')?.width).toBe(150);
        });
    });
});

describe('setState pivotSort reset restores the colDef value', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    function createGrid() {
        return gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'sortedCol', field: 'a', enablePivot: true, pivotSort: 'desc' },
                { colId: 'unsortedCol', field: 'b', enablePivot: true },
            ],
            rowData,
        });
    }

    test('setState({}) resets pivotSort to the colDef value', async () => {
        const api = createGrid();
        await asyncSetTimeout(0);
        const baselineUnsorted = colState(api, 'unsortedCol')?.pivotSort;

        api.setState({
            pivot: {
                pivotMode: true,
                pivotColIds: ['sortedCol', 'unsortedCol'],
                pivotSortModel: [
                    { colId: 'sortedCol', sort: 'asc' },
                    { colId: 'unsortedCol', sort: 'desc' },
                ],
            },
        });
        await waitFor(() => expect(colState(api, 'sortedCol')?.pivotSort).toBe('asc'));

        api.setState({});
        await waitFor(() => {
            expect(colState(api, 'sortedCol')?.pivotSort).toBe('desc');
            expect(colState(api, 'unsortedCol')?.pivotSort).toBe(baselineUnsorted);
        });
    });

    test('a pivot state omitting pivotSortModel resets a previously set pivotSort', async () => {
        const api = createGrid();
        await asyncSetTimeout(0);

        api.setState({
            pivot: {
                pivotMode: true,
                pivotColIds: ['sortedCol'],
                pivotSortModel: [{ colId: 'sortedCol', sort: 'asc' }],
            },
        });
        await waitFor(() => expect(colState(api, 'sortedCol')?.pivotSort).toBe('asc'));

        api.setState({ pivot: { pivotMode: true, pivotColIds: ['sortedCol'] } });
        await waitFor(() => expect(colState(api, 'sortedCol')?.pivotSort).toBe('desc'));
    });
});

describe('setState({}) reproduces the reported Plunker scenarios', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    interface Athlete {
        athlete: string;
        country: string;
        sport: string;
        gold: number;
    }

    const athleteOptions: GridOptions<Athlete> = {
        columnDefs: [
            { colId: 'athlete', field: 'athlete' },
            { colId: 'country', field: 'country' },
            { colId: 'sport', field: 'sport' },
            { colId: 'gold', field: 'gold', enableRowGroup: true, enablePivot: true, enableValue: true },
        ],
        rowData: [
            { athlete: 'Alice', country: 'Canada', sport: 'Swimming', gold: 3 },
            { athlete: 'Bob', country: 'Ireland', sport: 'Athletics', gold: 1 },
        ],
    };

    afterEach(() => {
        gridsManager.reset();
    });

    test('a reordered, sorted, widened column view returns to colDef order and widths', async () => {
        const api = gridsManager.createGrid('myGrid', athleteOptions);
        await asyncSetTimeout(0);

        api.setState({
            columnOrder: { orderedColIds: ['gold', 'athlete', 'country', 'sport'] },
            sort: { sortModel: [{ colId: 'gold', sort: 'desc' }] },
            columnSizing: { columnSizingModel: [{ colId: 'athlete', width: 400 }] },
        });
        await waitFor(() => expect(api.getColumnState().map((col) => col.colId)[0]).toBe('gold'));

        api.setState({});
        await waitFor(() => {
            expect(api.getColumnState().map((col) => col.colId)).toEqual(['athlete', 'country', 'sport', 'gold']);
            for (const colId of ['athlete', 'country', 'sport', 'gold']) {
                expect(colState(api, colId)?.width).toBe(200);
            }
            expect(colState(api, 'gold')?.sort ?? null).toBeNull();
        });
    });

    test('a pivot view returns to pivot mode off with rows shown', async () => {
        const api = gridsManager.createGrid('myGrid', athleteOptions);
        await asyncSetTimeout(0);

        api.setState({ pivot: { pivotMode: true, pivotColIds: ['gold'] } });
        await waitFor(() => expect(api.isPivotMode()).toBe(true));

        api.setState({});
        await waitFor(() => {
            expect(api.isPivotMode()).toBe(false);
            expect(api.getDisplayedRowCount()).toBe(2);
        });
    });
});

describe('setState(getState()) restores the saved grid', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a snapshot with grouping, a selection column and mixed sizing restores its column state', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { colId: 'a', field: 'a', rowGroup: true, hide: true },
                { colId: 'b', field: 'b', flex: 1, minWidth: 100 },
                { colId: 'n', field: 'n', initialWidth: 120, minWidth: 90 },
                { colId: 'id', field: 'id' },
            ],
            rowData,
            rowSelection: { mode: 'multiRow' },
        });
        await asyncSetTimeout(0);

        api.moveColumns(['id'], 0);
        api.setColumnWidths([{ key: 'n', newWidth: 260 }]);
        api.applyColumnState({ state: [{ colId: 'id', sort: 'desc', sortIndex: 0 }] });
        const snapshot = await waitFor(() => {
            const state = api.getState();
            expect(state.sort?.sortModel).toMatchObject([{ colId: 'id', sort: 'desc' }]);
            return state;
        });
        const snapshotColumnState = api.getColumnState();

        api.moveColumns(['b'], 0);
        api.setColumnWidths([{ key: 'id', newWidth: 330 }]);
        api.applyColumnState({ state: [{ colId: 'n', sort: 'asc', sortIndex: 0 }], defaultState: { sort: null } });
        await waitFor(() => expect(api.getColumnState()).not.toEqual(snapshotColumnState));

        api.setState(snapshot);
        await waitFor(() => expect(api.getColumnState()).toEqual(snapshotColumnState));
    });

    test('restoring a getState() snapshot reproduces the column state and pivot mode it was taken in', async () => {
        const api = gridsManager.createGrid('myGrid', baseOptions);
        await asyncSetTimeout(0);

        api.setState({
            columnOrder: { orderedColIds: ['b', 'n', 'a'] },
            columnSizing: { columnSizingModel: [{ colId: 'b', width: 350 }] },
            sort: { sortModel: [{ colId: 'n', sort: 'asc' }] },
            columnPinning: { leftColIds: ['b'], rightColIds: [] },
        });
        const snapshot = await waitFor(() => {
            const state = api.getState();
            expect(state.columnOrder?.orderedColIds).toEqual(['b', 'n', 'a']);
            return state;
        });
        const snapshotColumnState = api.getColumnState();
        const snapshotPivotMode = api.isPivotMode();

        api.setState({ pivot: { pivotMode: true, pivotColIds: ['a'] } });
        await waitFor(() => expect(api.isPivotMode()).toBe(true));

        api.setState(snapshot);
        await waitFor(() => {
            expect(api.getColumnState()).toEqual(snapshotColumnState);
            expect(api.isPivotMode()).toBe(snapshotPivotMode);
        });
    });

    test('restoring a snapshot taken with pivot mode off turns pivot mode off on a grid currently pivoted', async () => {
        const api = gridsManager.createGrid('myGrid', baseOptions);
        await asyncSetTimeout(0);
        const snapshot = api.getState();
        expect(api.isPivotMode()).toBe(false);

        api.setState({ pivot: { pivotMode: true, pivotColIds: ['a'] } });
        await waitFor(() => expect(api.isPivotMode()).toBe(true));

        api.setState(snapshot);
        await waitFor(() => expect(api.isPivotMode()).toBe(false));
    });
});

describe('setState without a version keeps a version-less cellSelection', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test('a version-less state with cellSelection is not migrated away', async () => {
        const api = gridsManager.createGrid('myGrid', { ...baseOptions, cellSelection: true });
        await asyncSetTimeout(0);

        api.setState({
            cellSelection: {
                cellRanges: [
                    {
                        startRow: { rowIndex: 0, rowPinned: null },
                        endRow: { rowIndex: 1, rowPinned: null },
                        colIds: ['b'],
                        startColId: 'b',
                    },
                ],
            },
        });

        await waitFor(() => expect(api.getCellRanges()?.length ?? 0).toBe(1));
    });
});
