import { vi } from 'vitest';

import type { ColDef, GridApi, GridOptions, Module } from 'ag-grid-community';
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
        return gridsManager.createGrid(id, {
            getRowId: (params) => params.data?.id,
            calculatedColumns: true,
            ...opts,
        });
    }

    function addCalculatedColumnDef(api: GridApi, colDef: ColDef): void {
        api.setGridOption('columnDefs', [...(api.getColumnDefs() ?? []), colDef]);
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

    test('calc col is gated by an active pivot column, not by enablePivot or pivot mode alone', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('pivot-enabled-runtime-toggle', {
            defaultColDef: { enablePivot: true, enableRowGroup: true, enableValue: true },
            rowData,
            columnDefs: [
                { field: 'country' },
                { field: 'year' },
                { field: 'revenue', aggFunc: 'sum' },
                { field: 'cost', aggFunc: 'sum' },
                { colId: 'profit', calculatedExpression: '[revenue] - [cost]', cellDataType: 'number' },
            ],
        });
        const profit = () =>
            api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'profit', useFormatter: false });
        await asyncSetTimeout(10);

        // enablePivot only allows pivoting; with no active pivot column the calc col evaluates.
        expect(profit()).toBe(7);
        expect(warn).not.toHaveBeenCalled();

        // Turning pivot mode on without assigning a pivot column does not activate a pivot.
        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(10);
        expect(profit()).toBe(7);
        expect(warn).not.toHaveBeenCalled();

        // Assigning a pivot column at runtime activates the pivot, so the calc col is turned off
        // (warning 295) while remaining a resolvable primary column.
        api.applyColumnState({ state: [{ colId: 'country', pivot: true }] });
        await asyncSetTimeout(10);
        expect(warn).toHaveBeenCalled();
        expect(api.getColumn('profit')).toBeTruthy();

        // Removing the pivot column re-enables calc evaluation.
        warn.mockClear();
        api.applyColumnState({ state: [{ colId: 'country', pivot: false }] });
        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(10);
        expect(profit()).toBe(7);
        expect(warn).not.toHaveBeenCalled();
    });

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

    test('addCalculatedColumn while pivot active keeps the pivot result intact', async () => {
        const api = createGrid('pivot-add-calc', {
            rowData,
            columnDefs: pivotColumnDefs,
            pivotMode: true,
        });
        await asyncSetTimeout(10);
        const before = order(api);

        addCalculatedColumnDef(api, {
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

    test('calc col referencing a pivot result column id does not read it on a leaf', async () => {
        // warning 295 is expected — the calc col is blocked by the active pivot.
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('pivot-calc-refs-pivot-col', {
            rowData,
            columnDefs: [
                ...pivotColumnDefs,
                {
                    colId: 'doubled',
                    calculatedExpression: '[pivot_year_2020_revenue] * 2',
                    cellDataType: 'number',
                },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);

        const doubledOf = (id: string) =>
            api.getCellValue({ rowNode: api.getRowNode(id)!, colKey: 'doubled', useFormatter: false });

        expect(doubledOf('r1')).toBeUndefined();
        expect(warn).toHaveBeenCalled();
        warn.mockRestore();
    });
});
