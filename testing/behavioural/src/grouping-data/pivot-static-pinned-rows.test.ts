import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

describe('pivot mode with static pinned rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, PinnedRowModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = [
        { country: 'Ireland', year: 2020, sales: 1000 },
        { country: 'Ireland', year: 2021, sales: 1200 },
        { country: 'USA', year: 2020, sales: 2000 },
        { country: 'USA', year: 2021, sales: 2200 },
    ];

    const baseGridOptions: GridOptions = {
        columnDefs: [
            { field: 'country', rowGroup: true, hide: true },
            { field: 'year', pivot: true, hide: true },
            { field: 'sales', aggFunc: 'sum', hide: true },
        ],
        pivotMode: true,
        groupDefaultExpanded: -1,
    };

    const gridRowsOptions: GridRowsOptions = {
        forcedColumns: ['pivot_year_2020_sales', 'pivot_year_2021_sales'],
        printHiddenRows: false,
    };

    /** Builds a pinned row data object keyed by pivot result column field names. */
    function buildPinnedRowData(api: GridApi, value: number): Record<string, number> {
        const data: Record<string, number> = {};
        for (const col of api.getPivotResultColumns() ?? []) {
            data[col.getColDef().field ?? ''] = value;
        }
        return data;
    }

    test('pinnedTopRowData values are shown in pivot mode columns', async () => {
        const api = gridsManager.createGrid('myGrid', baseGridOptions);
        applyTransactionChecked(api, { add: rowData });

        api.setGridOption('pinnedTopRowData', [buildPinnedRowData(api, 999)]);

        // Verify the grid structure and group row aggregations are correct
        await new GridRows(api, 'with pinned top row', gridRowsOptions).check(`
            PINNED_TOP id:t-0 pivot_year_2020_sales:999 pivot_year_2021_sales:999
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:3000 pivot_year_2021_sales:3400
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
            └── LEAF_GROUP collapsed id:row-group-country-USA pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
        `);

        // Verify getCellValue returns the pinned row data values via the pivot column's value getter,
        // not undefined (which would happen if valueService incorrectly redirects to the underlying
        // value column for non-group rows, losing the pivot column's field-based lookup).
        const pinnedRow = api.getPinnedTopRow(0)!;
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2020_sales', useFormatter: false })).toBe(
            999
        );
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2021_sales', useFormatter: false })).toBe(
            999
        );
    });

    test('pinnedBottomRowData values are shown in pivot mode columns', async () => {
        const api = gridsManager.createGrid('myGrid', baseGridOptions);
        applyTransactionChecked(api, { add: rowData });

        api.setGridOption('pinnedBottomRowData', [buildPinnedRowData(api, 888)]);

        // Verify the grid structure and group row aggregations are correct
        await new GridRows(api, 'with pinned bottom row', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:3000 pivot_year_2021_sales:3400
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
            └── LEAF_GROUP collapsed id:row-group-country-USA pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
            PINNED_BOTTOM id:b-0 pivot_year_2020_sales:888 pivot_year_2021_sales:888
        `);

        // Verify getCellValue returns the pinned row data values via the pivot column's value getter,
        // not undefined (which would happen if valueService incorrectly redirects to the underlying
        // value column for non-group rows, losing the pivot column's field-based lookup).
        const pinnedRow = api.getPinnedBottomRow(0)!;
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2020_sales', useFormatter: false })).toBe(
            888
        );
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2021_sales', useFormatter: false })).toBe(
            888
        );
    });

    test('setDataValue on pinnedTopRow updates the correct pivot column key', async () => {
        const api = gridsManager.createGrid('myGrid', baseGridOptions);
        applyTransactionChecked(api, { add: rowData });

        api.setGridOption('pinnedTopRowData', [buildPinnedRowData(api, 999)]);

        const pinnedRow = api.getPinnedTopRow(0)!;

        // Update one pivot column value via setDataValue
        pinnedRow.setDataValue('pivot_year_2020_sales', 500);

        // Verify getCellValue reflects the updated value, not undefined (which would happen if
        // setDataValue incorrectly redirects to the underlying value column and sets data['sales']
        // instead of data['pivot_year_2020_sales']).
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2020_sales', useFormatter: false })).toBe(
            500
        );
        // The other pivot column should be unchanged
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2021_sales', useFormatter: false })).toBe(
            999
        );

        await new GridRows(api, 'after setDataValue on pinned top row', gridRowsOptions).check(`
            PINNED_TOP id:t-0 pivot_year_2020_sales:500 pivot_year_2021_sales:999
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:3000 pivot_year_2021_sales:3400
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
            └── LEAF_GROUP collapsed id:row-group-country-USA pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
        `);
    });

    test('setDataValue on pinnedBottomRow updates the correct pivot column key', async () => {
        const api = gridsManager.createGrid('myGrid', baseGridOptions);
        applyTransactionChecked(api, { add: rowData });

        api.setGridOption('pinnedBottomRowData', [buildPinnedRowData(api, 888)]);

        const pinnedRow = api.getPinnedBottomRow(0)!;

        // Update one pivot column value via setDataValue
        pinnedRow.setDataValue('pivot_year_2021_sales', 777);

        // Verify getCellValue reflects the updated value, not undefined (which would happen if
        // setDataValue incorrectly redirects to the underlying value column and sets data['sales']
        // instead of data['pivot_year_2021_sales']).
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2020_sales', useFormatter: false })).toBe(
            888
        );
        // The updated pivot column should reflect the new value
        expect(api.getCellValue({ rowNode: pinnedRow, colKey: 'pivot_year_2021_sales', useFormatter: false })).toBe(
            777
        );

        await new GridRows(api, 'after setDataValue on pinned bottom row', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:3000 pivot_year_2021_sales:3400
            ├── LEAF_GROUP collapsed id:row-group-country-Ireland pivot_year_2020_sales:1000 pivot_year_2021_sales:1200
            └── LEAF_GROUP collapsed id:row-group-country-USA pivot_year_2020_sales:2000 pivot_year_2021_sales:2200
            PINNED_BOTTOM id:b-0 pivot_year_2020_sales:888 pivot_year_2021_sales:777
        `);
    });
});
