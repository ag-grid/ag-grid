import type { ColDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

describe('pivot column identity across columnDefs updates', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const olympicLikeRows = [
        { id: 1, country: 'Russia', sport: 'Gymnastics', year: 2008, gold: 3 },
        { id: 2, country: 'Russia', sport: 'Gymnastics', year: 2012, gold: 1 },
        { id: 3, country: 'USA', sport: 'Gymnastics', year: 2008, gold: 4 },
        { id: 4, country: 'USA', sport: 'Swimming', year: 2008, gold: 2 },
        { id: 5, country: 'USA', sport: 'Swimming', year: 2012, gold: 5 },
    ];

    const baseColumnDefs: ColDef[] = [
        { field: 'country', rowGroup: true },
        { field: 'sport', pivot: true },
        { field: 'year', pivot: true },
        { field: 'gold', aggFunc: 'sum' },
    ];

    type ColSnapshot = { colId: string; field: string | undefined };

    const snapshotCols = (cols: Column[] | null): ColSnapshot[] =>
        (cols ?? []).map((col) => ({
            colId: col.getColId(),
            field: col.getColDef().field,
        }));

    // Baseline pivot grid output for `baseColumnDefs` + `olympicLikeRows`. Reused
    // across tests since the round-trip / context update / direct mutation never
    // changes the rendered tree — only the colDef contents.
    const checkDefaultRows = (api: ReturnType<typeof gridsManager.createGrid>, label: string) =>
        new GridRows(api, label).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

    const checkDefaultCols = (api: ReturnType<typeof gridsManager.createGrid>, label: string) =>
        new GridColumns(api, label).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "Gymnastics" GROUP open
            │ ├─┬ "2008" GROUP
            │ │ └── pivot_sport-year_Gymnastics-2008_gold "Gold" width:200 columnGroupShow:open
            │ ├─┬ "2012" GROUP
            │ │ └── pivot_sport-year_Gymnastics-2012_gold "Gold" width:200 columnGroupShow:open
            │ └── pivot_sport-year_Gymnastics_gold "Gold" width:200 columnGroupShow:closed hidden
            └─┬ "Swimming" GROUP open
              ├─┬ "2008" GROUP
              │ └── pivot_sport-year_Swimming-2008_gold "Gold" width:200 columnGroupShow:open
              ├─┬ "2012" GROUP
              │ └── pivot_sport-year_Swimming-2012_gold "Gold" width:200 columnGroupShow:open
              └── pivot_sport-year_Swimming_gold "Gold" width:200 columnGroupShow:closed hidden
        `);

    test('setGridOption(columnDefs) preserves pivot result colIds and field/colId consistency', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before round-trip');
        await checkDefaultCols(api, 'cols before round-trip');

        const beforeIds = snapshotCols(api.getPivotResultColumns());
        expect(beforeIds.length).toBeGreaterThan(0);

        // Sanity: every pivot result colDef.field must equal its colId so that the
        // default valueGetter (which reads `params.data[params.colDef.field]`) finds
        // values keyed by colId.
        for (const { colId, field } of beforeIds) {
            expect(field).toBe(colId);
        }

        // Round-trip the same columnDefs reference. This re-fires colDefChanged on
        // primary cols, which triggers recreateColDef on every pivot result col.
        api.setGridOption('columnDefs', baseColumnDefs);

        const afterIds = snapshotCols(api.getPivotResultColumns());
        expect(afterIds).toEqual(beforeIds);

        for (const { colId, field } of afterIds) {
            expect(field).toBe(colId);
        }

        await checkDefaultRows(api, 'rows after round-trip');
        await checkDefaultCols(api, 'cols after round-trip');
    });

    test('setGridOption(columnDefs) preserves pivot total result colIds and field/colId consistency', async () => {
        // addExpandablePivotGroups creates "Total" cols with pivotTotalColumnIds set
        // but totalColumn=false. recreateColDef previously used !!pivotTotalColumnIds
        // to flip totalColumn=true on regeneration, breaking field consistency.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before round-trip (totals)');
        await checkDefaultCols(api, 'cols before round-trip (totals)');

        const beforeAll = api.getPivotResultColumns() ?? [];
        const totalColsBefore = beforeAll.filter((col) => col.getColDef().pivotTotalColumnIds !== undefined);
        expect(totalColsBefore.length).toBeGreaterThan(0);

        for (const col of totalColsBefore) {
            const def = col.getColDef();
            expect(def.field).toBe(col.getColId());
            expect(def.colId).toBe(col.getColId());
        }

        const beforeSnapshot = snapshotCols(beforeAll);

        api.setGridOption('columnDefs', baseColumnDefs);

        const afterAll = api.getPivotResultColumns() ?? [];
        expect(snapshotCols(afterAll)).toEqual(beforeSnapshot);

        const totalColsAfter = afterAll.filter((col) => col.getColDef().pivotTotalColumnIds !== undefined);
        expect(totalColsAfter.length).toBe(totalColsBefore.length);

        for (const col of totalColsAfter) {
            const def = col.getColDef();
            expect(def.field).toBe(col.getColId());
            expect(def.colId).toBe(col.getColId());
        }

        await checkDefaultRows(api, 'rows after round-trip (totals)');
        await checkDefaultCols(api, 'cols after round-trip (totals)');
    });

    test('setGridOption(columnDefs) preserves the pivot result Column instances', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before instance check');
        await checkDefaultCols(api, 'cols before instance check');

        const beforeCols = api.getPivotResultColumns() ?? [];
        expect(beforeCols.length).toBeGreaterThan(0);
        const beforeById = new Map(beforeCols.map((col) => [col.getColId(), col]));

        api.setGridOption('columnDefs', baseColumnDefs);

        const afterCols = api.getPivotResultColumns() ?? [];
        expect(afterCols.length).toBe(beforeCols.length);

        for (const col of afterCols) {
            expect(beforeById.get(col.getColId())).toBe(col);
        }

        await checkDefaultRows(api, 'rows after instance check');
        await checkDefaultCols(api, 'cols after instance check');
    });

    test('updated context on the value column propagates to pivot result colDefs', async () => {
        // Per-pivot-col customization should be applied via processPivotResultColDef
        // (which runs on every recreate). When set on the value column's colDef,
        // context flows through to all derived pivot result colDefs.
        const initialDefs: ColDef[] = [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'year', pivot: true },
            { field: 'gold', aggFunc: 'sum', context: { version: 1 } },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: initialDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before context update');
        await checkDefaultCols(api, 'cols before context update');

        for (const col of api.getPivotResultColumns() ?? []) {
            expect(col.getColDef().context).toEqual({ version: 1 });
        }

        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'year', pivot: true },
            { field: 'gold', aggFunc: 'sum', context: { version: 2 } },
        ]);

        for (const col of api.getPivotResultColumns() ?? []) {
            expect(col.getColDef().context).toEqual({ version: 2 });
        }

        await checkDefaultRows(api, 'rows after context update');
        await checkDefaultCols(api, 'cols after context update');
    });

    test('processPivotResultColDef can attach pivot-col-specific context on every recreate', async () => {
        // The supported way to attach context per pivot result col is via
        // `processPivotResultColDef`, which runs on initial creation and every
        // recreate — so context is reapplied across columnDefs updates.
        const stamp = (colDef: ColDef): void => {
            colDef.context = { byColId: colDef.colId };
        };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
            processPivotResultColDef: stamp,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before callback recheck');
        await checkDefaultCols(api, 'cols before callback recheck');

        const beforeCols = api.getPivotResultColumns() ?? [];
        expect(beforeCols.length).toBeGreaterThan(0);
        for (const col of beforeCols) {
            expect(col.getColDef().context).toEqual({ byColId: col.getColId() });
        }

        api.setGridOption('columnDefs', baseColumnDefs);

        for (const col of api.getPivotResultColumns() ?? []) {
            expect(col.getColDef().context).toEqual({ byColId: col.getColId() });
        }

        await checkDefaultRows(api, 'rows after callback recheck');
        await checkDefaultCols(api, 'cols after callback recheck');
    });

    test('custom properties attached directly to a pivot result colDef are NOT preserved across recreate', async () => {
        // recreateColDef rebuilds the pivot result colDef from the value column's
        // colDef and only carries over a fixed set of fields (colId, field,
        // valueGetter, aggFunc, pivotTotalColumnIds, columnGroupShow). Custom
        // properties added by directly mutating the pivot result colDef are lost.
        // To attach persistent metadata, attach it to the value col's colDef
        // (Object.assign carries it through) or use processPivotResultColDef.
        type ColDefWithCustom = ColDef & { myCustomProp?: string };

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before mutation');
        await checkDefaultCols(api, 'cols before mutation');

        const targetCol = api.getPivotResultColumns()![0];
        const targetColId = targetCol.getColId();
        (targetCol.getColDef() as ColDefWithCustom).myCustomProp = 'foo';

        api.setGridOption('columnDefs', baseColumnDefs);

        const afterCol = api.getPivotResultColumns()!.find((col) => col.getColId() === targetColId);
        expect(afterCol).toBeDefined();
        expect((afterCol!.getColDef() as ColDefWithCustom).myCustomProp).toBeUndefined();

        await checkDefaultRows(api, 'rows after mutation');
        await checkDefaultCols(api, 'cols after mutation');
    });
});
