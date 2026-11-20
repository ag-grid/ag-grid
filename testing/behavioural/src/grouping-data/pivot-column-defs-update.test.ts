import { findByText, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import {
    ALL_SEVERITIES,
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    asyncSetTimeout,
} from 'ag-test-utils';
import { onTestFinished, vi } from 'vitest';

import type {
    ColDef,
    Column,
    ColumnEventType,
    GridApi,
    GridOptions,
    IAggFuncParams,
    ICellRendererComp,
    ICellRendererParams,
    IFilterComp,
    IFilterParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, CustomFilterModule, enableDevValidations, getGridElement } from 'ag-grid-community';
import {
    ColumnHeaderEditModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
} from 'ag-grid-enterprise';

import { openToolPanelContextMenu } from '../columnToolPanel/toolPanelContextMenuHarness';
import { pivotGroups } from './pivotGroups';

describe('pivot column identity across columnDefs updates', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CustomFilterModule, RowGroupingModule, PivotModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
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

    test('a pivot result column given the colId of a primary column keeps its column when a row adds a pivot key', () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [273] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); // warning 273: expected colId collision
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: baseColumnDefs,
            pivotMode: true,
            processPivotResultColDef: (colDef: ColDef) => {
                if (colDef.colId === 'pivot_sport-year_Swimming_gold') {
                    colDef.colId = 'gold';
                }
            },
        });
        applyTransactionChecked(api, { add: olympicLikeRows });
        const column = api.getColumn('gold_1');

        applyTransactionChecked(api, { add: [{ id: 6, country: 'USA', sport: 'Diving', year: 2012, gold: 1 }] });

        expect(api.getColumn('pivot_sport-year_Diving_gold')?.getColDef().pivotKeys).toEqual(['Diving']);
        expect(column?.getColDef().pivotKeys).toEqual(['Swimming']);
        expect(api.getColumn('gold_1')).toBe(column);
        expect(warn.mock.calls.flat().join(' ')).toContain('warning #273');
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

    test('custom properties on a pivot result colDef survive applying the value columns’ current order again', async () => {
        type ColDefWithCustom = ColDef & { myCustomProp?: string };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'year', aggFunc: 'sum' },
            ],
            pivotMode: true,
            getRowId: (params) => String(params.data.id),
        });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);
        const targetColId = api.getPivotResultColumns()![0].getColId();
        (api.getPivotResultColumns()![0].getColDef() as ColDefWithCustom).myCustomProp = 'foo';

        api.applyColumnState({
            state: [
                { colId: 'gold', valueIndex: 0 },
                { colId: 'year', valueIndex: 1 },
            ],
        });
        applyTransactionChecked(api, { update: [{ ...olympicLikeRows[0], gold: 30 }] });
        await asyncSetTimeout(0);

        const afterCol = api.getPivotResultColumns()!.find((col) => col.getColId() === targetColId);
        expect((afterCol!.getColDef() as ColDefWithCustom).myCustomProp).toBe('foo');
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

    test('pivot result columns are shown when the default column definition hides columns, also after the definitions are set again', async () => {
        const defs = (): ColDef[] => [
            { field: 'country', rowGroup: true, hide: false },
            { field: 'sport', pivot: true },
            { field: 'gold', aggFunc: 'sum' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs(),
            defaultColDef: { hide: true },
            pivotMode: true,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);
        const hidden = () => (api.getPivotResultColumns() ?? []).filter((col) => !col.isVisible()).length;
        expect({ count: api.getPivotResultColumns()?.length, hidden: hidden() }).toEqual({ count: 2, hidden: 0 });

        api.setGridOption('columnDefs', defs());
        await asyncSetTimeout(0);
        expect(hidden()).toBe(0);
    });

    test('pivot result columns keep a width and visibility the user gave them over new data, and take the value column width its definition sets again', async () => {
        const defs = (width: number): ColDef[] => [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'gold', aggFunc: 'sum', width },
        ];
        const api = gridsManager.createGrid('myGrid', { columnDefs: defs(100), pivotMode: true });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);
        const widths = () =>
            (api.getPivotResultColumns() ?? [])
                .map((col) => `${col.getColId()} ${col.getActualWidth()}${col.isVisible() ? '' : ' hidden'}`)
                .sort();
        api.applyColumnState({
            state: [
                { colId: 'pivot_sport_Swimming_gold', width: 333 },
                { colId: 'pivot_sport_Gymnastics_gold', hide: true },
            ],
        });

        applyTransactionChecked(api, { add: [{ id: 6, country: 'USA', sport: 'Diving', year: 2012, gold: 1 }] });
        await asyncSetTimeout(0);
        expect(widths()).toEqual([
            'pivot_sport_Diving_gold 100',
            'pivot_sport_Gymnastics_gold 100 hidden',
            'pivot_sport_Swimming_gold 333',
        ]);

        const shown: string[] = [];
        api.addEventListener('columnVisible', (event) => shown.push(String(event.visible)));
        api.setGridOption('columnDefs', defs(250));
        await asyncSetTimeout(0);
        expect({ widths: widths(), shown }).toEqual({
            widths: [
                'pivot_sport_Diving_gold 250',
                'pivot_sport_Gymnastics_gold 250 hidden',
                'pivot_sport_Swimming_gold 250',
            ],
            shown: [],
        });
    });

    test('a pivot result column keeps the width the user gave it over a default column width when another value column is removed, then pivot mode is turned off and on', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum' },
            ],
            defaultColDef: { width: 200 },
            pivotMode: true,
        });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);
        api.setColumnWidths([{ key: 'pivot_sport_Swimming_gold', newWidth: 333 }]);
        const width = () => api.getColumn('pivot_sport_Swimming_gold')?.getActualWidth();

        api.removeValueColumns(['silver']);
        await asyncSetTimeout(0);
        expect(width()).toBe(333);

        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);
        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);
        expect(width()).toBe(333);
    });

    test('a columnDefs update made while pivot mode is off applies width, sort and pinned but not hide to the pivot result columns shown when pivot mode is turned back on', async () => {
        const defs = (gold: ColDef): ColDef[] => [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            gold,
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: 'sum' }),
            defaultColDef: { width: 200 },
            pivotMode: true,
        });
        applyTransactionChecked(api, {
            add: [{ id: 1, country: 'USA', sport: 'Swimming', gold: 2 }],
        });
        await asyncSetTimeout(0);
        api.setColumnWidths([{ key: 'pivot_sport_Swimming_gold', newWidth: 333 }]);

        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);
        api.setGridOption(
            'columnDefs',
            defs({ field: 'gold', aggFunc: 'sum', width: 250, sort: 'asc', pinned: 'left', hide: true })
        );
        await asyncSetTimeout(0);
        api.setGridOption('pivotMode', true);
        await asyncSetTimeout(0);

        const col = api.getColumn('pivot_sport_Swimming_gold');
        expect({
            width: col?.getActualWidth(),
            sort: col?.getSort(),
            pinned: col?.getPinned(),
            visible: col?.isVisible(),
        }).toEqual({ width: 250, sort: 'asc', pinned: 'left', visible: true });
    });

    test('a value column header change reaches the pivot result columns new data added since the last change', async () => {
        const liveDefs: ColDef[] = [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'gold', aggFunc: 'sum', headerName: 'Gold' },
        ];
        const api = gridsManager.createGrid('myGrid', { columnDefs: liveDefs, pivotMode: true });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);
        liveDefs[2].headerName = 'Gold Medals';
        api.setGridOption('columnDefs', liveDefs);
        await asyncSetTimeout(0);

        applyTransactionChecked(api, { add: [{ id: 6, country: 'USA', sport: 'Diving', year: 2012, gold: 1 }] });
        await asyncSetTimeout(0);
        liveDefs[2].headerName = 'Golds';
        api.setGridOption('columnDefs', liveDefs);
        await asyncSetTimeout(0);

        const headers = (api.getPivotResultColumns() ?? []).map(
            (col) => `${col.getColId()} ${col.getColDef().headerName}`
        );
        expect(headers.sort()).toEqual([
            'pivot_sport_Diving_gold Golds',
            'pivot_sport_Gymnastics_gold Golds',
            'pivot_sport_Swimming_gold Golds',
        ]);
    });

    test('a value column minWidth change reaches the pivot result columns new data added since the last change', async () => {
        const liveDefs: ColDef[] = [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'gold', aggFunc: 'sum', minWidth: 51 },
        ];
        const api = gridsManager.createGrid('myGrid', { columnDefs: liveDefs, pivotMode: true });
        applyTransactionChecked(api, { add: olympicLikeRows });
        await asyncSetTimeout(0);
        liveDefs[2].minWidth = 52;
        api.setGridOption('columnDefs', liveDefs);
        await asyncSetTimeout(0);

        applyTransactionChecked(api, { add: [{ id: 6, country: 'USA', sport: 'Diving', year: 2012, gold: 1 }] });
        await asyncSetTimeout(0);
        liveDefs[2].minWidth = 53;
        api.setGridOption('columnDefs', liveDefs);
        await asyncSetTimeout(0);

        const minWidths = (api.getPivotResultColumns() ?? []).map(
            (col) => `${col.getColId()} ${col.getColDef().minWidth}`
        );
        expect(minWidths.sort()).toEqual([
            'pivot_sport_Diving_gold 53',
            'pivot_sport_Gymnastics_gold 53',
            'pivot_sport_Swimming_gold 53',
        ]);
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

    test('setting pivotDefaultExpanded alone leaves the pivot result column groups as they are', async () => {
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
            `setting pivotDefaultExpanded alone leaves the pivot result column groups as they are setup`
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
            `setting pivotDefaultExpanded alone leaves the pivot result column groups as they are setup`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            · ├── LEAF hidden id:0 pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:1 pivot_sport-year_Swim_gold:1
            · └── LEAF hidden id:1 pivot_sport-year_Swim-2000_gold:2 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:2
        `);

        await asyncSetTimeout(0);

        // Setting it alone rebuilds nothing: the next pivot build reads the new depth.
        api.setGridOption('pivotDefaultExpanded', 1);
        await new GridColumns(
            api,
            `setting pivotDefaultExpanded alone leaves the pivot result column groups as they are after setGridOption pivotDefaultExpanded`
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
            `setting pivotDefaultExpanded alone leaves the pivot result column groups as they are after setGridOption pivotDefaultExpanded`
        ).check(`
            ROOT id:ROOT_NODE_ID pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:3
            · ├── LEAF hidden id:0 pivot_sport-year_Swim-2000_gold:1 pivot_sport-year_Swim-2004_gold:1 pivot_sport-year_Swim_gold:1
            · └── LEAF hidden id:1 pivot_sport-year_Swim-2000_gold:2 pivot_sport-year_Swim-2004_gold:2 pivot_sport-year_Swim_gold:2
        `);
        await asyncSetTimeout(0);

        expect((api.getPivotResultColumns() ?? []).length).toBeGreaterThan(0);
    });

    const allOpen = [
        { id: 'pivotGroup_sport-year_Gymnastics', path: 'Gymnastics', open: true, expandable: true },
        { id: 'pivotGroup_sport-year_Gymnastics-2008', path: 'Gymnastics > 2008', open: true, expandable: false },
        { id: 'pivotGroup_sport-year_Gymnastics-2012', path: 'Gymnastics > 2012', open: true, expandable: false },
        { id: 'pivotGroup_sport-year_Swimming', path: 'Swimming', open: true, expandable: true },
        { id: 'pivotGroup_sport-year_Swimming-2008', path: 'Swimming > 2008', open: true, expandable: false },
        { id: 'pivotGroup_sport-year_Swimming-2012', path: 'Swimming > 2012', open: true, expandable: false },
    ];

    test.each([
        { keys: 'pivotMode first', first: 'pivotMode' as const },
        { keys: 'pivotDefaultExpanded first', first: 'pivotDefaultExpanded' as const },
    ])(
        'one update turning pivot mode on and setting pivotDefaultExpanded to -1 opens every pivot result column group ($keys)',
        async (row) => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', pivot: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                pivotDefaultExpanded: 0,
                rowData: olympicLikeRows,
            });
            const mode = { pivotMode: true };
            const expanded = { pivotDefaultExpanded: -1 };

            api.updateGridOptions(row.first === 'pivotMode' ? { ...mode, ...expanded } : { ...expanded, ...mode });

            expect(api.isPivotMode()).toBe(true);
            expect(pivotGroups(api)).toEqual(allOpen);
            await asyncSetTimeout(0);
            expect(pivotGroups(api)).toEqual(allOpen);
        }
    );

    test('pivotDefaultExpanded 1 opens the first pivot group level and leaves the second level closed', () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', pivot: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            pivotDefaultExpanded: 1,
            rowData: olympicLikeRows,
        });

        expect(pivotGroups(api)).toEqual([
            { id: 'pivotGroup_sport-year_Gymnastics', path: 'Gymnastics', open: true, expandable: true },
            { id: 'pivotGroup_sport-year_Gymnastics-2008', path: 'Gymnastics > 2008', open: false, expandable: false },
            { id: 'pivotGroup_sport-year_Gymnastics-2012', path: 'Gymnastics > 2012', open: false, expandable: false },
            { id: 'pivotGroup_sport-year_Swimming', path: 'Swimming', open: true, expandable: true },
            { id: 'pivotGroup_sport-year_Swimming-2008', path: 'Swimming > 2008', open: false, expandable: false },
            { id: 'pivotGroup_sport-year_Swimming-2012', path: 'Swimming > 2012', open: false, expandable: false },
        ]);
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

    test('a value column redefined draws each pivot result cell again once', async () => {
        const refreshes: string[] = [];
        class CountingRenderer implements ICellRendererComp {
            private readonly eGui = document.createElement('span');
            private id = '';
            public init(params: ICellRendererParams): void {
                this.id = `${params.column!.getColId()}@${params.node.id}`;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public refresh(): boolean {
                refreshes.push(this.id);
                return true;
            }
        }
        const defs: ColDef[] = [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'gold', aggFunc: 'sum', headerName: 'Gold', cellRenderer: CountingRenderer },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs,
            pivotMode: true,
            groupDefaultExpanded: -1,
            rowData: [
                { country: 'A', sport: 'S1', gold: 1 },
                { country: 'A', sport: 'S2', gold: 2 },
                { country: 'B', sport: 'S1', gold: 3 },
            ],
        });
        await asyncSetTimeout(0);

        defs[2].headerName = 'Gold Medals';
        api.setGridOption('columnDefs', defs);
        await asyncSetTimeout(0);

        expect(refreshes.sort()).toEqual([
            'pivot_sport_S1_gold@row-group-country-A',
            'pivot_sport_S1_gold@row-group-country-B',
            'pivot_sport_S2_gold@row-group-country-A',
            'pivot_sport_S2_gold@row-group-country-B',
        ]);
    });

    test.each([
        ['a new headerName', (defs: ColDef[]) => [defs[0], defs[1], { ...defs[2], headerName: 'Gold Medals' }], 1],
        ['the same definitions as new objects', (defs: ColDef[]) => defs.map((def) => ({ ...def })), 0],
    ])(
        'a value column given %s redefines each pivot result column as many times as it changed',
        async (_, change, times) => {
            const defs: ColDef[] = [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum', headerName: 'Gold' },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs,
                defaultColDef: { minWidth: 50 },
                pivotMode: true,
                rowData: [
                    { country: 'A', sport: 'S1', gold: 1 },
                    { country: 'B', sport: 'S2', gold: 3 },
                ],
            });
            await asyncSetTimeout(0);
            const pivotCols = api.getPivotResultColumns()!;
            const colDefChanges = pivotCols.map(() => 0);
            pivotCols.forEach((col, i) => col.addEventListener('colDefChanged', () => ++colDefChanges[i]));

            api.setGridOption('columnDefs', change(defs));
            await asyncSetTimeout(0);

            expect(api.getPivotResultColumns()!.map((col) => col.getColId())).toEqual([
                'pivot_sport_S1_gold',
                'pivot_sport_S2_gold',
            ]);
            expect(api.getPivotResultColumns()).toEqual(pivotCols);
            expect(colDefChanges).toEqual([times, times]);
        }
    );

    test.each([
        ['an aggFunc', { aggFunc: 'sum' }, {}],
        ['an initialAggFunc', { initialAggFunc: 'sum' }, {}],
        ['an aggFunc and pivot column group totals', { aggFunc: 'sum' }, { pivotColumnGroupTotals: 'after' as const }],
    ])(
        'a value column with %s given a new hide redefines no pivot result column',
        async (_, aggDef: ColDef, options) => {
            const defs = (hide: boolean): ColDef[] => [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'year', pivot: true },
                { field: 'gold', hide, ...aggDef },
            ];
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: defs(false),
                pivotMode: true,
                rowData: [
                    { country: 'A', sport: 'S1', year: 2000, gold: 1 },
                    { country: 'B', sport: 'S1', year: 2004, gold: 3 },
                ],
                ...options,
            });
            await asyncSetTimeout(0);
            const pivotCols = api.getPivotResultColumns()!;
            const colDefChanges = pivotCols.map(() => 0);
            pivotCols.forEach((col, i) => col.addEventListener('colDefChanged', () => ++colDefChanges[i]));

            api.setGridOption('columnDefs', defs(true));
            await asyncSetTimeout(0);

            expect(api.getPivotResultColumns()).toEqual(pivotCols);
            expect(pivotCols.filter((col) => col.getColDef().pivotTotalColumnIds != null).length).toBe(1);
            expect(colDefChanges).toEqual(pivotCols.map(() => 0));
        }
    );

    test('a row adding a pivot key leaves the definitions of the other pivot result columns unchanged', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData: [{ id: '1', country: 'A', sport: 'S1', gold: 1 }],
            getRowId: (params) => params.data.id,
        });
        await asyncSetTimeout(0);
        const [s1] = api.getPivotResultColumns()!;
        let colDefChanges = 0;
        s1.addEventListener('colDefChanged', () => ++colDefChanges);

        applyTransactionChecked(api, { add: [{ id: '2', country: 'B', sport: 'S2', gold: 3 }] });
        await asyncSetTimeout(0);

        expect(api.getPivotResultColumns()!.map((col) => col.getColId())).toEqual([
            'pivot_sport_S1_gold',
            'pivot_sport_S2_gold',
        ]);
        expect(api.getPivotResultColumns()![0]).toBe(s1);
        expect(colDefChanges).toBe(0);
    });

    test('a kept pivot result column gives its filter the redefined column definition in the same update', async () => {
        const refreshes: { instance: IFilterComp; headerName: unknown }[] = [];
        class RecordingFilter implements IFilterComp {
            public readonly eGui = document.createElement('div');
            public init(): void {}
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public isFilterActive(): boolean {
                return false;
            }
            public doesFilterPass(): boolean {
                return true;
            }
            public getModel(): null {
                return null;
            }
            public setModel(): void {}
            public refresh(params: IFilterParams): boolean {
                refreshes.push({ instance: this, headerName: params.colDef.headerName });
                return true;
            }
        }
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum', headerName: 'Gold', filter: RecordingFilter },
            ],
            pivotMode: true,
            pivotRowTotals: 'after',
            rowData: [
                { country: 'A', sport: 'S1', gold: 1 },
                { country: 'B', sport: 'S2', gold: 3 },
            ],
        });
        const pivotCols = [...api.getPivotResultColumns()!];
        const [s1] = pivotCols;
        expect(
            pivotCols.map((col) => (col.getColDef().pivotTotalColumnIds == null ? col.getColId() : 'total'))
        ).toEqual(['pivot_sport_S1_gold', 'pivot_sport_S2_gold', 'total']);
        const instance = await api.getColumnFilterInstance<RecordingFilter>(s1);
        expect(instance).toBeInstanceOf(RecordingFilter);
        expect(s1.getColDef().headerName).toBe('Gold');
        expect(refreshes).toEqual([]);

        api.setGridOption('columnDefs', [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            { field: 'gold', aggFunc: 'sum', headerName: 'Gold Medals', filter: RecordingFilter },
        ]);

        expect(api.getPivotResultColumns()!.map((col, i) => col === pivotCols[i])).toEqual([true, true, true]);
        expect(refreshes).toEqual([{ instance, headerName: 'Gold Medals' }]);
    });

    test('a value column replaced by one with its colId as field shows the new field in the pivot result columns', async () => {
        const defs = (value: ColDef): ColDef[] => [
            { field: 'country', rowGroup: true },
            { field: 'sport', pivot: true },
            value,
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: defs({ colId: 'gold', field: 'silver', aggFunc: 'sum' }),
            pivotMode: true,
            rowData: [
                { country: 'A', sport: 'S1', gold: 1, silver: 2 },
                { country: 'B', sport: 'S1', gold: 3, silver: 4 },
            ],
        });
        await asyncSetTimeout(0);

        api.setGridOption('columnDefs', defs({ field: 'gold', aggFunc: 'sum' }));
        await asyncSetTimeout(0);

        const shown: unknown[] = [];
        api.forEachNode((node) => {
            if (node.group) {
                shown.push(api.getCellValue({ rowNode: node, colKey: 'pivot_sport_S1_gold' }));
            }
        });
        expect(shown).toEqual([1, 3]);
    });

    // The header texts the DOM shows, and each pivot result column's display name, as one reader.
    const headerSnapshot = (api: GridApi) => ({
        dom: Array.from(
            getGridElement(api)!.querySelectorAll('.ag-header-cell-text, .ag-header-group-text'),
            (el) => el.textContent
        ),
        names: (api.getPivotResultColumns() ?? []).map(
            (col) => `${col.getColId()}: ${api.getDisplayNameForColumn(col, 'header')}`
        ),
    });

    const sameInstances = (now: Column[] | null, before: Column[]) =>
        (now ?? []).map((col, i) => col === before[i]).concat(before.length === (now ?? []).length ? [] : [false]);

    test('renaming a value column with applyColumnState renames every pivot result header in the same call as a grid named so from the start, keeping the columns and a width the user set', async () => {
        const defs = (gold: ColDef): ColDef[] => [
            { field: 'country', pivot: true },
            { field: 'sport', rowGroup: true },
            gold,
        ];
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: 'sum' }),
            pivotMode: true,
            rowData: olympicLikeRows,
        });
        api.setColumnWidths([{ key: 'pivot_country_USA_gold', newWidth: 333 }]);
        const widths = () =>
            (api.getPivotResultColumns() ?? []).map((col) => `${col.getColId()} ${col.getActualWidth()}`);

        const before = headerSnapshot(api);
        const colsBefore = [...(api.getPivotResultColumns() ?? [])];
        const widthsBefore = widths();
        expect(before.names).toEqual(['pivot_country_Russia_gold: Gold', 'pivot_country_USA_gold: Gold']);
        expect(widthsBefore).toEqual(['pivot_country_Russia_gold 200', 'pivot_country_USA_gold 333']);

        api.applyColumnState({ state: [{ colId: 'gold', headerName: 'Medals' }] });

        const after = headerSnapshot(api);
        const afterState = {
            same: sameInstances(api.getPivotResultColumns(), colsBefore),
            widths: widths(),
        };
        gridsManager.reset();

        const control = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: 'sum', headerName: 'Medals' }),
            pivotMode: true,
            rowData: olympicLikeRows,
        });
        const expected = headerSnapshot(control);

        expect(after).toEqual(expected);
        expect(after.names).toEqual(['pivot_country_Russia_gold: Medals', 'pivot_country_USA_gold: Medals']);
        expect(after.dom).not.toEqual(before.dom);
        expect(afterState).toEqual({ same: [true, true], widths: widthsBefore });
    });

    test('renaming a value column renames the pivot total columns too and does not call a custom aggFunc', async () => {
        const calls = { n: 0 };
        const countingSum = (params: IAggFuncParams) => {
            ++calls.n;
            let total = 0;
            for (const value of params.values) {
                total += value ?? 0;
            }
            return total;
        };
        const defs = (gold: ColDef): ColDef[] => [
            { field: 'country', pivot: true },
            { field: 'year', pivot: true },
            { field: 'sport', rowGroup: true },
            gold,
        ];
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: countingSum }),
            pivotMode: true,
            pivotColumnGroupTotals: 'before',
            rowData: olympicLikeRows,
        });
        const before = headerSnapshot(api);
        const colsBefore = [...(api.getPivotResultColumns() ?? [])];
        expect(colsBefore.some((col) => col.getColDef().pivotTotalColumnIds !== undefined)).toBe(true);
        expect(calls.n).toBeGreaterThan(0);
        calls.n = 0;

        api.applyColumnState({ state: [{ colId: 'gold', headerName: 'Medals' }] });

        const after = headerSnapshot(api);
        const same = sameInstances(api.getPivotResultColumns(), colsBefore);
        const callsInTheCall = calls.n;
        await asyncSetTimeout(0);
        const callsAfterATurn = calls.n;
        gridsManager.reset();

        const control = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: countingSum, headerName: 'Medals' }),
            pivotMode: true,
            pivotColumnGroupTotals: 'before',
            rowData: olympicLikeRows,
        });
        const expected = headerSnapshot(control);

        expect(after).toEqual(expected);
        expect(after.names).not.toEqual(before.names);
        expect({ same, callsInTheCall, callsAfterATurn }).toEqual({
            same: colsBefore.map(() => true),
            callsInTheCall: 0,
            callsAfterATurn: 0,
        });
    });

    test('renaming the only value column leaves the pivot key headers of removePivotHeaderRowWhenSingleValueColumn unchanged and keeps the columns', async () => {
        const defs = (gold: ColDef): ColDef[] => [
            { field: 'country', pivot: true },
            { field: 'sport', rowGroup: true },
            gold,
        ];
        const options = { pivotMode: true, removePivotHeaderRowWhenSingleValueColumn: true, rowData: olympicLikeRows };
        const api = await gridsManager.createGridAndWait('myGrid', {
            ...options,
            columnDefs: defs({ field: 'gold', aggFunc: 'sum' }),
        });
        const leafTexts = () =>
            ['Russia', 'USA'].map(
                (key) =>
                    getGridElement(api)!.querySelector(
                        `.ag-header-cell[col-id="pivot_country_${key}_gold"] .ag-header-cell-text`
                    )?.textContent
            );
        const before = headerSnapshot(api);
        const colsBefore = [...(api.getPivotResultColumns() ?? [])];
        expect(leafTexts()).toEqual(['Russia', 'USA']);

        api.applyColumnState({ state: [{ colId: 'gold', headerName: 'Medals' }] });

        const after = headerSnapshot(api);
        const afterState = { leafTexts: leafTexts(), same: sameInstances(api.getPivotResultColumns(), colsBefore) };
        gridsManager.reset();

        const control = await gridsManager.createGridAndWait('myGrid', {
            ...options,
            columnDefs: defs({ field: 'gold', aggFunc: 'sum', headerName: 'Medals' }),
        });

        expect(afterState).toEqual({ leafTexts: ['Russia', 'USA'], same: [true, true] });
        expect(after).toEqual(before);
        expect(after).toEqual(headerSnapshot(control));
    });

    test('renaming a value column and changing its aggFunc in one applyColumnState shows the new name with the new function', async () => {
        const defs = (gold: ColDef): ColDef[] => [
            { field: 'country', pivot: true },
            { field: 'sport', rowGroup: true },
            gold,
        ];
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: 'sum' }),
            pivotMode: true,
            rowData: olympicLikeRows,
        });
        const before = headerSnapshot(api);

        api.applyColumnState({ state: [{ colId: 'gold', headerName: 'Medals', aggFunc: 'avg' }] });

        const after = headerSnapshot(api);
        gridsManager.reset();

        const control = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: 'avg', headerName: 'Medals' }),
            pivotMode: true,
            rowData: olympicLikeRows,
        });

        expect(after).toEqual(headerSnapshot(control));
        expect(after.names).not.toEqual(before.names);
    });

    test('renaming the value column from the columns tool panel renames every pivot result header as a grid named so from the start, each pivot result column reporting a colDefChanged from uiColumnHeaderEdit', async () => {
        const uiGridsManager = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                RowGroupingModule,
                PivotModule,
                ColumnsToolPanelModule,
                ColumnMenuModule,
                ColumnHeaderEditModule,
            ],
        });
        onTestFinished(() => uiGridsManager.reset());
        const options = (gold: ColDef): GridOptions => ({
            columnDefs: [{ field: 'country', pivot: true }, { field: 'sport', rowGroup: true }, gold],
            pivotMode: true,
            rowData: olympicLikeRows,
            sideBar: {
                toolPanels: [
                    {
                        id: 'columns',
                        labelDefault: 'Columns',
                        labelKey: 'columns',
                        iconKey: 'columns',
                        toolPanel: 'agColumnsToolPanel',
                    },
                ],
                defaultToolPanel: 'columns',
            },
        });
        const api = await uiGridsManager.createGridAndWait(
            'myGrid',
            options({ field: 'gold', aggFunc: 'sum', headerNameEditable: true })
        );
        const toolPanel = await waitFor(() => {
            const instance = api.getToolPanelInstance('columns');
            if (!instance) {
                throw new Error('the columns tool panel is not attached yet');
            }
            return instance;
        });
        const gridDiv = getGridElement(api);
        if (!(gridDiv instanceof HTMLElement)) {
            throw new Error('the grid element is not an HTMLElement');
        }
        const before = headerSnapshot(api);
        expect(before.names).toEqual(['pivot_country_Russia_gold: Gold', 'pivot_country_USA_gold: Gold']);
        const sources = new Map<string, ColumnEventType[]>();
        for (const col of api.getPivotResultColumns() ?? []) {
            sources.set(col.getColId(), []);
            col.addEventListener('colDefChanged', (event) => sources.get(col.getColId())!.push(event.source));
        }

        await openToolPanelContextMenu(toolPanel, gridDiv, 'Gold');
        await userEvent.click(await findByText(gridDiv, 'Edit Column Name'));
        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-column-header-edit-popup-editor input');
            if (!el) {
                throw new Error('the column name editor is not open');
            }
            return el;
        });
        await userEvent.clear(input);
        await userEvent.type(input, 'Medals');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
        await waitFor(() => expect(document.querySelector('.ag-column-header-edit-popup-editor')).toBeNull());

        await waitFor(() =>
            expect(Object.fromEntries([...sources].map(([id, list]) => [id, [...new Set(list)]]))).toEqual({
                pivot_country_Russia_gold: ['uiColumnHeaderEdit'],
                pivot_country_USA_gold: ['uiColumnHeaderEdit'],
            })
        );
        const after = headerSnapshot(api);
        uiGridsManager.reset();

        const control = await uiGridsManager.createGridAndWait(
            'myGrid',
            options({ field: 'gold', aggFunc: 'sum', headerName: 'Medals', headerNameEditable: true })
        );

        expect(after).toEqual(headerSnapshot(control));
        expect(after.names).toEqual(['pivot_country_Russia_gold: Medals', 'pivot_country_USA_gold: Medals']);
    });

    test('renaming a value column while pivot mode is off creates no pivot result columns, and turning pivot mode on shows the new name as a grid named so from the start', async () => {
        const defs = (gold: ColDef): ColDef[] => [
            { field: 'country', pivot: true },
            { field: 'sport', rowGroup: true },
            gold,
        ];
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: 'sum' }),
            pivotMode: false,
            rowData: olympicLikeRows,
        });
        const state = () => ({
            pivotResultColumns: (api.getPivotResultColumns() ?? []).map((col) => col.getColId()),
            displayed: api.getAllDisplayedColumns().map((col) => col.getColId()),
        });
        const before = state();
        expect(before.displayed).toContain('gold');

        api.applyColumnState({ state: [{ colId: 'gold', headerName: 'Medals' }] });
        await asyncSetTimeout(0);

        expect(state()).toEqual(before);

        api.setGridOption('pivotMode', true);
        await waitFor(() =>
            expect(headerSnapshot(api).names).toEqual([
                'pivot_country_Russia_gold: Medals',
                'pivot_country_USA_gold: Medals',
            ])
        );
        const after = headerSnapshot(api);
        gridsManager.reset();

        const control = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: defs({ field: 'gold', aggFunc: 'sum', headerName: 'Medals' }),
            pivotMode: true,
            rowData: olympicLikeRows,
        });

        expect(after).toEqual(headerSnapshot(control));
    });

    test('renaming a value column leaves the headers and the instances of application-supplied pivot result columns as supplied', async () => {
        const api = await gridsManager.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'country', pivot: true },
                { field: 'sport', rowGroup: true },
                { field: 'gold', aggFunc: 'sum' },
            ],
            pivotMode: true,
            rowData: olympicLikeRows,
        });
        const gold = api.getColumn('gold')!;
        api.setPivotResultColumns(
            ['Russia', 'USA'].map((country) => ({
                colId: `${country}_gold`,
                field: `${country}_gold`,
                headerName: `${country} Gold (app)`,
                pivotKeys: [country],
                pivotValueColumn: gold,
            }))
        );
        const colsBefore = [...(api.getPivotResultColumns() ?? [])];
        const supplied = ['Russia_gold: Russia Gold (app)', 'USA_gold: USA Gold (app)'];
        const before = headerSnapshot(api);
        expect(before.names).toEqual(supplied);
        expect(before.dom.join('|')).toContain('Russia Gold (app)');
        expect(before.dom.join('|')).toContain('USA Gold (app)');

        api.applyColumnState({ state: [{ colId: 'gold', headerName: 'Medals' }] });

        expect({
            valueColumnName: api.getDisplayNameForColumn(api.getColumn('gold')!, 'header'),
            same: sameInstances(api.getPivotResultColumns(), colsBefore),
            after: headerSnapshot(api),
        }).toEqual({ valueColumnName: 'Medals', same: [true, true], after: before });
    });
});
