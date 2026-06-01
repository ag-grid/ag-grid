import type { ColDef, Column } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnAutoSizeModule,
    NumberFilterModule,
    TextFilterModule,
} from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

describe('Column API — extended coverage', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnAutoSizeModule,
            TextFilterModule,
            NumberFilterModule,
            RowGroupingModule,
            PivotModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('getAllDisplayedVirtualColumns', () => {
        test('returns viewport columns (subset of displayed)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(api, `returns viewport columns (subset of displayed) setup`).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(api, `returns viewport columns (subset of displayed) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const virtual = api.getAllDisplayedVirtualColumns();
            const displayed = api.getAllDisplayedColumns();
            expect(Array.isArray(virtual)).toBe(true);
            expect(virtual.length).toBeLessThanOrEqual(displayed.length);
            for (const col of virtual) {
                expect(displayed).toContain(col);
            }
            await new GridRows(api, `returns viewport columns (subset of displayed) final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('returns empty array when all cols hidden', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', hide: true },
                    { colId: 'b', hide: true },
                ],
            });
            await new GridColumns(api, `returns empty array when all cols hidden setup`).checkColumns(``);
            await new GridRows(api, `returns empty array when all cols hidden setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getAllDisplayedVirtualColumns()).toEqual([]);
            await new GridRows(api, `returns empty array when all cols hidden final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getDisplayNameForColumnGroup', () => {
        test('returns the group header name for a real group', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        headerName: 'My Group',
                        children: [{ colId: 'a' }, { colId: 'b' }],
                    },
                ],
            });
            await new GridColumns(api, `returns the group header name for a real group setup`).checkColumns(`
                CENTER
                └─┬ "My Group" GROUP
                  ├── a width:200
                  └── b width:200
            `);
            await new GridRows(api, `returns the group header name for a real group setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const group = api.getColumnGroup('g1')!;
            expect(group).toBeTruthy();
            expect(api.getDisplayNameForColumnGroup(group, 'header')).toBe('My Group');
            await new GridRows(api, `returns the group header name for a real group final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getLeftDisplayedColumnGroups / getRightDisplayedColumnGroups', () => {
        test('returns only left-pinned tree; right is empty when nothing pinned right', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', pinned: 'left' }, { colId: 'b' }, { colId: 'c' }],
            });

            const left = api.getLeftDisplayedColumnGroups();
            const right = api.getRightDisplayedColumnGroups();
            expect(left.length).toBe(1);
            expect((left[0] as Column).getColId()).toBe('a');
            expect(right.length).toBe(0);

            await new GridColumns(api, 'a pinned left, b/c center').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                ├── b width:200
                └── c width:200
            `);
        });

        test('returns right-pinned tree, with group when grouped', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a' },
                    {
                        groupId: 'rg',
                        children: [
                            { colId: 'b', pinned: 'right' },
                            { colId: 'c', pinned: 'right' },
                        ],
                    },
                ],
            });

            const right = api.getRightDisplayedColumnGroups();
            expect(right.length).toBe(1);
            // The pinned children share a group in the right pinned area
            expect((right[0] as any).getGroupId?.()).toBe('rg');

            await new GridColumns(api, 'b/c pinned right under rg').checkColumns(`
                CENTER
                └── a width:200
                RIGHT
                └─┬ GROUP
                  ├── b width:200
                  └── c width:200
            `);
        });

        test('returns empty arrays when no pinning', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `returns empty arrays when no pinning setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `returns empty arrays when no pinning setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getLeftDisplayedColumnGroups()).toEqual([]);
            expect(api.getRightDisplayedColumnGroups()).toEqual([]);
            await new GridRows(api, `returns empty arrays when no pinning final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('getPivotResultColumn', () => {
        test('returns the pivot result column for matching pivot keys + value', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                pivotMode: true,
                rowData: [
                    { country: 'UK', year: 2000, gold: 5 },
                    { country: 'UK', year: 2004, gold: 3 },
                ],
            });
            await new GridColumns(api, `returns the pivot result column for matching pivot keys + value setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├─┬ "2000" GROUP
                    │ └── pivot_year_2000_gold "Gold" width:200 columnGroupShow:open
                    └─┬ "2004" GROUP
                      └── pivot_year_2004_gold "Gold" width:200 columnGroupShow:open
                `);
            await new GridRows(api, `returns the pivot result column for matching pivot keys + value setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2000_gold:5 pivot_year_2004_gold:3
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_year_2000_gold:5 pivot_year_2004_gold:3
                · ├── LEAF hidden id:0 pivot_year_2000_gold:5 pivot_year_2004_gold:5
                · └── LEAF hidden id:1 pivot_year_2000_gold:3 pivot_year_2004_gold:3
            `);

            await asyncSetTimeout(0);

            const col = api.getPivotResultColumn<number>(['2000'], 'gold');
            expect(col).toBeTruthy();
            expect(col!.getColId()).toBe('pivot_year_2000_gold');
            await new GridRows(api, `returns the pivot result column for matching pivot keys + value final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID pivot_year_2000_gold:5 pivot_year_2004_gold:3
                    └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_year_2000_gold:5 pivot_year_2004_gold:3
                    · ├── LEAF hidden id:0 pivot_year_2000_gold:5 pivot_year_2004_gold:5
                    · └── LEAF hidden id:1 pivot_year_2000_gold:3 pivot_year_2004_gold:3
                `);
        });

        test('returns null for non-matching pivot keys', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'year', pivot: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                pivotMode: true,
                rowData: [{ country: 'UK', year: 2000, gold: 5 }],
            });
            await new GridColumns(api, `returns null for non-matching pivot keys setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ "2000" GROUP
                  └── pivot_year_2000_gold "Gold" width:200 columnGroupShow:open
            `);
            await new GridRows(api, `returns null for non-matching pivot keys setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2000_gold:5
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_year_2000_gold:5
                · └── LEAF hidden id:0 pivot_year_2000_gold:5
            `);

            await asyncSetTimeout(0);

            expect(api.getPivotResultColumn(['9999'], 'gold')).toBeNull();
            await new GridRows(api, `returns null for non-matching pivot keys final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_year_2000_gold:5
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" pivot_year_2000_gold:5
                · └── LEAF hidden id:0 pivot_year_2000_gold:5
            `);
        });

        test('returns null when not in pivot mode', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold' }],
                pivotMode: false,
            });
            await new GridColumns(api, `returns null when not in pivot mode setup`).checkColumns(`
                CENTER
                └── gold "Gold" width:200
            `);
            await new GridRows(api, `returns null when not in pivot mode setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(api.getPivotResultColumn(['2000'], 'gold')).toBeNull();
            await new GridRows(api, `returns null when not in pivot mode final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('setValueColumns', () => {
        // Solved by AG-17366 when it is completed
        test.skip('replaces the value-column set wholesale', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }],
            });
            await new GridColumns(api, `replaces the value-column set wholesale setup`).checkColumns(`
                CENTER
                ├── gold "Gold" width:200
                ├── silver "Silver" width:200
                └── bronze "Bronze" width:200
            `);
            await new GridRows(api, `replaces the value-column set wholesale setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.setValueColumns(['gold', 'silver']);
            await new GridColumns(api, `replaces the value-column set wholesale after setValueColumns`).checkColumns(
                `
                    CENTER
                    ├── gold "Gold" width:200 aggFunc:sum
                    ├── silver "Silver" width:200 aggFunc:sum
                    └── bronze "Bronze" width:200
                `
            );
            await new GridRows(api, `replaces the value-column set wholesale after setValueColumns`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(
                api
                    .getValueColumns()
                    .map((c) => c.getColId())
                    .sort()
            ).toEqual(['gold', 'silver']);

            api.setValueColumns(['bronze']);
            await new GridColumns(api, `replaces the value-column set wholesale after setValueColumns #2`).checkColumns(
                `
                    CENTER
                    ├── gold "Gold" width:200
                    ├── silver "Silver" width:200
                    └── bronze "Bronze" width:200 aggFunc:sum
                `
            );
            await new GridRows(api, `replaces the value-column set wholesale after setValueColumns #2`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['bronze']);
        });
    });

    describe('pivot no-ops', () => {
        test('setPivotResultColumns(null) when already null is a safe no-op; setting pivotMode to current value is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
                pivotMode: true,
            });
            await new GridColumns(
                api,
                `setPivotResultColumns(null) when already null is a safe no-op; setting pivotMode setup`
            ).checkColumns(``);
            await new GridRows(
                api,
                `setPivotResultColumns(null) when already null is a safe no-op; setting pivotMode setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // setPivotResultColumns(null) when already-null exercises the early-return path.
            api.setPivotResultColumns(null);
            expect(api.getPivotResultColumns()).toBeNull();
            api.setPivotResultColumns(null);
            expect(api.getPivotResultColumns()).toBeNull();

            // setGridOption('pivotMode', current) is a no-op.
            expect(api.isPivotMode()).toBe(true);
            api.setGridOption('pivotMode', true);
            await new GridColumns(
                api,
                `setPivotResultColumns(null) when already null is a safe no-op; setting pivotMode after setGridOption pivotMode`
            ).checkColumns(``);
            await new GridRows(
                api,
                `setPivotResultColumns(null) when already null is a safe no-op; setting pivotMode after setGridOption pivotMode`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.isPivotMode()).toBe(true);
        });
    });

    describe('addValueColumns / removeValueColumns', () => {
        test('addValueColumns adds and getValueColumns reflects', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'gold' }, { field: 'silver' }],
                rowData: [
                    { country: 'UK', gold: 5, silver: 2 },
                    { country: 'UK', gold: 3, silver: 1 },
                ],
            });

            expect(api.getValueColumns()).toEqual([]);
            api.addValueColumns(['gold']);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['gold']);
            api.addValueColumns(['silver']);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['gold', 'silver']);

            await new GridRows(api, 'after addValueColumns gold + silver').check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:8 silver:3
                · ├── LEAF hidden id:0 country:"UK" gold:5 silver:2
                · └── LEAF hidden id:1 country:"UK" gold:3 silver:1
            `);
        });

        // Solved by AG-17366 when it is completed
        test.skip('removeValueColumns removes the listed cols only', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                    { field: 'silver', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'UK', gold: 5, silver: 2 },
                    { country: 'UK', gold: 3, silver: 1 },
                ],
            });
            await new GridColumns(api, `removeValueColumns removes the listed cols only setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── gold "Gold" width:200 aggFunc:sum
                └── silver "Silver" width:200 aggFunc:sum
            `);
            await new GridRows(api, `removeValueColumns removes the listed cols only setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:8 silver:3
                · ├── LEAF hidden id:0 country:"UK" gold:5 silver:2
                · └── LEAF hidden id:1 country:"UK" gold:3 silver:1
            `);

            expect(
                api
                    .getValueColumns()
                    .map((c) => c.getColId())
                    .sort()
            ).toEqual(['gold', 'silver']);
            api.removeValueColumns(['gold']);
            await new GridColumns(api, `removeValueColumns removes the listed cols only after removeValueColumns`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── gold "Gold" width:200
                    └── silver "Silver" width:200 aggFunc:sum
                `);
            await new GridRows(api, `removeValueColumns removes the listed cols only after removeValueColumns`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" silver:3
                    · ├── LEAF hidden id:0 country:"UK" gold:5 silver:2
                    · └── LEAF hidden id:1 country:"UK" gold:3 silver:1
                `
            );
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['silver']);
        });

        // Locks in the runtime-consistency invariant: a column deactivated as a value col must
        // also clear its runtime `getAggFunc()`. `colDef.aggFunc` (initial config) is preserved
        // so re-activation via `addValueColumns` restores the original aggFunc.
        // Solved by AG-17366 when it is completed
        test.skip('removeValueColumns clears runtime aggFunc; addValueColumns restores it from colDef', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold', aggFunc: 'sum' }],
                rowData: [{ gold: 5 }],
            });

            const gold = api.getColumn('gold')!;
            expect(gold.isValueActive()).toBe(true);
            expect(gold.getAggFunc()).toBe('sum');

            api.removeValueColumns(['gold']);
            expect(gold.isValueActive()).toBe(false);
            expect(gold.getAggFunc()).toBeNull();

            api.addValueColumns(['gold']);
            expect(gold.isValueActive()).toBe(true);
            expect(gold.getAggFunc()).toBe('sum');
        });

        // Solved by AG-17366 when it is completed
        test.skip('applyColumnState({ aggFunc: null }) clears runtime aggFunc and deactivates', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold', aggFunc: 'sum' }],
                rowData: [{ gold: 5 }],
            });

            const gold = api.getColumn('gold')!;
            expect(gold.isValueActive()).toBe(true);
            expect(gold.getAggFunc()).toBe('sum');

            api.applyColumnState({ state: [{ colId: 'gold', aggFunc: null }] });
            expect(gold.isValueActive()).toBe(false);
            expect(gold.getAggFunc()).toBeNull();
        });

        // `setColumnAggFunc` must maintain the same `isValueActive() ↔ getAggFunc() != null`
        // invariant the validator now enforces — i.e. setting a non-null aggFunc activates,
        // setting null deactivates.
        // Solved by AG-17366 when it is completed
        test.skip('setColumnAggFunc activates an inactive col when given a non-null aggFunc', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold' }],
                rowData: [{ gold: 5 }],
            });

            const gold = api.getColumn('gold')!;
            expect(gold.isValueActive()).toBe(false);
            expect(gold.getAggFunc()).toBeFalsy();

            api.setColumnAggFunc('gold', 'sum');
            expect(gold.isValueActive()).toBe(true);
            expect(gold.getAggFunc()).toBe('sum');
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['gold']);
        });

        // Solved by AG-17366 when it is completed
        test.skip('setColumnAggFunc(col, null) deactivates an active value col and clears aggFunc', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold', aggFunc: 'sum' }],
                rowData: [{ gold: 5 }],
            });

            const gold = api.getColumn('gold')!;
            expect(gold.isValueActive()).toBe(true);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['gold']);

            api.setColumnAggFunc('gold', null);
            expect(gold.isValueActive()).toBe(false);
            expect(gold.getAggFunc()).toBeNull();
            expect(api.getValueColumns()).toEqual([]);
        });

        test('setColumnAggFunc swapping the aggFunc on an already-active col keeps it active', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold', aggFunc: 'sum' }],
                rowData: [{ gold: 5 }],
            });

            const gold = api.getColumn('gold')!;
            api.setColumnAggFunc('gold', 'max');
            expect(gold.isValueActive()).toBe(true);
            expect(gold.getAggFunc()).toBe('max');
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['gold']);
        });

        test('removeValueColumns with non-value/unknown key leaves the value-col list unchanged', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold', aggFunc: 'sum' }, { field: 'silver' }],
            });
            await new GridColumns(
                api,
                `removeValueColumns with non-value/unknown key leaves the value-col list unchange setup`
            ).checkColumns(`
                CENTER
                ├── gold "Gold" width:200 aggFunc:sum
                └── silver "Silver" width:200
            `);
            await new GridRows(
                api,
                `removeValueColumns with non-value/unknown key leaves the value-col list unchange setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.removeValueColumns(['silver', 'does-not-exist']);
            await new GridColumns(
                api,
                `removeValueColumns with non-value/unknown key leaves the value-col list unchange after removeValueColumns`
            ).checkColumns(`
                CENTER
                ├── gold "Gold" width:200 aggFunc:sum
                └── silver "Silver" width:200
            `);
            await new GridRows(
                api,
                `removeValueColumns with non-value/unknown key leaves the value-col list unchange after removeValueColumns`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['gold']);
        });

        test('addValueColumns with empty list leaves the value-col list unchanged', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold' }],
            });
            await new GridColumns(api, `addValueColumns with empty list leaves the value-col list unchanged setup`)
                .checkColumns(`
                    CENTER
                    └── gold "Gold" width:200
                `);
            await new GridRows(api, `addValueColumns with empty list leaves the value-col list unchanged setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            api.addValueColumns([]);
            await new GridColumns(
                api,
                `addValueColumns with empty list leaves the value-col list unchanged after addValueColumns`
            ).checkColumns(`
                CENTER
                └── gold "Gold" width:200
            `);
            await new GridRows(
                api,
                `addValueColumns with empty list leaves the value-col list unchanged after addValueColumns`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.getValueColumns()).toEqual([]);
        });

        test('initialAggFunc seeds aggFunc when none set on the value col', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', initialAggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'UK', gold: 5 },
                    { country: 'UK', gold: 3 },
                ],
            });
            await new GridColumns(api, `initialAggFunc seeds aggFunc when none set on the value col setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── gold "Gold" width:200 aggFunc:sum
                `);
            await new GridRows(api, `initialAggFunc seeds aggFunc when none set on the value col setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:8
                · ├── LEAF hidden id:0 country:"UK" gold:5
                · └── LEAF hidden id:1 country:"UK" gold:3
            `);

            api.addValueColumns(['gold']);
            await new GridColumns(
                api,
                `initialAggFunc seeds aggFunc when none set on the value col after addValueColumns`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            await new GridRows(api, `initialAggFunc seeds aggFunc when none set on the value col after addValueColumns`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:8
                    · ├── LEAF hidden id:0 country:"UK" gold:5
                    · └── LEAF hidden id:1 country:"UK" gold:3
                `);
            expect(api.getValueColumns()[0].getAggFunc()).toBe('sum');
        });
    });

    describe('setColumnAggFunc', () => {
        test('undefined and unknown keys are both safe no-ops', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'gold' }],
            });
            await new GridColumns(api, `undefined and unknown keys are both safe no-ops setup`).checkColumns(`
                CENTER
                └── gold "Gold" width:200
            `);
            await new GridRows(api, `undefined and unknown keys are both safe no-ops setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.setColumnAggFunc(undefined as any, 'sum');
            await new GridColumns(api, `undefined and unknown keys are both safe no-ops after setColumnAggFunc`)
                .checkColumns(`
                    CENTER
                    └── gold "Gold" width:200
                `);
            await new GridRows(api, `undefined and unknown keys are both safe no-ops after setColumnAggFunc`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.getValueColumns()).toEqual([]);

            api.setColumnAggFunc('does-not-exist', 'sum');
            await new GridColumns(api, `undefined and unknown keys are both safe no-ops after setColumnAggFunc #2`)
                .checkColumns(`
                    CENTER
                    └── gold "Gold" width:200
                `);
            await new GridRows(api, `undefined and unknown keys are both safe no-ops after setColumnAggFunc #2`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
            expect(api.getValueColumns()).toEqual([]);
        });
    });

    describe('applyColumnState with aggFunc', () => {
        // Solved by AG-17366 when it is completed
        test.skip('non-string aggFunc in state is rejected with a warning (value col left unchanged)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'UK', gold: 5 }],
            });
            await new GridColumns(
                api,
                `non-string aggFunc in state is rejected with a warning (value col left unchanged setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `non-string aggFunc in state is rejected with a warning (value col left unchanged setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:5
                · └── LEAF hidden id:0 country:"UK" gold:5
            `);

            // Object/function aggFuncs in state are rejected per `_warn(33)`.
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            api.applyColumnState({
                state: [{ colId: 'gold', aggFunc: { name: 'bad' } as any }],
            });
            await new GridColumns(
                api,
                `non-string aggFunc in state is rejected with a warning (value col left unchanged after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `non-string aggFunc in state is rejected with a warning (value col left unchanged after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:5
                · └── LEAF hidden id:0 country:"UK" gold:5
            `);
            expect(consoleWarnSpy.mock.calls[0][0]).toContain('warning #33');
            consoleWarnSpy.mockRestore();

            // The previously-active value column may be deactivated, but the grid stays coherent.
            expect(api.getColumn('gold')).toBeTruthy();
        });

        test('string aggFunc in state activates the col as a value col', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'gold' }],
                rowData: [{ country: 'UK', gold: 5 }],
            });
            await new GridColumns(api, `string aggFunc in state activates the col as a value col setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └── gold "Gold" width:200
                `
            );
            await new GridRows(api, `string aggFunc in state activates the col as a value col setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK"
                · └── LEAF hidden id:0 country:"UK" gold:5
            `);

            expect(api.getValueColumns()).toEqual([]);
            api.applyColumnState({ state: [{ colId: 'gold', aggFunc: 'sum' }] });
            await new GridColumns(
                api,
                `string aggFunc in state activates the col as a value col after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── gold "Gold" width:200 aggFunc:sum
            `);
            await new GridRows(api, `string aggFunc in state activates the col as a value col after applyColumnState`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-country-UK ag-Grid-AutoColumn:"UK" gold:5
                    · └── LEAF hidden id:0 country:"UK" gold:5
                `);
            expect(api.getValueColumns().map((c) => c.getColId())).toEqual(['gold']);
        });
    });

    describe('moveRowGroupColumn', () => {
        test('reorders row group columns and grouping reflects new order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'sport', rowGroup: true, hide: true },
                    { field: 'gold' },
                ],
                rowData: [
                    { country: 'UK', sport: 'Swim', gold: 1 },
                    { country: 'UK', sport: 'Run', gold: 2 },
                    { country: 'US', sport: 'Swim', gold: 3 },
                ],
                groupDefaultExpanded: -1,
            });

            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country', 'sport']);
            api.moveRowGroupColumn(0, 1);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['sport', 'country']);

            // Re-grouping happens on next refresh; after the move the grouping order should be sport→country
            await new GridRows(api, 'after moveRowGroupColumn(0,1)').check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:row-group-sport-Swim ag-Grid-AutoColumn:"Swim"
                │ ├─┬ LEAF_GROUP id:row-group-sport-Swim-country-UK ag-Grid-AutoColumn:"UK"
                │ │ └── LEAF id:0 country:"UK" sport:"Swim" gold:1
                │ └─┬ LEAF_GROUP id:row-group-sport-Swim-country-US ag-Grid-AutoColumn:"US"
                │ · └── LEAF id:2 country:"US" sport:"Swim" gold:3
                └─┬ filler id:row-group-sport-Run ag-Grid-AutoColumn:"Run"
                · └─┬ LEAF_GROUP id:row-group-sport-Run-country-UK ag-Grid-AutoColumn:"UK"
                · · └── LEAF id:1 country:"UK" sport:"Run" gold:2
            `);
        });

        test('with no row groups, row group list stays empty', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'a' }],
            });
            await new GridColumns(api, `with no row groups, row group list stays empty setup`).checkColumns(`
                CENTER
                └── a "A" width:200
            `);
            await new GridRows(api, `with no row groups, row group list stays empty setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.moveRowGroupColumn(0, 0);
            expect(api.getRowGroupColumns()).toEqual([]);
            await new GridRows(api, `with no row groups, row group list stays empty final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('move(N, N) with row groups present is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', rowGroup: true },
                ],
            });
            await new GridColumns(api, `move(N, N) with row groups present is a no-op setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country "Country" width:200 rowGroup
                └── sport "Sport" width:200 rowGroup
            `);
            await new GridRows(api, `move(N, N) with row groups present is a no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.moveRowGroupColumn(1, 1);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country', 'sport']);
            await new GridRows(api, `move(N, N) with row groups present is a no-op final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        // Solved by AG-17366 when it is completed
        test.skip('toIndex past the end clamps to last slot; fromIndex out of range is a no-op', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', rowGroup: true },
                    { field: 'year', rowGroup: true },
                ],
            });
            await new GridColumns(
                api,
                `toIndex past the end clamps to last slot; fromIndex out of range is a no-op setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country "Country" width:200 rowGroup
                ├── sport "Sport" width:200 rowGroup
                └── year "Year" width:200 rowGroup
            `);
            await new GridRows(api, `toIndex past the end clamps to last slot; fromIndex out of range is a no-op setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            // Move 'country' (index 0) to index 99 — clamped to last (index 2)
            api.moveRowGroupColumn(0, 99);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['sport', 'year', 'country']);

            // Bad fromIndex — no column at that index, list unchanged
            api.moveRowGroupColumn(99, 0);
            api.moveRowGroupColumn(-1, 0);
            const cols = api.getRowGroupColumns();
            expect(cols.every((c) => c != null)).toBe(true);
            expect(cols.map((c) => c.getColId())).toEqual(['sport', 'year', 'country']);
            await new GridRows(
                api,
                `toIndex past the end clamps to last slot; fromIndex out of range is a no-op final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('negative toIndex clamps to 0 (move-to-front)', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', rowGroup: true },
                    { field: 'year', rowGroup: true },
                ],
            });
            await new GridColumns(api, `negative toIndex clamps to 0 (move-to-front) setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country "Country" width:200 rowGroup
                ├── sport "Sport" width:200 rowGroup
                └── year "Year" width:200 rowGroup
            `);
            await new GridRows(api, `negative toIndex clamps to 0 (move-to-front) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.moveRowGroupColumn(2, -5);
            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['year', 'country', 'sport']);
            await new GridRows(api, `negative toIndex clamps to 0 (move-to-front) final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        // Solved by AG-17366 when it is completed
        test.skip('leftward move reports impacted columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { field: 'country', rowGroup: true },
                    { field: 'sport', rowGroup: true },
                    { field: 'year', rowGroup: true },
                ],
            });
            await new GridColumns(api, `leftward move reports impacted columns setup`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country "Country" width:200 rowGroup
                ├── sport "Sport" width:200 rowGroup
                └── year "Year" width:200 rowGroup
            `);
            await new GridRows(api, `leftward move reports impacted columns setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            let receivedImpacted: string[] | null = null;
            api.addEventListener('columnRowGroupChanged', (e) => {
                if (e.source === 'api') {
                    receivedImpacted = e.columns?.map((c: any) => c.getColId()) ?? null;
                }
            });

            // Leftward move 2 → 0: every column in [0..2] shifted
            api.moveRowGroupColumn(2, 0);
            await asyncSetTimeout(0);

            expect(receivedImpacted).toEqual(['country', 'sport', 'year']);
            await new GridRows(api, `leftward move reports impacted columns final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('isColumnFilterPresent', () => {
        test('false when no filter is applied', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: true }],
                rowData: [{ name: 'a' }, { name: 'b' }],
            });
            await new GridColumns(api, `false when no filter is applied setup`).checkColumns(`
                CENTER
                └── name "Name" width:200
            `);
            await new GridRows(api, `false when no filter is applied setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"a"
                └── LEAF id:1 name:"b"
            `);

            expect(api.isColumnFilterPresent()).toBe(false);
            await new GridRows(api, `false when no filter is applied final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"a"
                └── LEAF id:1 name:"b"
            `);
        });

        test('true once a column filter is applied, then false after destroyFilter', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
                rowData: [{ name: 'a' }, { name: 'b' }],
            });
            await new GridColumns(api, `true once a column filter is applied, then false after destroyFilter setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `true once a column filter is applied, then false after destroyFilter setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"a"
                    └── LEAF id:1 name:"b"
                `
            );

            await api.setColumnFilterModel('name', { filterType: 'text', type: 'equals', filter: 'a' });
            api.onFilterChanged();
            expect(api.isColumnFilterPresent()).toBe(true);

            api.destroyFilter('name');
            expect(api.isColumnFilterPresent()).toBe(false);
            await new GridRows(api, `true once a column filter is applied, then false after destroyFilter final state`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"a"
                    └── LEAF id:1 name:"b"
                `);
        });

        test('destroyFilter on non-existent column key leaves filter state unchanged', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ field: 'name', filter: true }],
            });
            await new GridColumns(api, `destroyFilter on non-existent column key leaves filter state unchanged setup`)
                .checkColumns(`
                    CENTER
                    └── name "Name" width:200
                `);
            await new GridRows(api, `destroyFilter on non-existent column key leaves filter state unchanged setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            api.destroyFilter('does-not-exist');
            expect(api.isColumnFilterPresent()).toBe(false);
            await new GridRows(
                api,
                `destroyFilter on non-existent column key leaves filter state unchanged final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('edge cases — applyColumnState', () => {
        test('non-existent colId in state is ignored; method returns false to signal partial success', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            const result = api.applyColumnState({
                state: [{ colId: 'a', hide: true }, { colId: 'does-not-exist', hide: true } as any],
            });
            // Partial success — recognised cols apply; unknown colIds yield `false` return
            expect(result).toBe(false);
            expect(api.getColumn('a')!.isVisible()).toBe(false);
            expect(api.getColumn('b')!.isVisible()).toBe(true);

            await new GridColumns(api, 'after applyColumnState with one unknown id').checkColumns(`
                CENTER
                └── b width:200
            `);
        });

        test('defaultState applies to all cols not in state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.applyColumnState({ defaultState: { hide: true } });
            expect(api.getColumn('a')!.isVisible()).toBe(false);
            expect(api.getColumn('b')!.isVisible()).toBe(false);

            await new GridColumns(api, 'all hidden via defaultState').checkColumns(`

            `);
        });

        test('applyOrder reorders cols to match state order', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            api.applyColumnState({
                state: [{ colId: 'c' }, { colId: 'a' }, { colId: 'b' }],
                applyOrder: true,
            });
            expect(api.getAllGridColumns().map((c) => c.getColId())).toEqual(['c', 'a', 'b']);

            await new GridColumns(api, 'after applyColumnState applyOrder c,a,b').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
        });
    });

    describe('edge cases — setColumnsPinned', () => {
        test('null unpins the columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { colId: 'a', pinned: 'left' },
                    { colId: 'b', pinned: 'right' },
                ],
            });

            api.setColumnsPinned(['a', 'b'], null);
            expect(api.getColumn('a')!.getPinned()).toBeNull();
            expect(api.getColumn('b')!.getPinned()).toBeNull();

            await new GridColumns(api, 'after unpinning both').checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
        });

        test('mix of valid and invalid keys pins only valid ones', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setColumnsPinned(['a', 'does-not-exist'], 'left');
            expect(api.getColumn('a')!.getPinned()).toBe('left');
            expect(api.getColumn('b')!.getPinned()).toBeNull();

            await new GridColumns(api, 'a pinned left; unknown key ignored').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── b width:200
            `);
        });

        test('empty list leaves pinning unchanged', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }],
            });
            await new GridColumns(api, `empty list leaves pinning unchanged setup`).checkColumns(`
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `empty list leaves pinning unchanged setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.setColumnsPinned([], 'left');
            await new GridColumns(api, `empty list leaves pinning unchanged after setColumnsPinned`).checkColumns(`
                CENTER
                └── a width:200
            `);
            expect(api.getColumn('a')!.getPinned()).toBeNull();
        });
    });

    describe('edge cases — setColumnsVisible', () => {
        test('duplicate keys are handled idempotently', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setColumnsVisible(['a', 'a', 'a'], false);
            expect(api.getColumn('a')!.isVisible()).toBe(false);

            await new GridColumns(api, 'a hidden after duplicate-key set').checkColumns(`
                CENTER
                └── b width:200
            `);
        });

        test('non-existent keys leave the named valid keys taking effect', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });

            api.setColumnsVisible(['a', 'does-not-exist'], false);
            expect(api.getColumn('a')!.isVisible()).toBe(false);
            expect(api.getColumn('b')!.isVisible()).toBe(true);

            await new GridColumns(api, 'a hidden; unknown key ignored').checkColumns(`
                CENTER
                └── b width:200
            `);
        });
    });

    describe('edge cases — getColumn lookups', () => {
        test('returns null for non-existent key, field when no colId', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { field: 'name' }],
            });

            expect(api.getColumn('does-not-exist')).toBeNull();
            expect(api.getColumn('name')?.getColDef().field).toBe('name');

            await new GridColumns(api, 'a hidden; unknown key ignored').checkColumns(`
                CENTER
                ├── a width:200
                └── name "Name" width:200
            `);
        });

        // Solved by AG-17366 when it is completed
        test.skip('looks up by ColDef ref (object identity)', async () => {
            const def: ColDef = { colId: 'a' };
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [def],
            });
            await new GridColumns(api, `looks up by ColDef ref (object identity) setup`).checkColumns(`
                CENTER
                └── a width:200
            `);
            await new GridRows(api, `looks up by ColDef ref (object identity) setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const byRef = api.getColumn(def as any);
            expect(byRef).toBeTruthy();
            expect(byRef!.getColId()).toBe('a');
            await new GridRows(api, `looks up by ColDef ref (object identity) final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('edge cases — setColumnGroupOpened', () => {
        test('invalid group key leaves existing groups in their default state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });

            api.setColumnGroupOpened('does-not-exist', true);
            const state = api.getColumnGroupState();
            const g1 = state.find((s) => s.groupId === 'g1');
            expect(g1?.open).toBe(false);

            await new GridColumns(api, 'g1 closed — only a visible').checkColumns(`
                CENTER
                └─┬ GROUP closed
                  ├── a width:200
                  └── b width:200 columnGroupShow:open hidden
            `);
        });

        test('opening flips expandable group expansion state', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'g1',
                        children: [{ colId: 'a' }, { colId: 'b', columnGroupShow: 'open' }],
                    },
                ],
            });

            api.setColumnGroupOpened('g1', true);
            const state = api.getColumnGroupState();
            const g1 = state.find((s) => s.groupId === 'g1');
            expect(g1?.open).toBe(true);

            await new GridColumns(api, 'g1 opened — b becomes visible').checkColumns(`
                CENTER
                └─┬ GROUP open
                  ├── a width:200
                  └── b width:200 columnGroupShow:open
            `);
        });
    });

    describe('edge cases — setPivotColumns outside pivot mode', () => {
        test('still stores pivot columns even when pivotMode is false', async () => {
            const api = gridsManager.createGrid('myGrid', {
                pivotMode: false,
                columnDefs: [{ field: 'country' }, { field: 'year' }],
            });

            api.setPivotColumns(['country']);
            expect(api.getPivotColumns().map((c) => c.getColId())).toEqual(['country']);

            await new GridColumns(api, 'setPivotColumns').checkColumns(`
                CENTER
                ├── country "Country" width:200 pivot
                └── year "Year" width:200
            `);
        });
    });

    describe('edge cases — resetColumnState', () => {
        test('reset restores initial colDef order/visibility/pinning', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a', initialPinned: 'left' }, { colId: 'b', initialHide: true }, { colId: 'c' }],
            });

            api.setColumnsVisible(['b'], true);
            api.setColumnsPinned(['a'], null);
            api.resetColumnState();

            expect(api.getColumn('a')!.getPinned()).toBe('left');
            expect(api.getColumn('b')!.isVisible()).toBe(false);

            await new GridColumns(api, 'after resetColumnState — a pinned left, b hidden').checkColumns(`
                LEFT
                └── a width:200
                CENTER
                └── c width:200
            `);
        });
    });
});
