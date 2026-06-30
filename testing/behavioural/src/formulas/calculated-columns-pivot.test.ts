import { _doOnce } from 'ag-stack';
import { vi } from 'vitest';

import type { ColDef, GridApi, GridOptions, Module } from 'ag-grid-community';
import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { CalculatedColumnsModule, FormulaModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

// Calculated-column behaviour in PIVOT mode. A calculated column stays active under pivot, evaluating
// against the primary columns on leaf rows, and works in every pivot role: as a non-value primary column
// (no aggFunc → no result column), as a pivot value (aggFunc → per-leaf values aggregate into result
// columns like a valueGetter), and as a pivot dimension (its per-leaf formula result is the pivot key).

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

    beforeEach(() => {
        gridsManager.reset();
        (_doOnce as unknown as { _set: Set<string> })._set.clear();
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

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

    test('calc col stays active under an active pivot and remains a resolvable primary column', async () => {
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

        // Assigning a pivot column at runtime activates the pivot. The calc col (no aggFunc, not the pivot
        // dimension) stays active: it keeps evaluating against the primary columns on leaf rows.
        api.applyColumnState({ state: [{ colId: 'country', pivot: true }] });
        await asyncSetTimeout(10);
        expect(profit()).toBe(7);
        expect(warn).not.toHaveBeenCalled();
        expect(api.getColumn('profit')).toBeTruthy();

        // Removing the pivot column leaves calc evaluation unchanged.
        api.applyColumnState({ state: [{ colId: 'country', pivot: false }] });
        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(10);
        expect(profit()).toBe(7);
        expect(warn).not.toHaveBeenCalled();
    });

    test('calc col is absent from the pivot display but remains a resolvable primary column', async () => {
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

    test('calculated value column in pivot mode produces no incompatibility or validation warnings', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        createGrid('pivot-calc-warning-text', {
            rowData: [
                { id: 'r1', country: 'US', year: 2020, gold: 1, silver: 2 },
                { id: 'r2', country: 'UK', year: 2020, gold: 3, silver: 4 },
                { id: 'r3', country: 'US', year: 2021, gold: 5, silver: 6 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                {
                    colId: 'calc',
                    headerName: 'Calc',
                    aggFunc: 'sum',
                    calculatedExpression: '[gold]+[silver]',
                },
                {
                    headerName: 'VG',
                    aggFunc: 'sum',
                    valueGetter: (params) => params.data?.gold + params.data?.silver,
                },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);

        // A calc value column aggregates under pivot like a valueGetter column, so no incompatibility or
        // validation warning fires at all (the old "not supported with Column Pivoting", misleading
        // allowFormula, and value-source messages are all gone).
        expect(warn).not.toHaveBeenCalled();
    });

    test('calc value column aggregates like a valueGetter under a runtime-activated pivot, no warnings', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('pivot-tc2-runtime', {
            rowData: [
                { id: 'r1', country: 'US', year: 2020, gold: 1, silver: 2 },
                { id: 'r2', country: 'US', year: 2021, gold: 3, silver: 4 },
            ],
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year' },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
                { colId: 'calc', aggFunc: 'sum', calculatedExpression: '[gold] + [silver]', cellDataType: 'number' },
                {
                    colId: 'vg',
                    aggFunc: 'sum',
                    valueGetter: (p) => (p.data ? p.data.gold + p.data.silver : undefined),
                    cellDataType: 'number',
                },
            ],
        });
        await asyncSetTimeout(10);

        // Enable pivot mode and drag YEAR into the pivot at runtime (the column-tool-panel path).
        api.setGridOption('pivotMode', true);
        api.applyColumnState({ state: [{ colId: 'year', pivot: true }] });
        await asyncSetTimeout(10);

        // The calc value column's per-year pivot result aggregates its per-leaf (gold+silver), matching the
        // valueGetter column under every year — and no incompatibility/validation warning fires.
        await new GridRows(api, 'TC2 runtime pivot calc aggregates', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
            └─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
            · ├── LEAF hidden id:r1 pivot_year_2020_gold:1 pivot_year_2020_silver:2 pivot_year_2020_calc:3 pivot_year_2020_vg:3 pivot_year_2021_gold:1 pivot_year_2021_silver:2 pivot_year_2021_calc:3 pivot_year_2021_vg:3
            · └── LEAF hidden id:r2 pivot_year_2020_gold:3 pivot_year_2020_silver:4 pivot_year_2020_calc:7 pivot_year_2020_vg:7 pivot_year_2021_gold:3 pivot_year_2021_silver:4 pivot_year_2021_calc:7 pivot_year_2021_vg:7
        `);
        expect(warn).not.toHaveBeenCalled();
    });

    test('a calculated column can be a pivot dimension: its per-leaf formula result is the pivot key', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('pivot-by-calc', {
            rowData,
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'revenue', aggFunc: 'sum' },
                { colId: 'band', calculatedExpression: 'IF([revenue] > 12, "High", "Low")', pivot: true },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);

        // The calc col's per-leaf result (High/Low) is used as the pivot key, exactly like pivoting by a
        // valueGetter column: revenue aggregates into a result column per distinct band. No warning fires.
        await new GridColumns(api, 'pivot by calc col').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "High" GROUP
            │ └── pivot_band_High_revenue "Revenue" width:200 columnGroupShow:open
            └─┬ "Low" GROUP
              └── pivot_band_Low_revenue "Revenue" width:200 columnGroupShow:open
        `);
        // US has r1 (rev 10 → Low) and r3 (rev 15 → High); UK has r2 (rev 20 → High).
        await new GridRows(api, 'pivot by calc col values', { useFormatter: false }).check(`
            ROOT id:ROOT_NODE_ID pivot_band_High_revenue:35 pivot_band_Low_revenue:10
            ├─┬ LEAF_GROUP collapsed id:row-group-country-US ag-Grid-AutoColumn:"US" pivot_band_High_revenue:15 pivot_band_Low_revenue:10
            │ ├── LEAF hidden id:r1 pivot_band_High_revenue:10 pivot_band_Low_revenue:10
            │ └── LEAF hidden id:r3 pivot_band_High_revenue:15 pivot_band_Low_revenue:15
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_band_High_revenue:20 pivot_band_Low_revenue:null
            · └── LEAF hidden id:r2 pivot_band_High_revenue:20 pivot_band_Low_revenue:20
        `);
        expect(warn).not.toHaveBeenCalled();
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
            └── profit width:200 ƒ
        `);

        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(10);
        // Back in pivot mode the calc col is still resolvable and the pivot result is rebuilt.
        expect(api.getColumn('profit')).toBeTruthy();
        expect(order(api).some((c) => c.startsWith('pivot_year_2020'))).toBe(true);
    });

    test('calc col referencing primary columns evaluates on leaf rows under an active pivot', async () => {
        const api = createGrid('pivot-calc-primary-ref', {
            rowData,
            columnDefs: [
                ...pivotColumnDefs,
                {
                    colId: 'doubledRevenue',
                    calculatedExpression: '[revenue] * 2',
                    cellDataType: 'number',
                },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);

        expect(
            api.getCellValue({ rowNode: api.getRowNode('r1')!, colKey: 'doubledRevenue', useFormatter: false })
        ).toBe(20);
    });

    test('calc col referencing a pivot result column id is bucket-aware on leaves; blank on group rows', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('pivot-calc-result-ref', {
            rowData,
            columnDefs: [
                ...pivotColumnDefs,
                {
                    colId: 'ref2020',
                    calculatedExpression: '[pivot_year_2020_revenue]',
                    cellDataType: 'number',
                },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);

        const ref2020 = (id: string) =>
            api.getCellValue({ rowNode: api.getRowNode(id)!, colKey: 'ref2020', useFormatter: false });
        // Group rows have no data of their own, so the calc col stays blank there. On a leaf the reference
        // is its contribution to the 2020 bucket: a leaf in the bucket reads its source revenue (r1 = 10);
        // a leaf outside it (r3 is a 2021 row) is blank.
        expect(ref2020('row-group-country-US')).toBeUndefined();
        expect(ref2020('row-group-country-UK')).toBeUndefined();
        expect(ref2020('r1')).toBe(10);
        expect(ref2020('r3')).toBeUndefined();
        expect(warn).not.toHaveBeenCalled();
    });

    test('pivot result columns keep allowFormula from a non-calc source but drop calc fields for a calc source', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('pivot-result-allowformula', {
            rowData,
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', pivot: true },
                { field: 'revenue', aggFunc: 'sum', allowFormula: true },
                { colId: 'calc', aggFunc: 'sum', calculatedExpression: '[revenue]', cellDataType: 'number' },
            ],
            pivotMode: true,
        });
        await asyncSetTimeout(10);

        // The result column of an ordinary formula-enabled value column keeps allowFormula...
        expect(api.getColumn('pivot_year_2020_revenue')!.isAllowFormula()).toBe(true);
        // ...while the calc column's result column is a plain aggregation: no allowFormula, no expression.
        const calcResult = api.getColumn('pivot_year_2020_calc')!;
        expect(calcResult.isAllowFormula()).toBe(false);
        expect(calcResult.getColDef().calculatedExpression).toBeUndefined();

        // The calc source under Row Groups is unsupported, so #295 fires and turns its formula off —
        // the observable cause of the dropped calc fields asserted above.
        expect(warn).toHaveBeenCalledWith(
            'AG Grid: warning #295',
            expect.stringContaining('`colDef.allowFormula` is not supported with Row Groups'),
            expect.stringContaining('/errors/295')
        );
    });
});
