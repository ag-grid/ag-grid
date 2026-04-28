import type { ColDef, Column, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
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

    const gridRowsOptions: GridRowsOptions = {
        forcedColumns: [
            'ag-Grid-AutoColumn',
            'pivot_sport-year_Gymnastics-2008_gold',
            'pivot_sport-year_Gymnastics-2012_gold',
            'pivot_sport-year_Gymnastics_gold',
            'pivot_sport-year_Swimming-2008_gold',
            'pivot_sport-year_Swimming-2012_gold',
            'pivot_sport-year_Swimming_gold',
        ],
        printHiddenRows: false,
    };

    test('setGridOption(columnDefs) preserves pivot result colIds and field/colId consistency', async () => {
        const gridOptions: GridOptions = {
            columnDefs: baseColumnDefs,
            pivotMode: true,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        applyTransactionChecked(api, { add: olympicLikeRows });

        await new GridRows(api, 'rows before round-trip', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols before round-trip').checkColumns(``);

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

        await new GridRows(api, 'rows after round-trip', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols after round-trip').checkColumns(``);
    });

    test('setGridOption(columnDefs) preserves pivot total result colIds and field/colId consistency', async () => {
        // addExpandablePivotGroups creates "Total" cols with pivotTotalColumnIds set
        // but totalColumn=false. recreateColDef previously used !!pivotTotalColumnIds
        // to flip totalColumn=true on regeneration, breaking field consistency.
        const gridOptions: GridOptions = {
            columnDefs: baseColumnDefs,
            pivotMode: true,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        applyTransactionChecked(api, { add: olympicLikeRows });

        await new GridRows(api, 'rows before round-trip (totals)', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols before round-trip (totals)').checkColumns(``);

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

        await new GridRows(api, 'rows after round-trip (totals)', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols after round-trip (totals)').checkColumns(``);
    });

    test('setGridOption(columnDefs) preserves the pivot result Column instances', async () => {
        const gridOptions: GridOptions = {
            columnDefs: baseColumnDefs,
            pivotMode: true,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);
        applyTransactionChecked(api, { add: olympicLikeRows });

        await new GridRows(api, 'rows before instance check', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols before instance check').checkColumns(``);

        const beforeCols = api.getPivotResultColumns() ?? [];
        expect(beforeCols.length).toBeGreaterThan(0);
        const beforeById = new Map(beforeCols.map((col) => [col.getColId(), col]));

        api.setGridOption('columnDefs', baseColumnDefs);

        const afterCols = api.getPivotResultColumns() ?? [];
        expect(afterCols.length).toBe(beforeCols.length);

        for (const col of afterCols) {
            expect(beforeById.get(col.getColId())).toBe(col);
        }

        await new GridRows(api, 'rows after instance check', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols after instance check').checkColumns(``);
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
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await new GridRows(api, 'rows before context update', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols before context update').checkColumns(``);

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

        await new GridRows(api, 'rows after context update', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols after context update').checkColumns(``);
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
            processPivotResultColDef: stamp,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await new GridRows(api, 'rows before callback recheck', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols before callback recheck').checkColumns(``);

        const beforeCols = api.getPivotResultColumns() ?? [];
        expect(beforeCols.length).toBeGreaterThan(0);
        for (const col of beforeCols) {
            expect(col.getColDef().context).toEqual({ byColId: col.getColId() });
        }

        api.setGridOption('columnDefs', baseColumnDefs);

        for (const col of api.getPivotResultColumns() ?? []) {
            expect(col.getColDef().context).toEqual({ byColId: col.getColId() });
        }

        await new GridRows(api, 'rows after callback recheck', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols after callback recheck').checkColumns(``);
    });

    test('custom properties attached directly to a pivot result colDef are NOT preserved across recreate', async () => {
        // recreateColDef rebuilds the pivot result colDef from the value column's
        // colDef and only carries over a fixed set of fields (colId, field,
        // valueGetter, aggFunc, pivotTotalColumnIds, columnGroupShow). Custom
        // properties added by directly mutating the pivot result colDef are lost.
        // To attach persistent metadata, attach it to the value col's colDef
        // (Object.assign carries it through) or use processPivotResultColDef.
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await new GridRows(api, 'rows before mutation', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols before mutation').checkColumns(``);

        const targetCol = api.getPivotResultColumns()?.[0];
        expect(targetCol).toBeDefined();
        const targetColId = targetCol!.getColId();

        (targetCol!.getColDef() as ColDef & { myCustomProp?: string }).myCustomProp = 'foo';

        api.setGridOption('columnDefs', baseColumnDefs);

        const afterCol = api.getPivotResultColumns()!.find((col) => col.getColId() === targetColId);
        expect(afterCol).toBeDefined();
        expect((afterCol!.getColDef() as ColDef & { myCustomProp?: string }).myCustomProp).toBeUndefined();

        await new GridRows(api, 'rows after mutation', gridRowsOptions).check(``);
        await new GridColumns(api, 'cols after mutation').checkColumns(``);
    });
});
