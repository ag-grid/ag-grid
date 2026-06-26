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

    test('quarter date-part groups each month into the correct quarter', async () => {
        const api = gridsManager.createGrid('quarterHierarchy', {
            columnDefs: [
                { field: 'date', rowGroup: true, hide: true, groupHierarchy: ['quarter'] },
                { field: 'v', aggFunc: 'sum' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
        });
        applyTransactionChecked(api, {
            add: [
                { id: 'mar', date: new Date(2020, 2, 1), v: 1 }, // month 3 → Q1
                { id: 'jul', date: new Date(2020, 6, 1), v: 1 }, // month 7 → Q3
                { id: 'oct', date: new Date(2020, 9, 1), v: 1 }, // month 10 → Q4
            ],
        });
        await asyncSetTimeout(1);

        // Quarter is derived from the 1-based month: Q1=1-3, Q2=4-6, Q3=7-9, Q4=10-12.
        // March → Q1, July → Q3, October → Q4 (the months that the old `/4` math mis-bucketed).
        await new GridRows(api, 'quarter groups', { forcedColumns: ['ag-Grid-AutoColumn'] }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-quarter-1 ag-Grid-AutoColumn:"1"
            │ └─┬ LEAF_GROUP id:row-group-ag-Grid-HierarchyColumn-date-quarter-1-date-2020-03-01 ag-Grid-AutoColumn:"2020-03-01"
            │ · └── LEAF id:mar
            ├─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-quarter-3 ag-Grid-AutoColumn:"3"
            │ └─┬ LEAF_GROUP id:row-group-ag-Grid-HierarchyColumn-date-quarter-3-date-2020-07-01 ag-Grid-AutoColumn:"2020-07-01"
            │ · └── LEAF id:jul
            └─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-quarter-4 ag-Grid-AutoColumn:"4"
            · └─┬ LEAF_GROUP id:row-group-ag-Grid-HierarchyColumn-date-quarter-4-date-2020-10-01 ag-Grid-AutoColumn:"2020-10-01"
            · · └── LEAF id:oct
        `);
    });

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

    test('removing the pivot source col leaves year/month as pivot dimensions (result regroups to year -> month)', async () => {
        const api = createPivotDateTimeGrid();
        api.setPivotColumns(['date']);
        await asyncSetTimeout(0);

        // [year, month, date] are the pivot dimensions.
        expect(api.getPivotColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
        ]);

        api.removePivotColumns(['date']);
        await asyncSetTimeout(0);
        expect(api.getPivotColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
        ]);

        await new GridColumns(api, 'pivot result after removing the date source dimension').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2000" GROUP closed
            │ ├─┬ "10" GROUP hidden
            │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month_2000-10_total "Total" width:200 columnGroupShow:open hidden
            │ ├─┬ "11" GROUP hidden
            │ │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month_2000-11_total "Total" width:200 columnGroupShow:open hidden
            │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month_2000_total "Total" width:200 columnGroupShow:closed
            └─┬ "2001" GROUP closed
              ├─┬ "1" GROUP hidden
              │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month_2001-1_total "Total" width:200 columnGroupShow:open hidden
              ├─┬ "6" GROUP hidden
              │ └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month_2001-6_total "Total" width:200 columnGroupShow:open hidden
              └── pivot_ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month_2001_total "Total" width:200 columnGroupShow:closed
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

    test('re-setting identical columnDefs does not leave destroyed hierarchy columns', async () => {
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

    test('virtual cols sort before their source col when both are row-grouped', async () => {
        const api = gridsManager.createGrid('hierarchyRowGroup', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        const rowGroupCols = api.getRowGroupColumns().map((c) => c.getColId());
        const yearIdx = rowGroupCols.findIndex((id) => id.includes('-date-year'));
        const monthIdx = rowGroupCols.findIndex((id) => id.includes('-date-month'));
        const dateIdx = rowGroupCols.findIndex((id) => id === 'date');
        expect(yearIdx).toBeGreaterThanOrEqual(0);
        expect(monthIdx).toBeGreaterThanOrEqual(0);
        expect(dateIdx).toBeGreaterThanOrEqual(0);
        expect(yearIdx).toBeLessThan(monthIdx);
        expect(monthIdx).toBeLessThan(dateIdx);

        await new GridColumns(api, 'date hierarchy as row groups').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year "Date (Year)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month "Date (Month)" width:200
            ├── ag-Grid-AutoColumn-date "Date" width:200
            ├── country "Country" width:200
            └── date "Date" width:200 rowGroup
        `);
    });

    test('removing a hierarchy source col leaves its virtual cols grouped (virtuals are independent columns)', async () => {
        const api = gridsManager.createGrid('hierarchyDeactivate', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
        ]);

        api.removeRowGroupColumns(['date']);
        await asyncSetTimeout(0);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
        ]);

        api.addRowGroupColumns(['date']);
        await asyncSetTimeout(0);
        api.applyColumnState({ state: [{ colId: 'date', rowGroup: false }] });
        await asyncSetTimeout(0);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
        ]);
    });

    test('clearing all row-group columns also clears the hierarchy virtuals (setRowGroupColumns([]))', async () => {
        const api = gridsManager.createGrid('hierarchyClearAll', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
        ]);

        api.setRowGroupColumns([]);
        await asyncSetTimeout(0);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([]);
    });

    test('hierarchy virtuals inherit enableRowGroup so their row-group-panel chips stay draggable', async () => {
        const api = gridsManager.createGrid('hierarchyEnableRowGroup', {
            columnDefs: [
                { field: 'country' },
                { field: 'date', rowGroup: true, enableRowGroup: true, groupHierarchy: ['year', 'month'] },
            ],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        // The row-group-panel drop zone only lets a chip drag when its column reports isAllowRowGroup();
        // the date-part virtuals must inherit it from the source so they can be reordered.
        const year = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        const month = api.getColumn('ag-Grid-HierarchyColumn-date-month')!;
        expect(year.isAllowRowGroup()).toBe(true);
        expect(month.isAllowRowGroup()).toBe(true);
    });

    test('changing an inline hierarchy part def refreshes the hierarchy column in place (same colId)', async () => {
        const api = gridsManager.createGrid('hierarchyInlineRefresh', {
            columnDefs: [{ field: 'date', rowGroup: true, groupHierarchy: [{ colId: 'y', headerName: 'Year A' }] }],
            rowData: [{ date: new Date(2020, 0, 1) }],
        });
        await asyncSetTimeout(0);
        const before = api.getColumn('y')!;
        expect(before.getColDef().headerName).toBe('Year A');

        // Same colId 'y', changed header: the existing hierarchy col's def must be reapplied (not left stale,
        // and not rebuilt — same instance).
        api.setGridOption('columnDefs', [
            { field: 'date', rowGroup: true, groupHierarchy: [{ colId: 'y', headerName: 'Year B' }] },
        ]);
        await asyncSetTimeout(0);
        expect(api.getColumn('y')).toBe(before);
        expect(api.getColumn('y')!.getColDef().headerName).toBe('Year B');
    });

    test('every canonical date part extracts the expected value', async () => {
        const api = gridsManager.createGrid('hierarchyAllParts', {
            columnDefs: [
                {
                    field: 'date',
                    enableRowGroup: true,
                    groupHierarchy: ['year', 'quarter', 'month', 'formattedMonth', 'day', 'hour', 'minute', 'second'],
                },
            ],
            rowData: [{ date: new Date(2021, 6, 15, 14, 30, 45) }], // 15 July 2021, 14:30:45
        });
        await asyncSetTimeout(0);
        const node = api.getDisplayedRowAtIndex(0)!;
        const val = (part: string) =>
            api.getCellValue({ rowNode: node, colKey: `ag-Grid-HierarchyColumn-date-${part}` });
        expect(val('year')).toBe('2021');
        expect(val('quarter')).toBe('3'); // July is in Q3 (months 7-9)
        expect(val('month')).toBe('7');
        expect(val('formattedMonth')).toBe('July');
        expect(val('day')).toBe('15');
        expect(val('hour')).toBe('14');
        expect(val('minute')).toBe(':30'); // `_getDateParts` formats minute/second with a leading colon
        expect(val('second')).toBe(':45');

        const parts = ['year', 'quarter', 'month', 'formattedMonth', 'day', 'hour', 'minute', 'second'];
        const forcedColumns = parts.map((p) => `ag-Grid-HierarchyColumn-date-${p}`);
        await new GridColumns(api, 'all date-part hierarchy columns').checkColumns(`
            CENTER
            └── date "Date" width:200
        `);
        await new GridRows(api, 'all date-part values', { forcedColumns }).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-quarter:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date-formattedMonth:null ag-Grid-HierarchyColumn-date-day:null ag-Grid-HierarchyColumn-date-hour:null ag-Grid-HierarchyColumn-date-minute:null ag-Grid-HierarchyColumn-date-second:null
            └── LEAF id:0 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-quarter:"3" ag-Grid-HierarchyColumn-date-month:"7" ag-Grid-HierarchyColumn-date-formattedMonth:"July" ag-Grid-HierarchyColumn-date-day:"15" ag-Grid-HierarchyColumn-date-hour:"14" ag-Grid-HierarchyColumn-date-minute:":30" ag-Grid-HierarchyColumn-date-second:":45"
        `);
    });

    test('changing defaultColDef refreshes the hierarchy column defs in place', async () => {
        const api = gridsManager.createGrid('hierarchyDefaultColDef', {
            columnDefs: [{ field: 'date', rowGroup: true, groupHierarchy: ['year'] }],
            defaultColDef: { width: 150 },
            rowData: [{ date: new Date(2020, 0, 1) }],
        });
        await asyncSetTimeout(0);
        const col = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        expect(col.getColDef().width).toBe(150);

        api.setGridOption('defaultColDef', { width: 250 });
        await asyncSetTimeout(0);
        expect(api.getColumn('ag-Grid-HierarchyColumn-date-year')).toBe(col); // reused, not rebuilt
        expect(api.getColumn('ag-Grid-HierarchyColumn-date-year')!.getColDef().width).toBe(250);
    });

    test('adding a hierarchy part at runtime creates the new column (plan grows)', async () => {
        const api = gridsManager.createGrid('hierarchyPlanGrow', {
            columnDefs: [{ field: 'date', rowGroup: true, groupHierarchy: ['year'] }],
            rowData: [{ date: new Date(2020, 0, 1) }],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'date',
        ]);

        api.setGridOption('columnDefs', [{ field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }]);
        await asyncSetTimeout(0);
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
        ]);
    });

    test('two independent hierarchy sources keep each virtual run ordered before its own source', async () => {
        const api = gridsManager.createGrid('twoHierarchies', {
            columnDefs: [
                { field: 'country' },
                { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'date2', rowGroup: true, groupHierarchy: ['year', 'quarter'] },
            ],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1), date2: new Date(2019, 3, 1) },
                { country: 'UK', date: new Date(2021, 5, 15), date2: new Date(2018, 8, 20) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await new GridColumns(
            api,
            `two independent hierarchy sources keep each virtual run ordered before its own s setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year "Date (Year)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month "Date (Month)" width:200
            ├── ag-Grid-AutoColumn-date "Date" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year "Date2 (Year)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter "Date2 (Quarter)" width:200
            ├── ag-Grid-AutoColumn-date2 "Date2" width:200
            ├── country "Country" width:200
            ├── date "Date" width:200 rowGroup
            └── date2 "Date2" width:200 rowGroup
        `);
        await new GridRows(
            api,
            `two independent hierarchy sources keep each virtual run ordered before its own s setup`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            ├─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:"1" ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01 ag-Grid-AutoColumn-date:"2020-01-01" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-ag-Grid-HierarchyColumn-date2-year-2019 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:"2019" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-ag-Grid-HierarchyColumn-date2-year-2019-ag-Grid-HierarchyColumn-date2-quarter-2 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:"2" ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-ag-Grid-HierarchyColumn-date2-year-2019-ag-Grid-HierarchyColumn-date2-quarter-2-date2-2019-04-01 ag-Grid-AutoColumn-date2:"2019-04-01" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · · · · └── LEAF hidden id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" ag-Grid-HierarchyColumn-date2-year:"2019" ag-Grid-HierarchyColumn-date2-quarter:"2" country:"USA" date:"2020-01-01" date2:"2019-04-01"
            └─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2021 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15 ag-Grid-AutoColumn-date:"2021-06-15" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-ag-Grid-HierarchyColumn-date2-year-2018 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:"2018" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-ag-Grid-HierarchyColumn-date2-year-2018-ag-Grid-HierarchyColumn-date2-quarter-3 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:"3" ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-ag-Grid-HierarchyColumn-date2-year-2018-ag-Grid-HierarchyColumn-date2-quarter-3-date2-2018-09-20 ag-Grid-AutoColumn-date2:"2018-09-20" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · · · · └── LEAF hidden id:1 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-HierarchyColumn-date2-year:"2018" ag-Grid-HierarchyColumn-date2-quarter:"3" country:"UK" date:"2021-06-15" date2:"2018-09-20"
        `);
        await asyncSetTimeout(0);

        // Each source's virtuals stay grouped and ordered (year before month / year before quarter),
        // immediately before that source col; the two source groups keep their colDef order.
        const rowGroupCols = api.getRowGroupColumns().map((c) => c.getColId());
        expect(rowGroupCols).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
            'ag-Grid-HierarchyColumn-date2-year',
            'ag-Grid-HierarchyColumn-date2-quarter',
            'date2',
        ]);
        await new GridRows(
            api,
            `two independent hierarchy sources keep each virtual run ordered before its own s final state`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            ├─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:"1" ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01 ag-Grid-AutoColumn-date:"2020-01-01" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-ag-Grid-HierarchyColumn-date2-year-2019 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:"2019" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-ag-Grid-HierarchyColumn-date2-year-2019-ag-Grid-HierarchyColumn-date2-quarter-2 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:"2" ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-ag-Grid-HierarchyColumn-date2-year-2019-ag-Grid-HierarchyColumn-date2-quarter-2-date2-2019-04-01 ag-Grid-AutoColumn-date2:"2019-04-01" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            │ · · · · · └── LEAF hidden id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" ag-Grid-HierarchyColumn-date2-year:"2019" ag-Grid-HierarchyColumn-date2-quarter:"2" country:"USA" date:"2020-01-01" date2:"2019-04-01"
            └─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2021 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15 ag-Grid-AutoColumn-date:"2021-06-15" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-ag-Grid-HierarchyColumn-date2-year-2018 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:"2018" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-ag-Grid-HierarchyColumn-date2-year-2018-ag-Grid-HierarchyColumn-date2-quarter-3 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-quarter:"3" ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-ag-Grid-HierarchyColumn-date2-year-2018-ag-Grid-HierarchyColumn-date2-quarter-3-date2-2018-09-20 ag-Grid-AutoColumn-date2:"2018-09-20" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null ag-Grid-HierarchyColumn-date2-quarter:null
            · · · · · · └── LEAF hidden id:1 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-HierarchyColumn-date2-year:"2018" ag-Grid-HierarchyColumn-date2-quarter:"3" country:"UK" date:"2021-06-15" date2:"2018-09-20"
        `);
    });

    test('applyColumnState row-group ordering sorts mixed hierarchy + plain cols correctly', async () => {
        const api = gridsManager.createGrid('stateOrder', {
            columnDefs: [
                { field: 'country' },
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
                { field: 'date2', enableRowGroup: true, groupHierarchy: ['year'] },
            ],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1), date2: new Date(2019, 3, 1) },
                { country: 'UK', date: new Date(2021, 5, 15), date2: new Date(2018, 8, 20) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await new GridColumns(
            api,
            `applyColumnState row-group ordering sorts mixed hierarchy + plain cols correctly setup`
        ).checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── date "Date" width:200
            └── date2 "Date2" width:200
        `);
        await new GridRows(
            api,
            `applyColumnState row-group ordering sorts mixed hierarchy + plain cols correctly setup`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            ├── LEAF id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" ag-Grid-HierarchyColumn-date2-year:"2019" country:"USA" date:"2020-01-01" date2:"2019-04-01"
            └── LEAF id:1 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-HierarchyColumn-date2-year:"2018" country:"UK" date:"2021-06-15" date2:"2018-09-20"
        `);
        await asyncSetTimeout(0);

        api.applyColumnState({
            state: [
                { colId: 'date', rowGroupIndex: 0 },
                { colId: 'country', rowGroupIndex: 1 },
                { colId: 'date2', rowGroupIndex: 2 },
            ],
            applyOrder: true,
        });
        await new GridColumns(
            api,
            `applyColumnState row-group ordering sorts mixed hierarchy + plain cols correctly after applyColumnState`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year "Date (Year)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month "Date (Month)" width:200
            ├── ag-Grid-AutoColumn-date "Date" width:200
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year "Date2 (Year)" width:200
            ├── ag-Grid-AutoColumn-date2 "Date2" width:200
            ├── date "Date" width:200 rowGroup
            ├── country "Country" width:200 rowGroup
            └── date2 "Date2" width:200 rowGroup
        `);
        await new GridRows(
            api,
            `applyColumnState row-group ordering sorts mixed hierarchy + plain cols correctly after applyColumnState`
        ).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            ├─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            │ └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:"1" ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            │ · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01 ag-Grid-AutoColumn-date:"2020-01-01" ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            │ · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-country-USA ag-Grid-AutoColumn-country:"USA" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            │ · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-country-USA-ag-Grid-HierarchyColumn-date2-year-2019 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:"2019" ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            │ · · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01-country-USA-ag-Grid-HierarchyColumn-date2-year-2019-date2-2019-04-01 ag-Grid-AutoColumn-date2:"2019-04-01" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            │ · · · · · └── LEAF hidden id:0 date:"2020-01-01" country:"USA" date2:"2019-04-01" ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" ag-Grid-HierarchyColumn-date2-year:"2019"
            └─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2021 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:null ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-AutoColumn-date:null ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15 ag-Grid-AutoColumn-date:"2021-06-15" ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-country-UK ag-Grid-AutoColumn-country:"UK" ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:null ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            · · · · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-country-UK-ag-Grid-HierarchyColumn-date2-year-2018 ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date2-year:"2018" ag-Grid-AutoColumn-date2:null ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            · · · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15-country-UK-ag-Grid-HierarchyColumn-date2-year-2018-date2-2018-09-20 ag-Grid-AutoColumn-date2:"2018-09-20" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date2-year:null
            · · · · · · └── LEAF hidden id:1 date:"2021-06-15" country:"UK" date2:"2018-09-20" ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-HierarchyColumn-date2-year:"2018"
        `);
        await asyncSetTimeout(0);

        // Each source's virtuals sort immediately before that source; the source groups + plain col
        // order by their rowGroupIndex (date group, then country, then date2 group).
        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
            'country',
            'ag-Grid-HierarchyColumn-date2-year',
            'date2',
        ]);
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

        await new GridColumns(api, 'hierarchy added at runtime').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200
            └── date "Date" width:200 rowGroup
        `);
        await new GridRows(api, 'rows after hierarchy added').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            └─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn:"2020" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · └─┬ filler id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-6 ag-Grid-AutoColumn:"6" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · └─┬ LEAF_GROUP id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-6-date-2020-06-15 ag-Grid-AutoColumn:"2020-06-15" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · · └── LEAF id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"6" country:"USA" date:"2020-06-15"
        `);
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

        await new GridColumns(api, 'hierarchy removed at runtime').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200
            └── date "Date" width:200 rowGroup
        `);
        await new GridRows(api, 'rows after hierarchy removed').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-date-2020-06-15 ag-Grid-AutoColumn:"2020-06-15"
            · └── LEAF id:0 country:"USA" date:"2020-06-15"
        `);
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

        await new GridColumns(api, 'hierarchy expanded year → year+month').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200
            └── date "Date" width:200 rowGroup
        `);
        await new GridRows(api, 'rows after hierarchy expanded').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            └─┬ filler collapsed id:row-group-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn:"2020" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · └─┬ filler collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-6 ag-Grid-AutoColumn:"6" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · └─┬ LEAF_GROUP collapsed hidden id:row-group-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-6-date-2020-06-15 ag-Grid-AutoColumn:"2020-06-15" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · · └── LEAF hidden id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"6" country:"USA" date:"2020-06-15"
        `);
    });

    test('getPivotResultColumns() returns null when pivot mode is off', async () => {
        const api = gridsManager.createGrid('pivotOff', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }, { field: 'gold', aggFunc: 'sum' }],
            rowData: [{ country: 'USA', sport: 'Swim', gold: 5 }],
        });
        await asyncSetTimeout(0);

        const cols = api.getPivotResultColumns();
        expect(cols == null || cols.length === 0).toBe(true);

        await new GridColumns(api, 'pivot mode off — no pivot result cols').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200 rowGroup
            ├── sport "Sport" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);
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

        await new GridColumns(api, 'after pivotMode → false').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── athlete "Athlete" width:200
            ├── country "Country" width:200 rowGroup
            ├── sport "Sport" width:200
            ├── date "Date" width:200 pivot
            └── total "Total" width:200 aggFunc:sum
        `);
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

        await new GridColumns(api, 'addRowGroupColumns duplicate is a no-op').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200
            └── date "Date" width:200 rowGroup
        `);
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

        await new GridColumns(api, 'multi-sort row-group: year → quarter → month → date').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year "Date (Year)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-quarter "Date (Quarter)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month "Date (Month)" width:200
            ├── ag-Grid-AutoColumn-date "Date" width:200
            ├── country "Country" width:200
            └── date "Date" width:200 rowGroup
        `);
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

        await new GridColumns(api, 'after ungroup + regroup of hierarchy source').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── country "Country" width:200
        `);
    });

    test('virtuals generated from a rowGroup source col are themselves rowGroupActive', async () => {
        const api = gridsManager.createGrid('hierarchyRowGroupActive', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'virtuals + source all carry rowGroup').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year "Date (Year)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month "Date (Month)" width:200
            ├── ag-Grid-AutoColumn-date "Date" width:200
            ├── country "Country" width:200
            └── date "Date" width:200 rowGroup
        `);

        const yearVirtual = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        const monthVirtual = api.getColumn('ag-Grid-HierarchyColumn-date-month')!;
        expect(yearVirtual).toBeDefined();
        expect(monthVirtual).toBeDefined();
        expect(api.getColumn('date')!.isRowGroupActive()).toBe(true);
        expect(yearVirtual.isRowGroupActive()).toBe(true);
        expect(monthVirtual.isRowGroupActive()).toBe(true);
    });

    test('every supported date-part valueGetter returns the expected value', async () => {
        const date = new Date(2020, 5, 15, 10, 30, 45); // 2020-06-15 10:30:45 (month index 5 = June)
        const api = gridsManager.createGrid('allDateParts', {
            columnDefs: [
                {
                    field: 'date',
                    enableRowGroup: true,
                    groupHierarchy: ['year', 'quarter', 'month', 'formattedMonth', 'day', 'hour', 'minute', 'second'],
                },
            ],
            rowData: [{ date }],
        });
        await new GridColumns(api, `every supported date-part valueGetter returns the expected value setup`)
            .checkColumns(`
                CENTER
                └── date "Date" width:200
            `);
        await new GridRows(api, `every supported date-part valueGetter returns the expected value setup`).check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-quarter:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date-formattedMonth:null ag-Grid-HierarchyColumn-date-day:null ag-Grid-HierarchyColumn-date-hour:null ag-Grid-HierarchyColumn-date-minute:null ag-Grid-HierarchyColumn-date-second:null
            └── LEAF id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-quarter:"2" ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-HierarchyColumn-date-formattedMonth:"June" ag-Grid-HierarchyColumn-date-day:"15" ag-Grid-HierarchyColumn-date-hour:"10" ag-Grid-HierarchyColumn-date-minute:":30" ag-Grid-HierarchyColumn-date-second:":45" date:"2020-06-15"
        `);
        await asyncSetTimeout(0);

        const node = api.getRowNode('0')!;
        const valueOf = (part: string): unknown => {
            const col = api.getColumn(`ag-Grid-HierarchyColumn-date-${part}`)!;
            return api.getCellValue({ rowNode: node, colKey: col });
        };
        expect(valueOf('year')).toBe('2020');
        expect(valueOf('quarter')).toBe('2');
        expect(valueOf('month')).toBe('6'); // 1-indexed (matches user expectation in date pickers)
        expect(valueOf('formattedMonth')).toBe('June');
        expect(valueOf('day')).toBe('15');
        expect(valueOf('hour')).toBe('10');
        // Minute/second are prefixed (e.g. ':30', ':45') in the format the canonical valueGetter
        // produces — they're meant to be combined with the hour above them in the hierarchy.
        expect(valueOf('minute')).toBe(':30');
        expect(valueOf('second')).toBe(':45');
        await new GridRows(api, `every supported date-part valueGetter returns the expected value final state`).check(
            `
                ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-quarter:null ag-Grid-HierarchyColumn-date-month:null ag-Grid-HierarchyColumn-date-formattedMonth:null ag-Grid-HierarchyColumn-date-day:null ag-Grid-HierarchyColumn-date-hour:null ag-Grid-HierarchyColumn-date-minute:null ag-Grid-HierarchyColumn-date-second:null
                └── LEAF id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-quarter:"2" ag-Grid-HierarchyColumn-date-month:"6" ag-Grid-HierarchyColumn-date-formattedMonth:"June" ag-Grid-HierarchyColumn-date-day:"15" ag-Grid-HierarchyColumn-date-hour:"10" ag-Grid-HierarchyColumn-date-minute:":30" ag-Grid-HierarchyColumn-date-second:":45" date:"2020-06-15"
            `
        );
    });

    test('groupHierarchyConfig overrides headerName for a canonical part', async () => {
        const api = gridsManager.createGrid('hierarchyConfigOverride', {
            columnDefs: [{ field: 'date', enableRowGroup: true, groupHierarchy: ['year'] }],
            rowData: [{ date: new Date(2020, 5, 15) }],
            groupHierarchyConfig: {
                year: { headerName: 'YR' },
            },
        });
        await asyncSetTimeout(0);

        const yearVirtual = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        expect(yearVirtual.getColDef().headerName).toBe('YR');

        await new GridColumns(api, 'groupHierarchyConfig overrides headerName').checkColumns(`
            CENTER
            └── date "Date" width:200
        `);
    });

    test('inline ColDef hierarchy part materialises only when it has an explicit colId', async () => {
        const api = gridsManager.createGrid('hierarchyInlineColDef', {
            columnDefs: [
                {
                    field: 'date',
                    enableRowGroup: true,
                    // First inline part has a colId → materialises. Second lacks a colId → dropped.
                    groupHierarchy: [
                        { colId: 'date-decade', headerName: 'Decade', valueGetter: () => '2020s' },
                        { headerName: 'No Id', valueGetter: () => 'x' },
                    ],
                },
            ],
            rowData: [{ date: new Date(2020, 5, 15) }],
        });
        await asyncSetTimeout(0);

        const decadeCol = api.getColumn('date-decade')!;
        expect(decadeCol).toBeDefined();
        expect(decadeCol.getColDef().headerName).toBe('Decade');

        // The colId-less inline part produced no virtual: only date-decade + the source remain.
        await new GridColumns(api, 'inline ColDef hierarchy part with explicit colId').checkColumns(`
            CENTER
            ├── date-decade "Decade" width:200
            └── date "Date" width:200
        `);
    });

    test('hierarchy virtuals stay hidden when source col is un-row-grouped', async () => {
        const api = gridsManager.createGrid('hierarchyVisibilityOnUngroup', {
            columnDefs: [{ field: 'country' }, { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] }],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
        });
        await asyncSetTimeout(0);

        const yearVirtual = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        const monthVirtual = api.getColumn('ag-Grid-HierarchyColumn-date-month')!;
        expect(yearVirtual.isVisible()).toBe(false);
        expect(monthVirtual.isVisible()).toBe(false);

        api.setRowGroupColumns([]);
        await asyncSetTimeout(0);

        expect(api.getColumn('date')!.isVisible()).toBe(true);
        expect(yearVirtual.isVisible()).toBe(false);
        expect(monthVirtual.isVisible()).toBe(false);

        await new GridColumns(api, 'after un-row-group — virtuals stay hidden').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── date "Date" width:200
        `);
    });

    test('setRowGroupColumns adding a hierarchy col to an existing group keeps rowGroupActiveIndex in order', async () => {
        // singleColumn display => the auto-group column count does NOT change when a second row-group
        // level is added, so no auto-col-driven colDef rebuild is forced. This isolates the
        // setColList re-stamp path: onColumnsChanged stamps rowGroupActiveIndex BEFORE setColActive
        // splices the date col's virtuals into the list.
        const api = gridsManager.createGrid('setRowGroupHierarchyIndexSingle', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
            ],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
        });
        await asyncSetTimeout(0);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country']);

        api.setRowGroupColumns(['country', 'date']);
        await asyncSetTimeout(0);

        expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual([
            'country',
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
        ]);

        const stateById = new Map(api.getColumnState().map((s) => [s.colId, s.rowGroupIndex]));
        expect(stateById.get('country')).toBe(0);
        expect(stateById.get('ag-Grid-HierarchyColumn-date-year')).toBe(1);
        expect(stateById.get('ag-Grid-HierarchyColumn-date-month')).toBe(2);
        expect(stateById.get('date')).toBe(3);

        await new GridColumns(api, 'columns after setRowGroupColumns with hierarchy').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── country "Country" width:200 rowGroup
        `);
        await new GridRows(api, 'rows after setRowGroupColumns with hierarchy').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            ├─┬ filler collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ └─┬ filler collapsed hidden id:row-group-country-USA-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn:"2020" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ · └─┬ filler collapsed hidden id:row-group-country-USA-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1 ag-Grid-AutoColumn:"1" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-USA-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01 ag-Grid-AutoColumn:"2020-01-01" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ · · · └── LEAF hidden id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" country:"USA" date:"2020-01-01"
            └─┬ filler collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · └─┬ filler collapsed hidden id:row-group-country-UK-ag-Grid-HierarchyColumn-date-year-2021 ag-Grid-AutoColumn:"2021" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · └─┬ filler collapsed hidden id:row-group-country-UK-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6 ag-Grid-AutoColumn:"6" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-UK-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15 ag-Grid-AutoColumn:"2021-06-15" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · · · └── LEAF hidden id:1 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" country:"UK" date:"2021-06-15"
        `);
    });

    test('setRowGroupColumns adding a hierarchy col keeps rowGroupActiveIndex in order with suppressGroupChangesColumnVisibility', async () => {
        const api = gridsManager.createGrid('setRowGroupHierarchyIndexSuppressed', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'month'] },
            ],
            suppressGroupChangesColumnVisibility: true,
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1) },
                { country: 'UK', date: new Date(2021, 5, 15) },
            ],
        });
        await asyncSetTimeout(0);

        api.setRowGroupColumns(['country', 'date']);
        await asyncSetTimeout(0);

        const stateById = new Map(api.getColumnState().map((s) => [s.colId, s.rowGroupIndex]));
        expect(stateById.get('country')).toBe(0);
        expect(stateById.get('ag-Grid-HierarchyColumn-date-year')).toBe(1);
        expect(stateById.get('ag-Grid-HierarchyColumn-date-month')).toBe(2);
        expect(stateById.get('date')).toBe(3);

        await new GridColumns(api, 'suppress: columns after setRowGroupColumns with hierarchy').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200 rowGroup
            └── date "Date" width:200 rowGroup
        `);
        await new GridRows(api, 'suppress: rows after setRowGroupColumns with hierarchy').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            ├─┬ filler collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ └─┬ filler collapsed hidden id:row-group-country-USA-ag-Grid-HierarchyColumn-date-year-2020 ag-Grid-AutoColumn:"2020" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ · └─┬ filler collapsed hidden id:row-group-country-USA-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1 ag-Grid-AutoColumn:"1" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-USA-ag-Grid-HierarchyColumn-date-year-2020-ag-Grid-HierarchyColumn-date-month-1-date-2020-01-01 ag-Grid-AutoColumn:"2020-01-01" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            │ · · · └── LEAF hidden id:0 ag-Grid-HierarchyColumn-date-year:"2020" ag-Grid-HierarchyColumn-date-month:"1" country:"USA" date:"2020-01-01"
            └─┬ filler collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · └─┬ filler collapsed hidden id:row-group-country-UK-ag-Grid-HierarchyColumn-date-year-2021 ag-Grid-AutoColumn:"2021" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · └─┬ filler collapsed hidden id:row-group-country-UK-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6 ag-Grid-AutoColumn:"6" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · · └─┬ LEAF_GROUP collapsed hidden id:row-group-country-UK-ag-Grid-HierarchyColumn-date-year-2021-ag-Grid-HierarchyColumn-date-month-6-date-2021-06-15 ag-Grid-AutoColumn:"2021-06-15" ag-Grid-HierarchyColumn-date-year:null ag-Grid-HierarchyColumn-date-month:null
            · · · · └── LEAF hidden id:1 ag-Grid-HierarchyColumn-date-year:"2021" ag-Grid-HierarchyColumn-date-month:"6" country:"UK" date:"2021-06-15"
        `);
    });

    test('setPivotColumns adding a hierarchy col to an existing pivot keeps pivotActiveIndex in order', async () => {
        const api = gridsManager.createGrid('setPivotHierarchyIndex', {
            pivotMode: true,
            columnDefs: [
                { field: 'country', pivot: true },
                { field: 'date', enablePivot: true, groupHierarchy: ['year', 'month'] },
                { field: 'val', aggFunc: 'sum' },
            ],
            rowData: [
                { country: 'USA', date: new Date(2020, 0, 1), val: 1 },
                { country: 'UK', date: new Date(2021, 5, 15), val: 2 },
            ],
        });
        await asyncSetTimeout(0);

        expect(api.getPivotColumns().map((c) => c.getColId())).toEqual(['country']);

        api.setPivotColumns(['country', 'date']);
        await asyncSetTimeout(0);

        expect(api.getPivotColumns().map((c) => c.getColId())).toEqual([
            'country',
            'ag-Grid-HierarchyColumn-date-year',
            'ag-Grid-HierarchyColumn-date-month',
            'date',
        ]);

        const stateById = new Map(api.getColumnState().map((s) => [s.colId, s.pivotIndex]));
        expect(stateById.get('country')).toBe(0);
        expect(stateById.get('ag-Grid-HierarchyColumn-date-year')).toBe(1);
        expect(stateById.get('ag-Grid-HierarchyColumn-date-month')).toBe(2);
        expect(stateById.get('date')).toBe(3);

        await new GridColumns(api, 'columns after setPivotColumns with hierarchy').checkColumns(`
            CENTER
            ├─┬ "UK" GROUP closed
            │ ├─┬ "2021" GROUP closed hidden
            │ │ ├─┬ "6" GROUP closed hidden
            │ │ │ ├─┬ "2021-06-15" GROUP hidden
            │ │ │ │ └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6-2021-06-15_val "Val" width:200 columnGroupShow:open hidden
            │ │ │ └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6_val "Val" width:200 columnGroupShow:closed hidden
            │ │ └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021_val "Val" width:200 columnGroupShow:closed hidden
            │ └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK_val "Val" width:200 columnGroupShow:closed
            └─┬ "USA" GROUP closed
              ├─┬ "2020" GROUP closed hidden
              │ ├─┬ "1" GROUP closed hidden
              │ │ ├─┬ "2020-01-01" GROUP hidden
              │ │ │ └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1-2020-01-01_val "Val" width:200 columnGroupShow:open hidden
              │ │ └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1_val "Val" width:200 columnGroupShow:closed hidden
              │ └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020_val "Val" width:200 columnGroupShow:closed hidden
              └── pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA_val "Val" width:200 columnGroupShow:closed
        `);
        await new GridRows(api, 'rows after setPivotColumns with hierarchy').check(`
            ROOT id:ROOT_NODE_ID pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6-2021-06-15_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1-2020-01-01_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA_val:1
            ROOT id:ROOT_NODE_ID pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6-2021-06-15_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1-2020-01-01_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA_val:1
            ├── LEAF hidden id:0 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6-2021-06-15_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1-2020-01-01_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020_val:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA_val:1
            └── LEAF hidden id:1 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6-2021-06-15_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021-6_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK-2021_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_UK_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1-2020-01-01_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020-1_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA-2020_val:2 pivot_country-ag-Grid-HierarchyColumn-date-year-ag-Grid-HierarchyColumn-date-month-date_USA_val:2
        `);
    });

    test('unrecognised string parts in groupHierarchy are silently dropped', async () => {
        // The unrecognised 'bogus' part legitimately warns — silence the noise and assert it fires.
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        const api = gridsManager.createGrid('unknownHierarchyPart', {
            columnDefs: [
                { field: 'country' },
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year', 'bogus' as any, 'month'] },
            ],
            rowData: [{ country: 'USA', date: new Date(2020, 5, 15) }],
        });
        await asyncSetTimeout(0);
        expect(consoleWarnSpy.mock.calls[0].join(' ')).toContain('not recognised');
        consoleWarnSpy.mockRestore();

        // year + month virtuals exist; 'bogus' was filtered out and produced no virtual.
        expect(api.getColumn('ag-Grid-HierarchyColumn-date-year')).not.toBeNull();
        expect(api.getColumn('ag-Grid-HierarchyColumn-date-month')).not.toBeNull();
        expect(api.getColumn('ag-Grid-HierarchyColumn-date-bogus')).toBeNull();

        await new GridColumns(api, 'unrecognised hierarchy part dropped').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── date "Date" width:200
        `);
    });

    test('hierarchy columns coexist with grouped column headers (depth > 0)', async () => {
        const api = gridsManager.createGrid('hierarchyWithColGroups', {
            columnDefs: [
                {
                    headerName: 'Group A',
                    children: [{ field: 'country' }, { field: 'sport' }],
                },
                {
                    headerName: 'Group B',
                    children: [
                        { field: 'date', rowGroup: true, groupHierarchy: ['year', 'month'] },
                        { field: 'total' },
                    ],
                },
            ],
            rowData: [
                { country: 'USA', sport: 'Swimming', date: new Date(2020, 0, 1), total: 1 },
                { country: 'UK', sport: 'Running', date: new Date(2021, 5, 15), total: 2 },
            ],
            groupDisplayType: 'multipleColumns',
        });
        await asyncSetTimeout(0);

        const hierarchyIds = api
            .getAllGridColumns()
            .map((c) => c.getColId())
            .filter((id) => id.startsWith('ag-Grid-HierarchyColumn-date'));
        expect(hierarchyIds).toEqual(['ag-Grid-HierarchyColumn-date-year', 'ag-Grid-HierarchyColumn-date-month']);

        await new GridColumns(api, 'hierarchy cols with grouped column headers').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-year "Date (Year)" width:200
            ├── ag-Grid-AutoColumn-ag-Grid-HierarchyColumn-date-month "Date (Month)" width:200
            ├── ag-Grid-AutoColumn-date "Date" width:200
            ├─┬ "Group A" GROUP
            │ ├── country "Country" width:200
            │ └── sport "Sport" width:200
            └─┬ "Group B" GROUP
              ├── date "Date" width:200 rowGroup
              └── total "Total" width:200
        `);
    });

    test('hierarchy cols inherit enablePivot from their source col so they stay draggable to pivot', async () => {
        const api = gridsManager.createGrid('hierarchyEnablePivot', {
            columnDefs: [
                { field: 'date', enablePivot: true, groupHierarchy: ['year', 'month'] },
                { field: 'total', aggFunc: 'sum' },
            ],
            rowData: [{ date: new Date(2020, 0, 1), total: 1 }],
        });
        await asyncSetTimeout(0);

        const yearCol = api.getColumn('ag-Grid-HierarchyColumn-date-year')!;
        const monthCol = api.getColumn('ag-Grid-HierarchyColumn-date-month')!;
        expect(yearCol).toBeTruthy();
        expect(monthCol).toBeTruthy();
        // enablePivot on the source col propagates to its generated hierarchy cols.
        expect(yearCol.isAllowPivot()).toBe(true);
        expect(monthCol.isAllowPivot()).toBe(true);
    });

    test('hierarchy cols are not pivotable when the source col is not enablePivot', async () => {
        const api = gridsManager.createGrid('hierarchyNoPivot', {
            columnDefs: [
                { field: 'date', enableRowGroup: true, groupHierarchy: ['year'] },
                { field: 'total', aggFunc: 'sum' },
            ],
            rowData: [{ date: new Date(2020, 0, 1), total: 1 }],
        });
        await asyncSetTimeout(0);

        expect(api.getColumn('ag-Grid-HierarchyColumn-date-year')!.isAllowPivot()).toBe(false);
    });
});
