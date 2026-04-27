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
});
