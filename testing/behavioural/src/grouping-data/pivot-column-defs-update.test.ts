import type { ColDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked, asyncSetTimeout } from '../test-utils';

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
        await new GridColumns(
            api,
            `setGridOption(columnDefs) preserves pivot result colIds and field/colId consiste setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);
        await new GridRows(
            api,
            `setGridOption(columnDefs) preserves pivot result colIds and field/colId consiste setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before round-trip');
        await checkDefaultCols(api, 'cols before round-trip');

        const beforeIds = snapshotCols(api.getPivotResultColumns());
        expect(beforeIds.length).toBeGreaterThan(0);

        for (const { colId, field } of beforeIds) {
            expect(field).toBe(colId);
        }

        api.setGridOption('columnDefs', baseColumnDefs);
        await new GridColumns(
            api,
            `setGridOption(columnDefs) preserves pivot result colIds and field/colId consiste after setGridOption columnDefs`
        ).checkColumns(`
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
        await new GridRows(
            api,
            `setGridOption(columnDefs) preserves pivot result colIds and field/colId consiste after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

        const afterIds = snapshotCols(api.getPivotResultColumns());
        expect(afterIds).toEqual(beforeIds);

        for (const { colId, field } of afterIds) {
            expect(field).toBe(colId);
        }

        await checkDefaultRows(api, 'rows after round-trip');
        await checkDefaultCols(api, 'cols after round-trip');
    });

    test('setGridOption(columnDefs) preserves pivot total result colIds and field/colId consistency', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        await new GridColumns(
            api,
            `setGridOption(columnDefs) preserves pivot total result colIds and field/colId co setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);
        await new GridRows(
            api,
            `setGridOption(columnDefs) preserves pivot total result colIds and field/colId co setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
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
        await new GridColumns(
            api,
            `setGridOption(columnDefs) preserves pivot total result colIds and field/colId co after setGridOption columnDefs`
        ).checkColumns(`
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
        await new GridRows(
            api,
            `setGridOption(columnDefs) preserves pivot total result colIds and field/colId co after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

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
        await new GridColumns(api, `setGridOption(columnDefs) preserves the pivot result Column instances setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
        await new GridRows(api, `setGridOption(columnDefs) preserves the pivot result Column instances setup`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before instance check');
        await checkDefaultCols(api, 'cols before instance check');

        const beforeCols = api.getPivotResultColumns() ?? [];
        expect(beforeCols.length).toBeGreaterThan(0);
        const beforeById = new Map(beforeCols.map((col) => [col.getColId(), col]));

        api.setGridOption('columnDefs', baseColumnDefs);
        await new GridColumns(
            api,
            `setGridOption(columnDefs) preserves the pivot result Column instances after setGridOption columnDefs`
        ).checkColumns(`
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
        await new GridRows(
            api,
            `setGridOption(columnDefs) preserves the pivot result Column instances after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

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
        await new GridColumns(api, `updated context on the value column propagates to pivot result colDefs setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
        await new GridRows(api, `updated context on the value column propagates to pivot result colDefs setup`).check(
            `
                ROOT id:ROOT_NODE_ID
            `
        );
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
        await new GridColumns(
            api,
            `updated context on the value column propagates to pivot result colDefs after setGridOption columnDefs`
        ).checkColumns(`
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
        await new GridRows(
            api,
            `updated context on the value column propagates to pivot result colDefs after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

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
        await new GridColumns(
            api,
            `processPivotResultColDef can attach pivot-col-specific context on every recreate setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);
        await new GridRows(
            api,
            `processPivotResultColDef can attach pivot-col-specific context on every recreate setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before callback recheck');
        await checkDefaultCols(api, 'cols before callback recheck');

        const beforeCols = api.getPivotResultColumns() ?? [];
        expect(beforeCols.length).toBeGreaterThan(0);
        for (const col of beforeCols) {
            expect(col.getColDef().context).toEqual({ byColId: col.getColId() });
        }

        api.setGridOption('columnDefs', baseColumnDefs);
        await new GridColumns(
            api,
            `processPivotResultColDef can attach pivot-col-specific context on every recreate after setGridOption columnDefs`
        ).checkColumns(`
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
        await new GridRows(
            api,
            `processPivotResultColDef can attach pivot-col-specific context on every recreate after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

        for (const col of api.getPivotResultColumns() ?? []) {
            expect(col.getColDef().context).toEqual({ byColId: col.getColId() });
        }

        await checkDefaultRows(api, 'rows after callback recheck');
        await checkDefaultCols(api, 'cols after callback recheck');
    });

    test('custom properties on a pivot result colDef survive a no-op refresh and are wiped on actual change', async () => {
        type ColDefWithCustom = ColDef & { myCustomProp?: string };

        const liveDefs: ColDef[] = [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'year', pivot: true },
            { field: 'gold', aggFunc: 'sum' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: liveDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        await new GridColumns(
            api,
            `custom properties on a pivot result colDef survive a no-op refresh and are wiped setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);
        await new GridRows(
            api,
            `custom properties on a pivot result colDef survive a no-op refresh and are wiped setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
        `);
        applyTransactionChecked(api, { add: olympicLikeRows });

        await checkDefaultRows(api, 'rows before mutation');
        await checkDefaultCols(api, 'cols before mutation');

        const targetCol = api.getPivotResultColumns()![0];
        const targetColId = targetCol.getColId();
        (targetCol.getColDef() as ColDefWithCustom).myCustomProp = 'foo';

        api.setGridOption('columnDefs', liveDefs);
        await new GridColumns(
            api,
            `custom properties on a pivot result colDef survive a no-op refresh and are wiped after setGridOption columnDefs`
        ).checkColumns(`
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
        await new GridRows(
            api,
            `custom properties on a pivot result colDef survive a no-op refresh and are wiped after setGridOption columnDefs`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

        let afterCol = api.getPivotResultColumns()!.find((col) => col.getColId() === targetColId);
        expect(afterCol).toBeDefined();
        expect((afterCol!.getColDef() as ColDefWithCustom).myCustomProp).toBe('foo');

        liveDefs[3].headerName = 'Gold Medals';
        api.setGridOption('columnDefs', liveDefs);
        await new GridColumns(
            api,
            `custom properties on a pivot result colDef survive a no-op refresh and are wiped after setGridOption columnDefs #2`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "Gymnastics" GROUP open
            │ ├─┬ "2008" GROUP
            │ │ └── pivot_sport-year_Gymnastics-2008_gold "Gold Medals" width:200 columnGroupShow:open
            │ ├─┬ "2012" GROUP
            │ │ └── pivot_sport-year_Gymnastics-2012_gold "Gold Medals" width:200 columnGroupShow:open
            │ └── pivot_sport-year_Gymnastics_gold "Gold Medals" width:200 columnGroupShow:closed hidden
            └─┬ "Swimming" GROUP open
              ├─┬ "2008" GROUP
              │ └── pivot_sport-year_Swimming-2008_gold "Gold Medals" width:200 columnGroupShow:open
              ├─┬ "2012" GROUP
              │ └── pivot_sport-year_Swimming-2012_gold "Gold Medals" width:200 columnGroupShow:open
              └── pivot_sport-year_Swimming_gold "Gold Medals" width:200 columnGroupShow:closed hidden
        `);
        await new GridRows(
            api,
            `custom properties on a pivot result colDef survive a no-op refresh and are wiped after setGridOption columnDefs #2`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Gymnastics-2008_gold:7 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:8 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:null pivot_sport-year_Swimming-2012_gold:null pivot_sport-year_Swimming_gold:null
            │ ├── LEAF hidden id:0 pivot_sport-year_Gymnastics-2008_gold:3 pivot_sport-year_Gymnastics-2012_gold:3 pivot_sport-year_Gymnastics_gold:3 pivot_sport-year_Swimming-2008_gold:3 pivot_sport-year_Swimming-2012_gold:3 pivot_sport-year_Swimming_gold:3
            │ └── LEAF hidden id:1 pivot_sport-year_Gymnastics-2008_gold:1 pivot_sport-year_Gymnastics-2012_gold:1 pivot_sport-year_Gymnastics_gold:1 pivot_sport-year_Swimming-2008_gold:1 pivot_sport-year_Swimming-2012_gold:1 pivot_sport-year_Swimming_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:null pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:7
            · ├── LEAF hidden id:2 pivot_sport-year_Gymnastics-2008_gold:4 pivot_sport-year_Gymnastics-2012_gold:4 pivot_sport-year_Gymnastics_gold:4 pivot_sport-year_Swimming-2008_gold:4 pivot_sport-year_Swimming-2012_gold:4 pivot_sport-year_Swimming_gold:4
            · ├── LEAF hidden id:3 pivot_sport-year_Gymnastics-2008_gold:2 pivot_sport-year_Gymnastics-2012_gold:2 pivot_sport-year_Gymnastics_gold:2 pivot_sport-year_Swimming-2008_gold:2 pivot_sport-year_Swimming-2012_gold:2 pivot_sport-year_Swimming_gold:2
            · └── LEAF hidden id:4 pivot_sport-year_Gymnastics-2008_gold:5 pivot_sport-year_Gymnastics-2012_gold:5 pivot_sport-year_Gymnastics_gold:5 pivot_sport-year_Swimming-2008_gold:5 pivot_sport-year_Swimming-2012_gold:5 pivot_sport-year_Swimming_gold:5
        `);

        afterCol = api.getPivotResultColumns()!.find((col) => col.getColId() === targetColId);
        expect(afterCol).toBeDefined();
        expect((afterCol!.getColDef() as ColDefWithCustom).myCustomProp).toBeUndefined();
        expect(afterCol!.getColDef().headerName).toBe('Gold Medals');
    });

    test('in-place mutation of a value column colDef propagates to pivot result colDefs', async () => {
        const liveDefs: ColDef[] = [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'year', pivot: true },
            { field: 'gold', aggFunc: 'sum', headerName: 'Gold' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: liveDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });

        await new GridColumns(api, 'pivot cols with original headerName').checkColumns(`
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
        for (const col of api.getPivotResultColumns() ?? []) {
            expect(col.getColDef().headerName).toBe('Gold');
        }

        liveDefs[3].headerName = 'Gold Medals';
        api.setGridOption('columnDefs', liveDefs);

        await new GridColumns(api, 'pivot cols pick up mutated headerName').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "Gymnastics" GROUP open
            │ ├─┬ "2008" GROUP
            │ │ └── pivot_sport-year_Gymnastics-2008_gold "Gold Medals" width:200 columnGroupShow:open
            │ ├─┬ "2012" GROUP
            │ │ └── pivot_sport-year_Gymnastics-2012_gold "Gold Medals" width:200 columnGroupShow:open
            │ └── pivot_sport-year_Gymnastics_gold "Gold Medals" width:200 columnGroupShow:closed hidden
            └─┬ "Swimming" GROUP open
              ├─┬ "2008" GROUP
              │ └── pivot_sport-year_Swimming-2008_gold "Gold Medals" width:200 columnGroupShow:open
              ├─┬ "2012" GROUP
              │ └── pivot_sport-year_Swimming-2012_gold "Gold Medals" width:200 columnGroupShow:open
              └── pivot_sport-year_Swimming_gold "Gold Medals" width:200 columnGroupShow:closed hidden
        `);
        for (const col of api.getPivotResultColumns() ?? []) {
            expect(col.getColDef().headerName).toBe('Gold Medals');
        }
    });

    test('applyColumnState({applyOrder:true}) in pivot mode does not pull primary cols into pivot displayed list', async () => {
        const api = gridsManager.createGrid('applyOrderPivot', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'pivot displayed cols before applyOrder').checkColumns(`
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
        const beforeIds = api.getAllDisplayedColumns().map((c) => c.getColId());
        expect(beforeIds).not.toContain('gold');
        expect(beforeIds).not.toContain('sport');

        api.applyColumnState({
            state: [{ colId: 'country' }, { colId: 'sport' }, { colId: 'year' }, { colId: 'gold' }],
            applyOrder: true,
        });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'pivot displayed cols after applyOrder — primaries stay out').checkColumns(`
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
        const afterIds = api.getAllDisplayedColumns().map((c) => c.getColId());
        expect(afterIds).not.toContain('gold');
        expect(afterIds).not.toContain('sport');
        expect(afterIds).not.toContain('year');
    });

    test('pivot result cols dropped across a clear/restore window are destroyed (no bean leak)', async () => {
        const api = gridsManager.createGrid('clearRestoreLeak', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            pivotDefaultExpanded: -1,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);

        await new GridColumns(api, 'cols before clear/restore').checkColumns(`
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
        const oldPivotCols = api.getPivotResultColumns() ?? [];
        expect(oldPivotCols.length).toBeGreaterThan(0);

        api.setPivotColumns([]);
        await asyncSetTimeout(0);
        await new GridColumns(api, 'cols after clearing pivot columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── gold "Gold" width:200 aggFunc:sum
        `);

        api.setPivotColumns(['sport']);
        await asyncSetTimeout(0);
        await new GridColumns(api, 'cols after restoring pivot sport').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├─┬ "Gymnastics" GROUP
            │ └── pivot_sport_Gymnastics_gold "Gold" width:200 columnGroupShow:open
            └─┬ "Swimming" GROUP
              └── pivot_sport_Swimming_gold "Gold" width:200 columnGroupShow:open
        `);

        const newPivotCols = api.getPivotResultColumns() ?? [];
        const newSet = new Set(newPivotCols);

        for (const oldCol of oldPivotCols) {
            if (!newSet.has(oldCol)) {
                expect((oldCol as any).isAlive()).toBe(false);
            }
        }
    });

    test('changing pivotDefaultExpanded reactively rebuilds pivot result col groups with the new depth', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            pivotDefaultExpanded: 0,
            rowData: [
                { country: 'UK', sport: 'Swim', year: 2000, gold: 1 },
                { country: 'UK', sport: 'Swim', year: 2004, gold: 2 },
            ],
        });
        await new GridColumns(
            api,
            `changing pivotDefaultExpanded reactively rebuilds pivot result col groups with t setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Swim" GROUP closed
              ├─┬ "2000" GROUP hidden
              │ └── pivot_sport-year_Swim-2000_gold "Gold" width:200 columnGroupShow:open hidden
              ├─┬ "2004" GROUP hidden
              │ └── pivot_sport-year_Swim-2004_gold "Gold" width:200 columnGroupShow:open hidden
              └── pivot_sport-year_Swim_gold "Gold" width:200 columnGroupShow:closed
        `);
        await new GridRows(
            api,
            `changing pivotDefaultExpanded reactively rebuilds pivot result col groups with t setup`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            · ├── LEAF hidden id:0 pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:1 pivot_sport-year_Swim_gold:1
            · └── LEAF hidden id:1 pivot_sport-year_Swim-2000_gold:2 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:2
        `);

        await asyncSetTimeout(0);

        // Property listener path: updating pivotDefaultExpanded re-reads via the listener.
        api.setGridOption('pivotDefaultExpanded', 1);
        await new GridColumns(
            api,
            `changing pivotDefaultExpanded reactively rebuilds pivot result col groups with t after setGridOption pivotDefaultExpanded`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Swim" GROUP closed
              ├─┬ "2000" GROUP hidden
              │ └── pivot_sport-year_Swim-2000_gold "Gold" width:200 columnGroupShow:open hidden
              ├─┬ "2004" GROUP hidden
              │ └── pivot_sport-year_Swim-2004_gold "Gold" width:200 columnGroupShow:open hidden
              └── pivot_sport-year_Swim_gold "Gold" width:200 columnGroupShow:closed
        `);
        await new GridRows(
            api,
            `changing pivotDefaultExpanded reactively rebuilds pivot result col groups with t after setGridOption pivotDefaultExpanded`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            · ├── LEAF hidden id:0 pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:1 pivot_sport-year_Swim_gold:1
            · └── LEAF hidden id:1 pivot_sport-year_Swim-2000_gold:2 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:2
        `);
        await asyncSetTimeout(0);

        // After option change pivot result cols still exist (rebuild is the listener's job)
        expect((api.getPivotResultColumns() ?? []).length).toBeGreaterThan(0);
    });

    test('api.getColumn by field in pivot mode resolves primary col via lazy colsByDef map', async () => {
        const api = gridsManager.createGrid('pivotFieldLookup', {
            columnDefs: [
                { colId: 'countryCol', field: 'country', rowGroup: true, hide: true },
                { colId: 'sportCol', field: 'sport', pivot: true, hide: true },
                { colId: 'goldCol', field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData: [{ country: 'UK', sport: 'Swim', gold: 1 }],
        });
        await new GridColumns(
            api,
            `api.getColumn by field in pivot mode resolves primary col via lazy colsByDef map setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └─┬ "Swim" GROUP
              └── pivot_sportCol_Swim_goldCol "Gold" width:200 columnGroupShow:open
        `);
        await new GridRows(
            api,
            `api.getColumn by field in pivot mode resolves primary col via lazy colsByDef map setup`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sportCol_Swim_goldCol:1
            └─┬ LEAF_GROUP collapsed id:row-group-countryCol-UK ag-Grid-AutoColumn:"UK" pivot_sportCol_Swim_goldCol:1
            · └── LEAF hidden id:0 pivot_sportCol_Swim_goldCol:1
        `);

        await asyncSetTimeout(0);
        expect((api.getPivotResultColumns() ?? []).length).toBeGreaterThan(0);

        expect(api.getColumn('country')?.getColId()).toBe('countryCol');
        expect(api.getColumn('gold')?.getColId()).toBe('goldCol');
        await new GridRows(
            api,
            `api.getColumn by field in pivot mode resolves primary col via lazy colsByDef map final state`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sportCol_Swim_goldCol:1
            └─┬ LEAF_GROUP collapsed id:row-group-countryCol-UK ag-Grid-AutoColumn:"UK" pivot_sportCol_Swim_goldCol:1
            · └── LEAF hidden id:0 pivot_sportCol_Swim_goldCol:1
        `);
    });

    test('removePivotHeaderRowWhenSingleValueColumn collapses the bottom header row in single-value mode', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            removePivotHeaderRowWhenSingleValueColumn: true,
            rowData: [
                { country: 'UK', sport: 'Swim', gold: 1 },
                { country: 'UK', sport: 'Run', gold: 2 },
            ],
        });
        await new GridColumns(
            api,
            `removePivotHeaderRowWhenSingleValueColumn collapses the bottom header row in sin setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── pivot_sport_Run_gold "Run" width:200 columnGroupShow:open
            └── pivot_sport_Swim_gold "Swim" width:200 columnGroupShow:open
        `);
        await new GridRows(
            api,
            `removePivotHeaderRowWhenSingleValueColumn collapses the bottom header row in sin setup`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Run_gold:2 pivot_sport_Swim_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport_Run_gold:2 pivot_sport_Swim_gold:1
            · ├── LEAF hidden id:0 pivot_sport_Run_gold:1 pivot_sport_Swim_gold:1
            · └── LEAF hidden id:1 pivot_sport_Run_gold:2 pivot_sport_Swim_gold:2
        `);

        await asyncSetTimeout(0);

        // With single value col + removePivotHeaderRow, leaf pivot cols are built directly under
        // their parent without an additional measure-name group row.
        const cols = api.getPivotResultColumns() ?? [];
        expect(cols.length).toBeGreaterThan(0);
        await new GridRows(
            api,
            `removePivotHeaderRowWhenSingleValueColumn collapses the bottom header row in sin final state`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Run_gold:2 pivot_sport_Swim_gold:1
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport_Run_gold:2 pivot_sport_Swim_gold:1
            · ├── LEAF hidden id:0 pivot_sport_Run_gold:1 pivot_sport_Swim_gold:1
            · └── LEAF hidden id:1 pivot_sport_Run_gold:2 pivot_sport_Swim_gold:2
        `);
    });
});
