import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

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

interface SectionCase {
    options?: GridOptions<Row>;
    /** A non-default value for the section, applied with `setState` so the grid moves off its defaults. */
    state: GridState;
    /** Reads the section from the live grid, not from `getState`, which echoes the state last set. */
    read: (api: GridApi<Row>) => unknown;
}

/** Every `GridStateKey` except those needing a different row model or setup covered elsewhere. */
const CASES: Partial<Record<GridStateKey, SectionCase>> = {
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
    },
    rowSelection: {
        options: { rowSelection: { mode: 'multiRow' } },
        state: { rowSelection: ['0', '1'] },
        read: (api) => api.getSelectedNodes().length,
    },
    sideBar: {
        options: { sideBar: ['columns', 'filters'] },
        state: { sideBar: { visible: true, position: 'right', openToolPanel: 'filters', toolPanels: {} } },
        read: (api) => api.getOpenedToolPanel(),
    },
};

describe('setState resets every section the state omits', () => {
    const gridsManager = new TestGridsManager({ modules: [AllEnterpriseModule] });

    afterEach(() => {
        gridsManager.reset();
    });

    test.each(Object.entries(CASES))('%s', async (_key, { options, state, read }) => {
        const api = gridsManager.createGrid('myGrid', { ...baseOptions, ...options });
        await asyncSetTimeout(0);
        const baseline = read(api);

        api.setState({ version: api.getState().version, ...state });
        await waitFor(() => expect(read(api)).not.toEqual(baseline));

        api.setState({});
        await asyncSetTimeout(10);
        expect(read(api)).toEqual(baseline);
    });
});
