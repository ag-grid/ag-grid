import { vi } from 'vitest';

import type { GridApi, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { CalculatedColumnsModule, FormulaModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, TestGridsManager, asyncSetTimeout } from '../test-utils';

// Characterization of calculated-column behaviour in PIVOT mode. These lock in the CURRENT behaviour
// so the one-tree collapse (which re-runs the whole tree build on every pivot change) can be verified
// to preserve it. Pivot has a distinct flow: colsList = pivot result cols, while the calc col lives
// in the primary tree (colDefList) and surfaces alongside the pivot result.

describe('calculated columns - pivot mode', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CalculatedColumnsModule,
            FormulaModule,
            PivotModule,
            RowGroupingModule,
            ValidationModule,
        ] as Module[],
    });

    beforeEach(() => gridsManager.reset());
    afterEach(() => gridsManager.reset());

    function createGrid(id: string, opts: Partial<GridOptions>): GridApi {
        return gridsManager.createGrid(id, { getRowId: (params) => params.data?.id, ...opts });
    }

    function order(api: GridApi): string[] {
        return api.getAllGridColumns()!.map((col) => col.getColId());
    }

    const rowData = [
        { id: 'r1', country: 'US', year: 2020, revenue: 10, cost: 3 },
        { id: 'r2', country: 'UK', year: 2020, revenue: 20, cost: 5 },
        { id: 'r3', country: 'US', year: 2021, revenue: 15, cost: 4 },
    ];

    const pivotColumnDefs = [
        { field: 'country', rowGroup: true, hide: true },
        { field: 'year', pivot: true },
        { field: 'revenue', aggFunc: 'sum' },
        { field: 'cost', aggFunc: 'sum' },
    ];

    test('calc col is absent from the pivot display but remains a resolvable primary column', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 295: expected — calc col blocked by pivot
        const api = createGrid('pivot-static-calc', {
            rowData,
            columnDefs: [
                ...pivotColumnDefs,
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);

        // A calc col is a primary (non-value) column, so the pivot cross-tab has no cell for it: it is
        // NOT shown in the pivot display — consistent with every other primary column that isn't a
        // pivot result. It stays a real, resolvable column and reappears when pivot is turned off.
        expect(api.getColumn('profit')).toBeTruthy();
        await new GridColumns(api, 'pivot: calc col absent from display').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "2020" GROUP
            │ ├── pivot_year_2020_revenue "Revenue" width:200 columnGroupShow:open
            │ └── pivot_year_2020_cost "Cost" width:200 columnGroupShow:open
            └─┬ "2021" GROUP
              ├── pivot_year_2021_revenue "Revenue" width:200 columnGroupShow:open
              └── pivot_year_2021_cost "Cost" width:200 columnGroupShow:open
        `);
    });

    // Solved by AG-17366 when it is completed
    test.skip('addCalculatedColumn while pivot active keeps the pivot result intact', async () => {
        const api = createGrid('pivot-add-calc', {
            rowData,
            columnDefs: pivotColumnDefs,
            pivotMode: true,
        });
        await asyncSetTimeout(10);
        const before = order(api);

        api.addCalculatedColumn({
            colId: 'profit',
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'number',
        });
        await asyncSetTimeout(10);

        expect(api.getColumn('profit')).toBeTruthy();
        // Pivot result cols + auto-group col are all still present after the calc-col add.
        for (const id of before) {
            expect(order(api)).toContain(id);
        }
    });

    test('pivot mode off then on restores the calc col among the primary cols', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 295: expected — calc col blocked by pivot
        const api = createGrid('pivot-toggle', {
            rowData,
            columnDefs: [
                ...pivotColumnDefs,
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);
        expect(api.getColumn('profit')).toBeTruthy();

        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(10);
        // Out of pivot mode, the primary tree is the display tree: the auto-group col (country is
        // rowGroup+hide), the `year` pivot col (visible when pivot is inactive), the value cols, and
        // the calc col.
        await new GridColumns(api, 'pivot off: primary tree with calc col').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── year "Year" width:200 pivot
            ├── revenue "Revenue" width:200 aggFunc:sum
            ├── cost "Cost" width:200 aggFunc:sum
            └── profit width:200
        `);

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(10);
        // Back in pivot mode the calc col is still resolvable and the pivot result is rebuilt.
        expect(api.getColumn('profit')).toBeTruthy();
        expect(order(api).some((c) => c.startsWith('pivot_year_2020'))).toBe(true);
    });
});
