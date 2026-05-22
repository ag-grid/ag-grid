import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

describe('pivot with groupHierarchy (date-time)', () => {
    // Tests ported from e2e: documentation/ag-grid-docs/src/content/docs/pivoting-column-groups/_examples/pivoting-date-time/example.spec.ts

    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const createPivotDateTimeGrid = (additionalOptions: Partial<GridOptions> = {}) => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true },
                { field: 'sport' },
                {
                    field: 'date',
                    enablePivot: true,
                    groupHierarchy: ['year', 'month'],
                },
                { field: 'total', aggFunc: 'sum' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            ...additionalOptions,
        };

        const api = gridsManager.createGrid('pivotDateTime', gridOptions);

        // Add sample data with dates
        applyTransactionChecked(api, {
            add: [
                {
                    id: '1',
                    athlete: 'Athlete A',
                    country: 'USA',
                    sport: 'Swimming',
                    date: new Date(2000, 9, 15),
                    total: 5,
                },
                {
                    id: '2',
                    athlete: 'Athlete B',
                    country: 'USA',
                    sport: 'Running',
                    date: new Date(2000, 9, 20),
                    total: 3,
                },
                {
                    id: '3',
                    athlete: 'Athlete C',
                    country: 'USA',
                    sport: 'Cycling',
                    date: new Date(2000, 10, 5),
                    total: 4,
                },
                {
                    id: '4',
                    athlete: 'Athlete D',
                    country: 'Ireland',
                    sport: 'Swimming',
                    date: new Date(2001, 0, 10),
                    total: 2,
                },
                {
                    id: '5',
                    athlete: 'Athlete E',
                    country: 'Ireland',
                    sport: 'Running',
                    date: new Date(2001, 5, 15),
                    total: 6,
                },
            ],
        });

        return api;
    };

    // Helper to get GridRows options for pivot with date hierarchy - only include auto column for simplicity
    const getGridRowsOptions = () => {
        return {
            forcedColumns: ['ag-Grid-AutoColumn'],
            printHiddenRows: false,
        };
    };

    test('pivot by date column creates hierarchy columns (year -> month)', async () => {
        const api = createPivotDateTimeGrid();

        // Set pivot columns via API (equivalent to drag-drop in e2e)
        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        // Verify pivot result columns are created with hierarchy structure
        const pivotColumns = api.getPivotResultColumns();
        expect(pivotColumns).not.toBeNull();
        expect(pivotColumns!.length).toBeGreaterThan(0);

        // Verify column IDs contain the hierarchy prefix pattern
        const pivotColIds = pivotColumns!.map((col) => col.getColId());

        // Should have columns for different year/month combinations
        const hasHierarchyColumns = pivotColIds.some(
            (id) =>
                id.includes('ag-Grid-HierarchyColumn-date-year') && id.includes('ag-Grid-HierarchyColumn-date-month')
        );
        expect(hasHierarchyColumns).toBe(true);

        // Verify via GridRows snapshot
        await new GridRows(api, 'pivot with date hierarchy', getGridRowsOptions()).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            └── LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP closed
            │ ├─┬ "10" GROUP closed hidden
            │ │ ├─┬ "2000-10-15" GROUP hidden
            │ │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2000-10-2000-10-15_total "Total" width:200 columnGroupShow:open hidden
            │ │ ├─┬ "2000-10-20" GROUP hidden
            │ │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2000-10-2000-10-20_total "Total" width:200 columnGroupShow:open hidden
            │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2000-10_total "Total" width:200 columnGroupShow:closed hidden
            │ ├─┬ "11" GROUP closed hidden
            │ │ ├─┬ "2000-11-05" GROUP hidden
            │ │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2000-11-2000-11-05_total "Total" width:200 columnGroupShow:open hidden
            │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2000-11_total "Total" width:200 columnGroupShow:closed hidden
            │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2000_total "Total" width:200 columnGroupShow:closed
            └─┬ "2001" GROUP closed
              ├─┬ "1" GROUP closed hidden
              │ ├─┬ "2001-01-10" GROUP hidden
              │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2001-1-2001-01-10_total "Total" width:200 columnGroupShow:open hidden
              │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2001-1_total "Total" width:200 columnGroupShow:closed hidden
              ├─┬ "6" GROUP closed hidden
              │ ├─┬ "2001-06-15" GROUP hidden
              │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2001-6-2001-06-15_total "Total" width:200 columnGroupShow:open hidden
              │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2001-6_total "Total" width:200 columnGroupShow:closed hidden
              └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_2001_total "Total" width:200 columnGroupShow:closed
        `);
    });

    test('setPivotColumns toggles pivot result columns', async () => {
        const api = createPivotDateTimeGrid();

        // Initially no pivot columns
        expect(api.getPivotColumns()).toHaveLength(0);

        // Verify initial state without pivot - no pivot result columns
        const initialPivotResultCols = api.getPivotResultColumns();
        expect(initialPivotResultCols == null || initialPivotResultCols.length === 0).toBe(true);

        // Set date as pivot column
        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        // Should now have pivot columns set
        const pivotCols = api.getPivotColumns();
        expect(pivotCols.length).toBeGreaterThan(0);

        // Verify pivot result columns exist
        const afterSetPivotResultCols = api.getPivotResultColumns();
        expect(afterSetPivotResultCols).not.toBeNull();
        expect(afterSetPivotResultCols!.length).toBeGreaterThan(0);

        // Verify via GridRows snapshot with pivot enabled
        await new GridRows(api, 'after setPivotColumns', getGridRowsOptions()).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            └── LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
        `);

        // Clear pivot columns
        api.setPivotColumns([]);
        await asyncSetTimeout(0);

        // Should be empty again
        expect(api.getPivotColumns()).toHaveLength(0);

        // Pivot result columns should be cleared (returns null or empty array)
        const clearedPivotResultCols = api.getPivotResultColumns();
        expect(clearedPivotResultCols == null || clearedPivotResultCols.length === 0).toBe(true);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── total "Total" width:200 aggFunc:sum
        `);
    });

    test('pivotIndex auto-pivots column with groupHierarchy', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [
                { field: 'athlete' },
                { field: 'country', rowGroup: true },
                { field: 'sport' },
                {
                    field: 'date',
                    pivotIndex: 0,
                    groupHierarchy: ['year', 'month'],
                },
                { field: 'total', aggFunc: 'sum' },
            ],
            pivotMode: true,
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('pivotIndexDateTime', gridOptions);

        applyTransactionChecked(api, {
            add: [
                {
                    id: '1',
                    athlete: 'Athlete A',
                    country: 'USA',
                    sport: 'Swimming',
                    date: new Date(2000, 9, 15),
                    total: 5,
                },
                {
                    id: '2',
                    athlete: 'Athlete B',
                    country: 'Ireland',
                    sport: 'Running',
                    date: new Date(2001, 0, 10),
                    total: 3,
                },
            ],
        });

        await asyncSetTimeout(0);

        // With pivotIndex, pivot columns should be auto-set
        const pivotCols = api.getPivotColumns();
        expect(pivotCols.length).toBeGreaterThan(0);

        // Verify pivot result columns exist with hierarchy
        const pivotResultCols = api.getPivotResultColumns();
        expect(pivotResultCols).not.toBeNull();
        expect(pivotResultCols!.length).toBeGreaterThan(0);

        // Verify the hierarchy structure in column IDs
        const pivotColIds = pivotResultCols!.map((col) => col.getColId());
        const hasHierarchyColumns = pivotColIds.some(
            (id) =>
                id.includes('ag-Grid-HierarchyColumn-date-year') && id.includes('ag-Grid-HierarchyColumn-date-month')
        );
        expect(hasHierarchyColumns).toBe(true);

        // Verify via GridRows snapshot
        await new GridRows(api, 'pivotIndex with groupHierarchy', getGridRowsOptions()).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            └── LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
        `);
    });

    test('pivot columns for year 2000 and 2001 are created from sample data', async () => {
        const api = createPivotDateTimeGrid();

        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        // Verify pivot result columns exist
        const pivotResultCols = api.getPivotResultColumns();
        expect(pivotResultCols).not.toBeNull();
        expect(pivotResultCols!.length).toBeGreaterThan(0);

        // Verify we have columns for year 2000 (our sample data has 2000 and 2001)
        const pivotColIds = pivotResultCols!.map((col) => col.getColId());
        const year2000Cols = pivotColIds.filter((id) => id.includes('2000'));
        expect(year2000Cols.length).toBeGreaterThan(0);

        // Verify we have columns for year 2001
        const year2001Cols = pivotColIds.filter((id) => id.includes('2001'));
        expect(year2001Cols.length).toBeGreaterThan(0);

        // Verify via GridRows snapshot
        await new GridRows(api, 'pivot with 2000 and 2001 data', getGridRowsOptions()).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            └── LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
        `);
    });

    // skipped on `latest` — fix lands with AG-17366-column-model-rewrite
    test.skip('re-setting identical columnDefs does not leave destroyed hierarchy columns', async () => {
        const api = createPivotDateTimeGrid();
        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        const firstRun = api.getPivotResultColumns();
        expect(firstRun).not.toBeNull();
        expect(firstRun!.length).toBeGreaterThan(0);

        // Capture hierarchy column instances before the rebuild. These are the beans at risk
        // of being destroyed and re-exposed via the ID-equal early-return.
        const hierarchyColsBefore = api
            .getColumns()!
            .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-date'));
        expect(hierarchyColsBefore.length).toBeGreaterThan(0);

        // Re-apply the same columnDefs. This rebuilds the colDefTree, which on the buggy
        // path destroyed the hierarchy beans before keeping them via the ID-equal early-return.
        api.setGridOption('columnDefs', [
            { field: 'athlete' },
            { field: 'country', rowGroup: true },
            { field: 'sport' },
            {
                field: 'date',
                enablePivot: true,
                groupHierarchy: ['year', 'month'],
            },
            { field: 'total', aggFunc: 'sum' },
        ]);
        await asyncSetTimeout(0);

        const hierarchyColsAfter = api
            .getColumns()!
            .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-date'));
        expect(hierarchyColsAfter.length).toBeGreaterThan(0);
        for (const col of hierarchyColsAfter) {
            expect((col as any).isAlive()).toBe(true);
        }

        await new GridRows(api, 'hierarchy columns after re-setting identical defs', getGridRowsOptions()).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA"
            └── LEAF_GROUP collapsed id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
        `);
    });

    /**
     * Locks in the sort behaviour of `GroupHierarchyColService.compareVirtualColumns` when both
     * a source col and one of its virtual cols are simultaneously row-grouped. The virtual cols
     * must sort BEFORE the source col, and virtual cols from the same source must keep their
     * insertion-order within that source's bucket.
     */
    test('virtual cols sort before their source col when both are row-grouped', async () => {
        // A date col with `groupHierarchy: ['year', 'month']` AND `rowGroup: true` makes the
        // source col plus both virtual cols (year, month) eligible to be row-group cols. The
        // sort comparator in BaseColsService.sortColumns delegates to
        // GroupHierarchyColService.compareVirtualColumns for these pairs.
        const api = gridsManager.createGrid('hierarchyRowGroup', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        // Expected order in row-group cols list: [year-virtual, month-virtual, date-source].
        // The compareVirtualColumns:
        //   - returns -1 for (year, date) since year is virtual-of date  →  year before date
        //   - returns -1 for (month, date) since month is virtual-of date  →  month before date
        //   - returns insertion-order for (year, month) within date's bucket  →  year before month
        const rowGroupCols = api.getRowGroupColumns().map((c) => c.getColId());
        const yearIdx = rowGroupCols.findIndex((id) => id.includes('-date-year'));
        const monthIdx = rowGroupCols.findIndex((id) => id.includes('-date-month'));
        const dateIdx = rowGroupCols.findIndex((id) => id === 'date');
        expect(yearIdx).toBeGreaterThanOrEqual(0);
        expect(monthIdx).toBeGreaterThanOrEqual(0);
        expect(dateIdx).toBeGreaterThanOrEqual(0);
        expect(yearIdx).toBeLessThan(monthIdx);
        expect(monthIdx).toBeLessThan(dateIdx);

        // Sanity: GridColumns snapshot of the displayed structure.
        await new GridColumns(api, 'date hierarchy as row groups').checkColumns(false);
    });

    test('adding groupHierarchy at runtime creates virtual columns', async () => {
        const api = gridsManager.createGrid('addHierarchy', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true }],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(0);

        const beforeIds = api.getAllGridColumns().map((c) => c.getColId());
        expect(beforeIds.filter((id) => id.startsWith('ag-Grid-HierarchyColumn-date'))).toHaveLength(0);

        api.setGridOption('columnDefs', [
            { field: 'country' },
            { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
        ]);
        await asyncSetTimeout(0);

        const afterIds = api.getAllGridColumns().map((c) => c.getColId());
        const hierarchyIds = afterIds.filter((id) => id.startsWith('ag-Grid-HierarchyColumn-date'));
        expect(hierarchyIds.length).toBeGreaterThan(0);
        expect(new Set(hierarchyIds).size).toBe(hierarchyIds.length);

        await new GridColumns(api, 'hierarchy added at runtime').checkColumns(false);
        await new GridRows(api, 'rows after hierarchy added').check(false);
    });

    test('removing groupHierarchy at runtime destroys virtual columns', async () => {
        const api = gridsManager.createGrid('removeHierarchy', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
            groupDefaultExpanded: -1,
        });
        await asyncSetTimeout(0);

        const virtualColsBefore = api
            .getAllGridColumns()
            .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-date'));
        expect(virtualColsBefore.length).toBeGreaterThan(0);

        api.setGridOption('columnDefs', [{ field: 'country' }, { field: 'date', rowGroup: true }]);
        await asyncSetTimeout(0);

        const virtualColsAfter = api
            .getAllGridColumns()
            .filter((c) => c.getColId().startsWith('ag-Grid-HierarchyColumn-date'));
        expect(virtualColsAfter).toHaveLength(0);

        for (const col of virtualColsBefore) {
            expect((col as any).isAlive()).toBe(false);
        }

        await new GridColumns(api, 'hierarchy removed at runtime').checkColumns(false);
        await new GridRows(api, 'rows after hierarchy removed').check(false);
    });

    test('changing groupHierarchy array contents regenerates virtuals', async () => {
        const api = gridsManager.createGrid('changeHierarchy', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year'] }],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
        });
        await asyncSetTimeout(0);

        const yearVirtualsBefore = api.getAllGridColumns().filter((c) => c.getColId().includes('-date-year'));
        const monthVirtualsBefore = api.getAllGridColumns().filter((c) => c.getColId().includes('-date-month'));
        expect(yearVirtualsBefore.length).toBeGreaterThan(0);
        expect(monthVirtualsBefore).toHaveLength(0);

        api.setGridOption('columnDefs', [
            { field: 'country' },
            { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
        ]);
        await asyncSetTimeout(0);

        const yearVirtualsAfter = api.getAllGridColumns().filter((c) => c.getColId().includes('-date-year'));
        const monthVirtualsAfter = api.getAllGridColumns().filter((c) => c.getColId().includes('-date-month'));
        expect(yearVirtualsAfter.length).toBeGreaterThan(0);
        expect(monthVirtualsAfter.length).toBeGreaterThan(0);

        const allIds = api.getAllGridColumns().map((c) => c.getColId());
        expect(new Set(allIds).size).toBe(allIds.length);

        await new GridColumns(api, 'hierarchy expanded year → year+month').checkColumns(false);
        await new GridRows(api, 'rows after hierarchy expanded').check(false);
    });

    test('getPivotResultColumns() returns null when pivot mode is off', async () => {
        const api = gridsManager.createGrid('pivotOff', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }, { field: 'gold', aggFunc: 'sum' }],
            rowData: [{ country: 'USA', sport: 'Swim', gold: 5 }],
        });
        await asyncSetTimeout(0);

        const cols = api.getPivotResultColumns();
        expect(cols == null || cols.length === 0).toBe(true);
    });

    test('toggling pivot mode off after on clears pivot result cols', async () => {
        const api = createPivotDateTimeGrid();
        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        expect(api.getPivotResultColumns()).not.toBeNull();
        expect(api.getPivotResultColumns()!.length).toBeGreaterThan(0);

        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);

        const cols = api.getPivotResultColumns();
        expect(cols == null || cols.length === 0).toBe(true);
    });

    test('row-grouping the same hierarchy col twice does not duplicate virtuals', async () => {
        const api = gridsManager.createGrid('dedup', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
        });
        await asyncSetTimeout(0);

        const beforeCount = api.getRowGroupColumns().length;
        expect(beforeCount).toBeGreaterThan(0);

        api.addRowGroupColumns(['date']);
        await asyncSetTimeout(0);

        const afterCount = api.getRowGroupColumns().length;
        expect(afterCount).toBe(beforeCount);

        const ids = api.getRowGroupColumns().map((c) => c.getColId());
        expect(new Set(ids).size).toBe(ids.length);
    });

    test('virtual siblings preserve insertion order in multi-sort row-group output', async () => {
        const api = gridsManager.createGrid('multiSortVirtual', {
            columnDefs: [
                { field: 'country' },
                { field: 'date', rowGroup: true, groupHierarchy: ['year', 'quarter', 'month'] },
            ],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        const rgIds = api.getRowGroupColumns().map((c) => c.getColId());
        const yearIdx = rgIds.findIndex((id) => id.includes('-date-year'));
        const quarterIdx = rgIds.findIndex((id) => id.includes('-date-quarter'));
        const monthIdx = rgIds.findIndex((id) => id.includes('-date-month'));
        const dateIdx = rgIds.findIndex((id) => id === 'date');

        expect(yearIdx).toBeGreaterThanOrEqual(0);
        expect(quarterIdx).toBeGreaterThanOrEqual(0);
        expect(monthIdx).toBeGreaterThanOrEqual(0);
        expect(dateIdx).toBeGreaterThanOrEqual(0);
        expect(yearIdx).toBeLessThan(quarterIdx);
        expect(quarterIdx).toBeLessThan(monthIdx);
        expect(monthIdx).toBeLessThan(dateIdx);
    });

    test('clearing pivot then re-applying same pivot reuses saved pivot result cols', async () => {
        const api = createPivotDateTimeGrid();
        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        const before = api.getPivotResultColumns();
        expect(before).not.toBeNull();
        const colIdsBefore = before!.map((c) => c.getColId());

        api.setPivotColumns([]);
        await asyncSetTimeout(0);

        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        const after = api.getPivotResultColumns();
        expect(after).not.toBeNull();
        expect(after!.map((c) => c.getColId())).toEqual(colIdsBefore);
    });

    test('hierarchy virtual visibility unchanged by ungrouping then re-grouping its source', async () => {
        const api = gridsManager.createGrid('hierVirtualVisible', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
        });
        await asyncSetTimeout(0);

        const yearVirtualBefore = api.getAllGridColumns().find((c) => c.getColId().includes('-date-year'));
        expect(yearVirtualBefore).toBeDefined();
        const wasVisible = yearVirtualBefore!.isVisible();

        api.removeRowGroupColumns(['date']);
        await asyncSetTimeout(0);
        api.addRowGroupColumns(['date']);
        await asyncSetTimeout(0);

        const yearVirtualAfter = api.getAllGridColumns().find((c) => c.getColId().includes('-date-year'));
        expect(yearVirtualAfter).toBeDefined();
        expect(yearVirtualAfter!.isVisible()).toBe(wasVisible);
    });
});
