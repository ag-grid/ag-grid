/**
 * Split from column-mutations.test.ts — see sibling files for related coverage.
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs.
 */
import type { ColDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

describe('Column Mutations - applyColumnState', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            PivotModule,
            RowSelectionModule,
            RowNumbersModule,
            TreeDataModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    describe('applyColumnState resilience', () => {
        test('unknown colIds in state are ignored, valid colIds updated', async () => {
            const api = gridsManager.createGrid('unknownState', {
                columnDefs: [
                    { colId: 'a', width: 100 },
                    { colId: 'b', width: 100 },
                ],
            });
            await new GridColumns(api, `unknown colIds in state are ignored, valid colIds updated setup`).checkColumns(
                `
                    CENTER
                    ├── a width:100
                    └── b width:100
                `
            );
            await new GridRows(api, `unknown colIds in state are ignored, valid colIds updated setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            expect(() =>
                api.applyColumnState({
                    state: [
                        { colId: 'a', width: 175 },
                        { colId: 'does-not-exist', width: 999 },
                        { colId: 'also-fake', sort: 'asc' },
                        { colId: 'b', width: 225 },
                    ],
                })
            ).not.toThrow();

            const widths = Object.fromEntries(api.getColumnState().map((s) => [s.colId, s.width]));
            expect(widths['a']).toBe(175);
            expect(widths['b']).toBe(225);
            expect(widths['does-not-exist']).toBeUndefined();
            expect(widths['also-fake']).toBeUndefined();
            await new GridRows(api, `unknown colIds in state are ignored, valid colIds updated final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });
    });

    describe('setColumnsVisible idempotence', () => {
        test('setting same visibility twice does not refire columnVisible event', async () => {
            const api = gridsManager.createGrid('idempotent', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            await new GridColumns(api, `setting same visibility twice does not refire columnVisible event setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `setting same visibility twice does not refire columnVisible event setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            let eventCount = 0;
            api.addEventListener('columnVisible', () => {
                eventCount++;
            });

            api.setColumnsVisible(['a'], false);
            await new GridColumns(
                api,
                `setting same visibility twice does not refire columnVisible event after setColumnsVisible`
            ).checkColumns(`
                CENTER
                └── b width:200
            `);
            await asyncSetTimeout(0);
            expect(eventCount).toBe(1);

            api.setColumnsVisible(['a'], false);
            await new GridColumns(
                api,
                `setting same visibility twice does not refire columnVisible event after setColumnsVisible #2`
            ).checkColumns(`
                CENTER
                └── b width:200
            `);
            await asyncSetTimeout(0);
            expect(eventCount).toBe(1);

            api.setColumnsVisible(['a'], true);
            await new GridColumns(
                api,
                `setting same visibility twice does not refire columnVisible event after setColumnsVisible #3`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await asyncSetTimeout(0);
            expect(eventCount).toBe(2);
        });
    });

    describe('getColumnDefs rowGroupIndex / pivotIndex', () => {
        test('rowGroupIndex reflects row-group ordering in exported defs', async () => {
            const api = gridsManager.createGrid('rgIndex', {
                columnDefs: [
                    { colId: 'a' },
                    { colId: 'b', rowGroup: true, rowGroupIndex: 1 },
                    { colId: 'c', rowGroup: true, rowGroupIndex: 0 },
                ],
                rowData: [{ a: 1, b: 'x', c: 'y' }],
            });
            await new GridColumns(api, `rowGroupIndex reflects row-group ordering in exported defs setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── a width:200
                    ├── b width:200 rowGroup rowGroupIndex:1
                    └── c width:200 rowGroup rowGroupIndex:0
                `
            );
            await new GridRows(api, `rowGroupIndex reflects row-group ordering in exported defs setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler collapsed id:row-group-c- ag-Grid-AutoColumn:"(Blanks)"
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-c--b- ag-Grid-AutoColumn:"(Blanks)"
                · · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            const defs = api.getColumnDefs()! as ColDef[];
            const byId = Object.fromEntries(defs.map((d) => [d.colId, d]));
            expect(byId['b'].rowGroup).toBe(true);
            expect(byId['c'].rowGroup).toBe(true);
            expect(byId['b'].rowGroupIndex).toBe(1);
            expect(byId['c'].rowGroupIndex).toBe(0);
            expect(byId['a'].rowGroup).toBeFalsy();
            await new GridRows(api, `rowGroupIndex reflects row-group ordering in exported defs final state`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ filler collapsed id:row-group-c- ag-Grid-AutoColumn:"(Blanks)"
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-c--b- ag-Grid-AutoColumn:"(Blanks)"
                · · └── LEAF hidden id:0
            `);
        });

        test('pivotIndex reflects pivot ordering in exported defs', async () => {
            const api = gridsManager.createGrid('pivIndex', {
                columnDefs: [
                    { colId: 'a' },
                    { colId: 'b', pivot: true, pivotIndex: 1 },
                    { colId: 'c', pivot: true, pivotIndex: 0 },
                    { colId: 'val', aggFunc: 'sum' },
                ],
                pivotMode: true,
                rowData: [{ a: 1, b: 'x', c: 'y', val: 5 }],
            });
            await new GridColumns(api, `pivotIndex reflects pivot ordering in exported defs setup`).checkColumns(`
                CENTER
                └─┬ GROUP closed
                  ├─┬ GROUP hidden
                  │ └── pivot_c-b_-_val width:200 columnGroupShow:open hidden
                  └── pivot_c-b__val width:200 columnGroupShow:closed
            `);
            await new GridRows(api, `pivotIndex reflects pivot ordering in exported defs setup`).check(`
                ROOT id:ROOT_NODE_ID pivot_c-b_-_val:null pivot_c-b__val:null
                ROOT id:ROOT_NODE_ID pivot_c-b_-_val:null pivot_c-b__val:null
                └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            const defs = api.getColumnDefs()! as ColDef[];
            const byId = Object.fromEntries(defs.map((d) => [d.colId, d]));
            expect(byId['b'].pivot).toBe(true);
            expect(byId['c'].pivot).toBe(true);
            expect(byId['b'].pivotIndex).toBe(1);
            expect(byId['c'].pivotIndex).toBe(0);
            await new GridRows(api, `pivotIndex reflects pivot ordering in exported defs final state`).check(`
                ROOT id:ROOT_NODE_ID pivot_c-b_-_val:null pivot_c-b__val:null
                ROOT id:ROOT_NODE_ID pivot_c-b_-_val:null pivot_c-b__val:null
                └── LEAF hidden id:0
            `);
        });
    });

    describe('applyColumnState with applyOrder including auto cols', () => {
        test('applyOrder repositions the auto-group col among user cols', async () => {
            const api = gridsManager.createGrid('applyOrderAuto', {
                columnDefs: [{ colId: 'country', rowGroup: true }, { colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                rowData: [{ country: 'USA', a: 1, b: 2, c: 3 }],
            });
            await new GridColumns(api, `applyOrder repositions the auto-group col among user cols setup`).checkColumns(
                `
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── country width:200 rowGroup
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `
            );
            await new GridRows(api, `applyOrder repositions the auto-group col among user cols setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            api.applyColumnState({
                state: [
                    { colId: 'a' },
                    { colId: 'ag-Grid-AutoColumn' },
                    { colId: 'b' },
                    { colId: 'c' },
                    { colId: 'country' },
                ],
                applyOrder: true,
            });
            await new GridColumns(
                api,
                `applyOrder repositions the auto-group col among user cols after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── a width:200
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── b width:200
                ├── c width:200
                └── country width:200 rowGroup
            `);
            await new GridRows(api, `applyOrder repositions the auto-group col among user cols after applyColumnState`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)"
                    · └── LEAF hidden id:0
                `);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            const autoIdx = order.indexOf('ag-Grid-AutoColumn');
            const aIdx = order.indexOf('a');
            const bIdx = order.indexOf('b');
            expect(autoIdx).toBeGreaterThan(aIdx);
            expect(autoIdx).toBeLessThan(bIdx);
        });

        test('applyOrder dedupes repeated colIds in state', async () => {
            const api = gridsManager.createGrid('applyOrderDupes', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(api, `applyOrder dedupes repeated colIds in state setup`).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(api, `applyOrder dedupes repeated colIds in state setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            // Duplicate 'b' should be honoured once at its first occurrence and ignored after.
            api.applyColumnState({
                state: [{ colId: 'b' }, { colId: 'b' }, { colId: 'a' }, { colId: 'c' }],
                applyOrder: true,
            });
            await new GridColumns(api, `applyOrder dedupes repeated colIds in state after applyColumnState`)
                .checkColumns(`
                    CENTER
                    ├── b width:200
                    ├── a width:200
                    └── c width:200
                `);
            await new GridRows(api, `applyOrder dedupes repeated colIds in state after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['b', 'a', 'c']);
        });

        test('applyOrder skips unknown colIds without disturbing known cols', async () => {
            const api = gridsManager.createGrid('applyOrderUnknown', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(api, `applyOrder skips unknown colIds without disturbing known cols setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `);
            await new GridRows(api, `applyOrder skips unknown colIds without disturbing known cols setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            api.applyColumnState({
                state: [{ colId: 'c' }, { colId: 'ghost' }, { colId: 'a' }],
                applyOrder: true,
            });
            await new GridColumns(
                api,
                `applyOrder skips unknown colIds without disturbing known cols after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `applyOrder skips unknown colIds without disturbing known cols after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            // 'b' is unmatched → goes to the end (normal-misses bucket).
            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['c', 'a', 'b']);
        });

        test('applyOrder respects lockPosition cols', async () => {
            const api = gridsManager.createGrid('applyOrderLocked', {
                columnDefs: [
                    { colId: 'lockedLeft', lockPosition: 'left' },
                    { colId: 'a' },
                    { colId: 'b' },
                    { colId: 'lockedRight', lockPosition: 'right' },
                ],
            });
            await new GridColumns(api, `applyOrder respects lockPosition cols setup`).checkColumns(`
                CENTER
                ├── lockedLeft width:200 lockPosition:left
                ├── a width:200
                ├── b width:200
                └── lockedRight width:200 lockPosition:right
            `);
            await new GridRows(api, `applyOrder respects lockPosition cols setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            // Try to put locked cols in the middle — they should still snap to their locked positions.
            api.applyColumnState({
                state: [{ colId: 'a' }, { colId: 'lockedRight' }, { colId: 'lockedLeft' }, { colId: 'b' }],
                applyOrder: true,
            });
            await new GridColumns(api, `applyOrder respects lockPosition cols after applyColumnState`).checkColumns(`
                CENTER
                ├── lockedLeft width:200 lockPosition:left
                ├── a width:200
                ├── b width:200
                └── lockedRight width:200 lockPosition:right
            `);
            await new GridRows(api, `applyOrder respects lockPosition cols after applyColumnState`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order[0]).toBe('lockedLeft');
            expect(order[order.length - 1]).toBe('lockedRight');
            // 'a' and 'b' are between, in state order.
            expect(order.slice(1, -1)).toEqual(['a', 'b']);
        });

        test('applyOrder respects marryChildren — order that would split a married group is rejected', async () => {
            const api = gridsManager.createGrid('applyOrderMarry', {
                columnDefs: [
                    {
                        headerName: 'Married',
                        marryChildren: true,
                        children: [{ colId: 'm1' }, { colId: 'm2' }],
                    },
                    { colId: 'a' },
                    { colId: 'b' },
                ],
            });
            await new GridColumns(
                api,
                `applyOrder respects marryChildren — order that would split a married group is re setup`
            ).checkColumns(`
                CENTER
                ├─┬ "Married" GROUP marryChildren
                │ ├── m1 width:200
                │ └── m2 width:200
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `applyOrder respects marryChildren — order that would split a married group is re setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            // Try to reorder so that 'a' sits between 'm1' and 'm2' — would split the married group.
            // Rejection legitimately logs warning #39 — silence the noise and assert it fires.
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
            api.applyColumnState({
                state: [{ colId: 'm1' }, { colId: 'a' }, { colId: 'm2' }, { colId: 'b' }],
                applyOrder: true,
            });
            await new GridColumns(
                api,
                `applyOrder respects marryChildren — order that would split a married group is re after applyColumnState`
            ).checkColumns(`
                CENTER
                ├─┬ "Married" GROUP marryChildren
                │ ├── m1 width:200
                │ └── m2 width:200
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `applyOrder respects marryChildren — order that would split a married group is re after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);
            expect(consoleWarnSpy.mock.calls[0][0]).toContain('warning #39');
            consoleWarnSpy.mockRestore();

            // Reorder should be rejected — original order preserved.
            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['m1', 'm2', 'a', 'b']);
        });

        test('applyOrder respects marryChildren — order that keeps married group together is accepted', async () => {
            const api = gridsManager.createGrid('applyOrderMarryPass', {
                columnDefs: [
                    {
                        headerName: 'Married',
                        marryChildren: true,
                        children: [{ colId: 'm1' }, { colId: 'm2' }],
                    },
                    { colId: 'a' },
                ],
            });
            await new GridColumns(
                api,
                `applyOrder respects marryChildren — order that keeps married group together is a setup`
            ).checkColumns(`
                CENTER
                ├─┬ "Married" GROUP marryChildren
                │ ├── m1 width:200
                │ └── m2 width:200
                └── a width:200
            `);
            await new GridRows(
                api,
                `applyOrder respects marryChildren — order that keeps married group together is a setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            // Move the entire married group AFTER 'a' — should be allowed.
            api.applyColumnState({
                state: [{ colId: 'a' }, { colId: 'm1' }, { colId: 'm2' }],
                applyOrder: true,
            });
            await new GridColumns(
                api,
                `applyOrder respects marryChildren — order that keeps married group together is a after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └─┬ "Married" GROUP marryChildren
                  ├── m1 width:200
                  └── m2 width:200
            `);
            await new GridRows(
                api,
                `applyOrder respects marryChildren — order that keeps married group together is a after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['a', 'm1', 'm2']);
        });

        test('moveColumns to a valid position is accepted with marryChildren', async () => {
            // Positive companion to column-edge-cases' "marryChildren prevents column separation"
            // — verifies the guard only blocks INVALID moves, not all moves.
            const api = gridsManager.createGrid('marryMoveValid', {
                columnDefs: [
                    {
                        headerName: 'Married',
                        marryChildren: true,
                        children: [{ colId: 'm1' }, { colId: 'm2' }],
                    },
                    { colId: 'a' },
                    { colId: 'b' },
                ],
            });
            await new GridColumns(api, `moveColumns to a valid position is accepted with marryChildren setup`)
                .checkColumns(`
                    CENTER
                    ├─┬ "Married" GROUP marryChildren
                    │ ├── m1 width:200
                    │ └── m2 width:200
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `moveColumns to a valid position is accepted with marryChildren setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            // Move the entire married group to the end — valid; group stays together.
            api.moveColumns(['m1', 'm2'], 2);
            await new GridColumns(
                api,
                `moveColumns to a valid position is accepted with marryChildren after moveColumns`
            ).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └─┬ "Married" GROUP marryChildren
                  ├── m1 width:200
                  └── m2 width:200
            `);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['a', 'b', 'm1', 'm2']);
        });

        test('adding marryChildren via setGridOption activates the guard', async () => {
            // Starts with no marryChildren — guard is a fast-path no-op (verified by valid
            // mid-group move succeeding). After setGridOption introduces marryChildren, the
            // guard wakes up and rejects the same invalid move.
            const api = gridsManager.createGrid('marryAddViaDefs', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await asyncSetTimeout(0);

            // No marryChildren — moving 'c' between 'a' and 'b' is allowed.
            api.moveColumns(['c'], 1);
            await asyncSetTimeout(0);
            expect(api.getAllDisplayedColumns().map((c) => c.getColId())).toEqual(['a', 'c', 'b']);

            // Reset order.
            api.moveColumns(['c'], 2);
            await asyncSetTimeout(0);

            // Now wrap a + b in a marryChildren group.
            api.setGridOption('columnDefs', [
                { headerName: 'AB', marryChildren: true, children: [{ colId: 'a' }, { colId: 'b' }] },
                { colId: 'c' },
            ]);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after marryChildren added').checkColumns(`
                CENTER
                ├─┬ "AB" GROUP marryChildren
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);

            // Same move should now be REJECTED.
            api.moveColumns(['c'], 1);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after split-attempt with guard active').checkColumns(`
                CENTER
                ├─┬ "AB" GROUP marryChildren
                │ ├── a width:200
                │ └── b width:200
                └── c width:200
            `);
            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            const aIdx = order.indexOf('a');
            const bIdx = order.indexOf('b');
            expect(Math.abs(aIdx - bIdx)).toBe(1);
        });

        test('removing marryChildren via setGridOption deactivates the guard', async () => {
            const api = gridsManager.createGrid('marryRemoveViaDefs', {
                columnDefs: [
                    { headerName: 'AB', marryChildren: true, children: [{ colId: 'a' }, { colId: 'b' }] },
                    { colId: 'c' },
                ],
            });
            await asyncSetTimeout(0);

            // Initially, marryChildren prevents the move.
            api.moveColumns(['c'], 1);
            await asyncSetTimeout(0);
            let order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(Math.abs(order.indexOf('a') - order.indexOf('b'))).toBe(1);

            // Remove the marryChildren wrapper — guard should now be inactive.
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after marryChildren removed').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Same move now succeeds.
            api.moveColumns(['c'], 1);
            await asyncSetTimeout(0);
            await new GridColumns(api, 'cols after split move allowed').checkColumns(`
                CENTER
                ├── a width:200
                ├── c width:200
                └── b width:200
            `);
            order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['a', 'c', 'b']);
        });

        test('marryChildren with single child does not block any move', async () => {
            // `leafCount <= 1` early-return path in `doesMovePassMarryChildren`.
            const api = gridsManager.createGrid('marrySingle', {
                columnDefs: [
                    { headerName: 'Solo', marryChildren: true, children: [{ colId: 's' }] },
                    { colId: 'a' },
                    { colId: 'b' },
                ],
            });
            await new GridColumns(api, `marryChildren with single child does not block any move setup`).checkColumns(
                `
                    CENTER
                    ├─┬ "Solo" GROUP marryChildren
                    │ └── s width:200
                    ├── a width:200
                    └── b width:200
                `
            );
            await new GridRows(api, `marryChildren with single child does not block any move setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            api.moveColumns(['a'], 0);
            await new GridColumns(api, `marryChildren with single child does not block any move after moveColumns`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    ├─┬ "Solo" GROUP marryChildren
                    │ └── s width:200
                    └── b width:200
                `);
            await asyncSetTimeout(0);
            expect(api.getAllDisplayedColumns().map((c) => c.getColId())).toEqual(['a', 's', 'b']);
        });

        test('marryChildren flag tracks active tree across pivot mode toggle', async () => {
            // Primary tree has a marryChildren group; pivot tree (generated, no marryChildren).
            // The active flag must follow the active tree — and the guard must reactivate when
            // we exit pivot mode and the primary tree returns to active.
            const api = gridsManager.createGrid('marryPivotToggle', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    {
                        headerName: 'Married',
                        marryChildren: true,
                        children: [{ colId: 'm1', enablePivot: true }, { colId: 'm2' }],
                    },
                    { colId: 'value', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'USA', m1: 'a', m2: 'b', value: 1 }],
            });
            await new GridColumns(api, `marryChildren flag tracks active tree across pivot mode toggle setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── country width:200 rowGroup
                    ├─┬ "Married" GROUP marryChildren
                    │ ├── m1 width:200
                    │ └── m2 width:200
                    └── value width:200 aggFunc:sum
                `);
            await new GridRows(api, `marryChildren flag tracks active tree across pivot mode toggle setup`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" value:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            // Primary mode: guard active, splitting move rejected.
            api.moveColumns(['value'], 1);
            await new GridColumns(
                api,
                `marryChildren flag tracks active tree across pivot mode toggle after moveColumns`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── value width:200 aggFunc:sum
                ├── country width:200 rowGroup
                └─┬ "Married" GROUP marryChildren
                  ├── m1 width:200
                  └── m2 width:200
            `);
            await asyncSetTimeout(0);
            let order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(Math.abs(order.indexOf('m1') - order.indexOf('m2'))).toBe(1);

            // Enter pivot mode — pivot result tree is in play (no marryChildren).
            api.setGridOption('pivotMode', true);
            await new GridColumns(
                api,
                `marryChildren flag tracks active tree across pivot mode toggle after setGridOption pivotMode`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └── value width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `marryChildren flag tracks active tree across pivot mode toggle after setGridOption pivotMode`
            ).check(`
                ROOT id:ROOT_NODE_ID value:null
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" value:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            // Exit pivot mode — primary tree is active again; guard should still work.
            api.setGridOption('pivotMode', false);
            await new GridColumns(
                api,
                `marryChildren flag tracks active tree across pivot mode toggle after setGridOption pivotMode #2`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── value width:200 aggFunc:sum
                ├── country width:200 rowGroup
                └─┬ "Married" GROUP marryChildren
                  ├── m1 width:200
                  └── m2 width:200
            `);
            await new GridRows(
                api,
                `marryChildren flag tracks active tree across pivot mode toggle after setGridOption pivotMode #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" value:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            // Same split attempt — still rejected.
            api.moveColumns(['value'], 2);
            await new GridColumns(
                api,
                `marryChildren flag tracks active tree across pivot mode toggle after moveColumns #2`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── value width:200 aggFunc:sum
                └─┬ "Married" GROUP marryChildren
                  ├── m1 width:200
                  └── m2 width:200
            `);
            await asyncSetTimeout(0);
            order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(Math.abs(order.indexOf('m1') - order.indexOf('m2'))).toBe(1);
        });

        test('marryChildren inherited from defaultColGroupDef enforced on padded groups', async () => {
            // When `defaultColGroupDef.marryChildren=true`, synthetic padded groups created to
            // balance the tree inherit the constraint. This locks in that behaviour: an
            // all-leaves padded chain (built when a mixed-depth sibling forces padding) must
            // still enforce contiguity of its wrapped leaves even when the surrounding user
            // group explicitly overrides `marryChildren: false`.
            const api = gridsManager.createGrid('marryInheritedPadded', {
                defaultColGroupDef: { marryChildren: true },
                columnDefs: [
                    // Group 1 overrides default to false. Its 3 leaves at level 1 trigger the
                    // all-leaves padded-chain shortcut because the sibling pushes maxDepth to 2.
                    {
                        marryChildren: false,
                        children: [{ field: 'a' }, { field: 'b' }, { field: 'c' }],
                    },
                    // Sibling that forces maxDepth=2. Its inner group inherits marryChildren=true
                    // from defaults, which is what flips `hasMarryChildren` on so the guard runs.
                    {
                        marryChildren: false,
                        children: [{ children: [{ field: 'd' }] }],
                    },
                ],
                rowData: [{ a: 'a1', b: 'b1', c: 'c1', d: 'd1' }],
            });
            await asyncSetTimeout(0);

            // Initial layout. Note: padded groups don't surface in the displayed tree (they're
            // an internal balancing detail) so Group 1's padded child isn't visible here. The
            // marryChildren constraint it carries IS enforced — checked by the move assertion below.
            await new GridColumns(api, 'initial layout').checkColumns(`
                CENTER
                ├─┬ GROUP
                │ ├── a "A" width:200
                │ ├── b "B" width:200
                │ └── c "C" width:200
                └─┬ GROUP
                  └─┬ GROUP marryChildren
                    └── d "D" width:200
            `);

            // Try to slide 'd' between 'b' and 'c' — would split the padded chain's leaves
            // [a, b, c]. Group 1 itself is non-married (would not catch this), so the
            // inherited padded-group constraint is the only thing that can reject it.
            api.moveColumns(['d'], 2);
            await asyncSetTimeout(0);

            // Order unchanged — the move was rejected by the padded group's inherited constraint.
            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['a', 'b', 'c', 'd']);

            await new GridColumns(api, 'after rejected move').checkColumns(`
                CENTER
                ├─┬ GROUP
                │ ├── a "A" width:200
                │ ├── b "B" width:200
                │ └── c "C" width:200
                └─┬ GROUP
                  └─┬ GROUP marryChildren
                    └── d "D" width:200
            `);

            await new GridRows(api, 'rendered rows after rejected move').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"a1" b:"b1" c:"c1" d:"d1"
            `);
        });

        test('nested marryChildren — inner group must stay together AND inside outer', async () => {
            const api = gridsManager.createGrid('marryNested', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        marryChildren: true,
                        children: [
                            {
                                headerName: 'Inner',
                                marryChildren: true,
                                children: [{ colId: 'i1' }, { colId: 'i2' }],
                            },
                            { colId: 'o1' },
                        ],
                    },
                    { colId: 'a' },
                ],
            });
            await new GridColumns(api, `nested marryChildren — inner group must stay together AND inside outer setup`)
                .checkColumns(`
                    CENTER
                    ├─┬ "Outer" GROUP marryChildren
                    │ ├─┬ "Inner" GROUP marryChildren
                    │ │ ├── i1 width:200
                    │ │ └── i2 width:200
                    │ └── o1 width:200
                    └── a width:200
                `);
            await new GridRows(api, `nested marryChildren — inner group must stay together AND inside outer setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);
            await asyncSetTimeout(0);

            // Try to slide 'a' between i1 and i2 — would break BOTH nested marryChildren groups.
            api.moveColumns(['a'], 1);
            await new GridColumns(
                api,
                `nested marryChildren — inner group must stay together AND inside outer after moveColumns`
            ).checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP marryChildren
                │ ├─┬ "Inner" GROUP marryChildren
                │ │ ├── i1 width:200
                │ │ └── i2 width:200
                │ └── o1 width:200
                └── a width:200
            `);
            await asyncSetTimeout(0);
            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            // i1 and i2 stay adjacent (inner group)
            expect(Math.abs(order.indexOf('i1') - order.indexOf('i2'))).toBe(1);
            // outer group's leaves stay together
            const innerStart = Math.min(order.indexOf('i1'), order.indexOf('o1'));
            const outerEnd = Math.max(order.indexOf('i2'), order.indexOf('o1'));
            expect(outerEnd - innerStart).toBeLessThanOrEqual(2);
        });
    });

    describe('state round-trip with rowGroup + pivot active', () => {
        test('getColumnState ↔ applyColumnState preserves rowGroupIndex + pivotIndex', async () => {
            const api = gridsManager.createGrid('stateRoundTrip', {
                columnDefs: [
                    { colId: 'country', rowGroup: true, rowGroupIndex: 0 },
                    { colId: 'year', rowGroup: true, rowGroupIndex: 1 },
                    { colId: 'sport', pivot: true, pivotIndex: 0 },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'USA', year: 2020, sport: 'Swim', gold: 1 }],
                pivotMode: true,
            });
            await new GridColumns(api, `getColumnState ↔ applyColumnState preserves rowGroupIndex + pivotIndex setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    └─┬ GROUP
                      └── pivot_sport__gold width:200 columnGroupShow:open
                `);
            await new GridRows(api, `getColumnState ↔ applyColumnState preserves rowGroupIndex + pivotIndex setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID pivot_sport__gold:null
                    └─┬ filler collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" pivot_sport__gold:null
                    · └─┬ LEAF_GROUP collapsed hidden id:row-group-country--year- ag-Grid-AutoColumn:"(Blanks)" pivot_sport__gold:null
                    · · └── LEAF hidden id:0
                `);
            await asyncSetTimeout(0);

            const stateBefore = api.getColumnState();

            api.resetColumnState();
            await new GridColumns(
                api,
                `getColumnState ↔ applyColumnState preserves rowGroupIndex + pivotIndex after resetColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ GROUP
                  └── pivot_sport__gold width:200 columnGroupShow:open
            `);
            await asyncSetTimeout(0);
            api.applyColumnState({ state: stateBefore, applyOrder: true });
            await new GridColumns(
                api,
                `getColumnState ↔ applyColumnState preserves rowGroupIndex + pivotIndex after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                └─┬ GROUP
                  └── pivot_sport__gold width:200 columnGroupShow:open
            `);
            await new GridRows(
                api,
                `getColumnState ↔ applyColumnState preserves rowGroupIndex + pivotIndex after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID pivot_sport__gold:null
                └─┬ filler collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" pivot_sport__gold:null
                · └─┬ LEAF_GROUP collapsed hidden id:row-group-country--year- ag-Grid-AutoColumn:"(Blanks)" pivot_sport__gold:null
                · · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            const stateAfter = api.getColumnState();
            const pickRelevant = (s: any) => ({
                colId: s.colId,
                rowGroup: s.rowGroup ?? false,
                rowGroupIndex: s.rowGroupIndex ?? null,
                pivot: s.pivot ?? false,
                pivotIndex: s.pivotIndex ?? null,
                aggFunc: s.aggFunc ?? null,
            });
            expect(stateAfter.map(pickRelevant)).toEqual(stateBefore.map(pickRelevant));
        });
    });

    describe('comparatorByIndex branches in applyColumnState rowGroup ordering', () => {
        // Exercises the comparator that re-orders rowGroup cols after applyColumnState.
        // Three distinct scenarios cover the "both indexed", "mixed indexed/old", and
        // "both old / preserved" branches respectively.

        test('all-with-index — pure index sort flips the rowGroup order', async () => {
            const api = gridsManager.createGrid('comparator_allIndex', {
                columnDefs: [{ colId: 'a', rowGroup: true }, { colId: 'b', rowGroup: true }, { colId: 'c' }],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });
            await asyncSetTimeout(0);

            api.applyColumnState({
                state: [
                    { colId: 'a', rowGroup: true, rowGroupIndex: 1 },
                    { colId: 'b', rowGroup: true, rowGroupIndex: 0 },
                ],
            });
            await asyncSetTimeout(0);

            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['b', 'a']);

            await new GridColumns(api, 'rowGroup [b, a] after explicit indices').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200 rowGroup
                └── c width:200
            `);
        });

        test('mixed: new col with index goes before old col without index', async () => {
            const api = gridsManager.createGrid('comparator_mixed', {
                columnDefs: [{ colId: 'a', rowGroup: true }, { colId: 'b' }, { colId: 'c' }],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });
            await asyncSetTimeout(0);

            api.applyColumnState({
                state: [
                    // 'b' newly enters as rowGroup with index 0 → goes first.
                    { colId: 'b', rowGroup: true, rowGroupIndex: 0 },
                    // 'a' stays rowGroup but has no index hint.
                    { colId: 'a', rowGroup: true },
                ],
            });
            await asyncSetTimeout(0);

            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['b', 'a']);

            await new GridColumns(api, 'rowGroup [b, a] mixed indexed/old').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200 rowGroup
                └── c width:200
            `);
        });

        test('both-old: rowGroup order preserved from previous list when no index hints', async () => {
            const api = gridsManager.createGrid('comparator_bothOld', {
                columnDefs: [{ colId: 'a', rowGroup: true }, { colId: 'b', rowGroup: true }, { colId: 'c' }],
                rowData: [{ a: 1, b: 2, c: 3 }],
            });
            await asyncSetTimeout(0);

            api.applyColumnState({
                state: [
                    // Neither carries a rowGroupIndex hint — preserves prior [a, b] order.
                    { colId: 'a', rowGroup: true },
                    { colId: 'b', rowGroup: true },
                ],
            });
            await asyncSetTimeout(0);

            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['a', 'b']);

            await new GridColumns(api, 'rowGroup [a, b] preserved from prior list').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200 rowGroup
                ├── b width:200 rowGroup
                └── c width:200
            `);
        });
    });

    describe('cellDataType inference triggers restoreColumnOrder for rowGroup/pivot cols', () => {
        test('inferred rowGroup cols are threaded into existing rowGroup order via restoreColumnOrder', async () => {
            const dataTypeDefinitions = {
                groupNumber: {
                    baseDataType: 'number',
                    extendsDataType: 'number',
                    columnTypes: ['groupableNumber'],
                    dataTypeMatcher: (value: any) => typeof value === 'number',
                } as any,
            };

            const api = gridsManager.createGrid('restoreColumnOrder_inference', {
                columnTypes: {
                    groupableNumber: { rowGroup: true } as any,
                },
                dataTypeDefinitions,
                columnDefs: [
                    { field: 'a' },
                    // `x` is already a rowGroup col before any inference runs.
                    { field: 'x', rowGroup: true },
                    { field: 'c' },
                ],
                // No rowData up front → inference is deferred per col.
            });
            await asyncSetTimeout(0);

            expect(api.getRowGroupColumns().map((c: Column) => c.getColId())).toEqual(['x']);

            api.setGridOption('rowData', [{ a: 1, x: 2, c: 3 }]);
            await asyncSetTimeout(0);

            const rowGroupIds = api.getRowGroupColumns().map((c: Column) => c.getColId());
            expect(rowGroupIds).toEqual(['a', 'x', 'c']);

            await new GridColumns(api, 'rowGroup after restoreColumnOrder threads inferred cols').checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a "A" width:200 rowGroup
                ├── x "X" width:200 rowGroup
                └── c "C" width:200 rowGroup
            `);
        });
    });

    describe('rowGroupIndex null clears the prior flag', () => {
        test('setting rowGroupIndex: null via applyColumnState removes the col from rowGroup set', async () => {
            const api = gridsManager.createGrid('clearRG', {
                columnDefs: [{ colId: 'country', rowGroup: true, rowGroupIndex: 0 }, { colId: 'value' }],
                rowData: [{ country: 'USA', value: 1 }],
            });
            await asyncSetTimeout(0);

            expect(api.getRowGroupColumns().map((c) => c.getColId())).toEqual(['country']);

            api.applyColumnState({ state: [{ colId: 'country', rowGroupIndex: null }] });
            await asyncSetTimeout(0);

            expect(api.getRowGroupColumns()).toHaveLength(0);

            await new GridColumns(api, 'rowGroupIndex null clears flag').checkColumns(`
                CENTER
                ├── country width:200
                └── value width:200
            `);
            await new GridRows(api, 'rows after clearing rowGroup').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0
            `);
        });
    });

    describe('applyColumnState second pass for pivot result cols', () => {
        test('applyColumnState applies sort to pivot result col by colId', async () => {
            const api = gridsManager.createGrid('applyPivotState', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', pivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                ],
                pivotMode: true,
                rowData: [
                    { country: 'USA', sport: 'Swim', gold: 5 },
                    { country: 'USA', sport: 'Run', gold: 3 },
                    { country: 'UK', sport: 'Swim', gold: 2 },
                ],
            });
            await asyncSetTimeout(0);

            const pivotCols = api.getPivotResultColumns();
            expect(pivotCols).not.toBeNull();
            expect(pivotCols!.length).toBeGreaterThan(0);

            const targetColId = pivotCols![0].getColId();

            api.applyColumnState({ state: [{ colId: targetColId, sort: 'desc' }] });
            await asyncSetTimeout(0);

            const target = api.getColumn(targetColId);
            expect(target).not.toBeNull();
            expect(target!.getSort()).toBe('desc');

            await new GridRows(api, 'rows sorted by pivot result col').check(`
                ROOT id:ROOT_NODE_ID pivot_sport__gold:null
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" pivot_sport__gold:null
                · ├── LEAF hidden id:0
                · ├── LEAF hidden id:1
                · └── LEAF hidden id:2
            `);
        });
    });

    describe('columnStateUtils edge cases', () => {
        // Solved by AG-17366 when it is completed
        test.skip('applyColumnState malformed inputs: non-array state, orphan service colIds, null/undefined colIds', async () => {
            const api = gridsManager.createGrid('malformedState', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(
                api,
                `applyColumnState malformed inputs: non-array state, orphan service colIds, null/ setup`
            ).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                api,
                `applyColumnState malformed inputs: non-array state, orphan service colIds, null/ setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // Non-array state legitimately logs warning #32 — silence it and assert it fires.
            const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

            // (1) non-array
            expect(api.applyColumnState({ state: 'not-an-array' as any })).toBe(false);
            expect(consoleWarnSpy.mock.calls[0][0]).toContain('warning #32');
            consoleWarnSpy.mockRestore();

            // (2) orphan auto / selection colIds get consumed via service-state routing
            expect(
                api.applyColumnState({
                    state: [
                        { colId: 'a', hide: true },
                        { colId: 'ag-Grid-AutoColumn', sort: 'asc' } as any,
                        { colId: 'ag-Grid-SelectionColumn', hide: true } as any,
                    ],
                })
            ).toBe(true);
            expect(api.getColumn('a')!.isVisible()).toBe(false);

            // (3) malformed colId entries — must not crash; valid entries still apply
            const result = api.applyColumnState({
                state: [
                    { colId: undefined } as any,
                    { colId: null } as any,
                    { colId: 'b', hide: true },
                    { colId: 'c', hide: true },
                ],
            });
            expect(result).toBe(false);
            expect(api.getColumn('b')!.isVisible()).toBe(false);
            expect(api.getColumn('c')!.isVisible()).toBe(false);
            await new GridRows(
                api,
                `applyColumnState malformed inputs: non-array state, orphan service colIds, null/ final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('getColumnState on a grid where all cols are hidden — displayedCols.length === 0 branch', async () => {
            const api = gridsManager.createGrid('allHidden', {
                columnDefs: [
                    { colId: 'a', hide: true },
                    { colId: 'b', hide: true },
                ],
            });
            await new GridColumns(
                api,
                `getColumnState on a grid where all cols are hidden — displayedCols.length === 0  setup`
            ).checkColumns(``);
            await new GridRows(
                api,
                `getColumnState on a grid where all cols are hidden — displayedCols.length === 0  setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // No displayed cols → `_getColumnState` takes the "iterate allCols" fast path.
            const state = api.getColumnState();
            expect(state.map((s) => s.colId)).toEqual(['a', 'b']);
            await new GridRows(
                api,
                `getColumnState on a grid where all cols are hidden — displayedCols.length === 0  final state`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('resetColumnState recreates initial rowGroup/pivot indexes (auto-increment fallback)', async () => {
            // initialRowGroup true with no explicit initialRowGroupIndex → auto-increment from 1000.
            // Same for initialPivot.
            const api = gridsManager.createGrid('resetIdx', {
                columnDefs: [
                    { colId: 'country', initialRowGroup: true },
                    { colId: 'sport', initialRowGroup: true },
                    { colId: 'year', initialPivot: true },
                ],
            });
            await new GridColumns(
                api,
                `resetColumnState recreates initial rowGroup/pivot indexes (auto-increment fallba setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 rowGroup
                └── year width:200 pivot
            `);
            await new GridRows(
                api,
                `resetColumnState recreates initial rowGroup/pivot indexes (auto-increment fallba setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.applyColumnState({
                state: [
                    { colId: 'country', rowGroup: false },
                    { colId: 'sport', rowGroup: false },
                ],
            });
            await new GridColumns(
                api,
                `resetColumnState recreates initial rowGroup/pivot indexes (auto-increment fallba after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── country width:200
                ├── sport width:200
                └── year width:200 pivot
            `);
            await new GridRows(
                api,
                `resetColumnState recreates initial rowGroup/pivot indexes (auto-increment fallba after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            api.resetColumnState();
            await new GridColumns(
                api,
                `resetColumnState recreates initial rowGroup/pivot indexes (auto-increment fallba after resetColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200 rowGroup
                └── year width:200 pivot
            `);

            const state = api.getColumnState();
            const country = state.find((s) => s.colId === 'country')!;
            const sport = state.find((s) => s.colId === 'sport')!;
            // Both row group cols recovered with auto-incrementing indices
            expect(country.rowGroup).toBe(true);
            expect(sport.rowGroup).toBe(true);
            expect(typeof country.rowGroupIndex).toBe('number');
            expect(typeof sport.rowGroupIndex).toBe('number');
        });

        test('resetColumnState with no primary cols is a safe no-op', async () => {
            // Grid with no columnDefs → `_resetColumnState` early-returns on `!primaryCols.length`.
            const api = gridsManager.createGrid('emptyReset', {
                columnDefs: [],
            });
            await new GridColumns(api, `resetColumnState with no primary cols is a safe no-op setup`).checkColumns(``);
            await new GridRows(api, `resetColumnState with no primary cols is a safe no-op setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.resetColumnState();
            await new GridColumns(
                api,
                `resetColumnState with no primary cols is a safe no-op after resetColumnState`
            ).checkColumns(``);
            expect(api.getAllGridColumns()).toEqual([]);
        });

        test('resetColumnState with selection col includes it in the reset order', async () => {
            const api = gridsManager.createGrid('resetSel', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });
            await new GridColumns(api, `resetColumnState with selection col includes it in the reset order setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    ├── a width:200
                    └── b width:200
                `);
            await new GridRows(api, `resetColumnState with selection col includes it in the reset order setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            api.moveColumns(['b'], 0);
            await new GridColumns(
                api,
                `resetColumnState with selection col includes it in the reset order after moveColumns`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── a width:200
                └── b width:200
            `);
            // Selection col is moved by the resetColumnState ordering path (selection-included branch)
            api.resetColumnState();
            await new GridColumns(
                api,
                `resetColumnState with selection col includes it in the reset order after resetColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── a width:200
                └── b width:200
            `);

            const ids = api.getAllGridColumns().map((c) => c.getColId());
            expect(ids[0]).toBe('ag-Grid-SelectionColumn');
        });

        test('applyColumnState applyOrder: mix of indexed and non-indexed cols sorts indexed first', async () => {
            // Exercises the comparator branches in `orderLiveColsLikeState` for indexed vs
            // non-indexed cols. `state[i].colId === 'a'` has no rowGroupIndex; 'b' has rowGroupIndex.
            const api = gridsManager.createGrid('mixIdx', {
                columnDefs: [
                    { colId: 'a' },
                    { colId: 'b', rowGroup: true, rowGroupIndex: 5, hide: true },
                    { colId: 'c' },
                ],
            });
            await new GridColumns(
                api,
                `applyColumnState applyOrder: mix of indexed and non-indexed cols sorts indexed f setup`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── a width:200
                └── c width:200
            `);
            await new GridRows(
                api,
                `applyColumnState applyOrder: mix of indexed and non-indexed cols sorts indexed f setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.applyColumnState({
                state: [{ colId: 'c' }, { colId: 'a' }, { colId: 'b' }],
                applyOrder: true,
            });
            await new GridColumns(
                api,
                `applyColumnState applyOrder: mix of indexed and non-indexed cols sorts indexed f after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── c width:200
                └── a width:200
            `);
            await new GridRows(
                api,
                `applyColumnState applyOrder: mix of indexed and non-indexed cols sorts indexed f after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const ids = api.getAllGridColumns().map((c) => c.getColId());
            // Order roughly: indexed b (via rowGroupIndex) anchored, then user state order applies
            expect(ids).toContain('a');
            expect(ids).toContain('b');
            expect(ids).toContain('c');
        });
    });

    describe('applyColumnState flex', () => {
        test('applyColumnState sets, overrides width, and clears flex', async () => {
            const api = gridsManager.createGrid('flexState', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });
            await new GridColumns(api, `applyColumnState flex setup`).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // flex is applied per-column and reported back in the exported state.
            api.applyColumnState({
                state: [
                    { colId: 'a', flex: 1 },
                    { colId: 'b', flex: 2 },
                ],
            });
            const afterSet = Object.fromEntries(api.getColumnState().map((s) => [s.colId, s.flex]));
            expect(afterSet['a']).toBe(1);
            expect(afterSet['b']).toBe(2);
            expect(afterSet['c']).toBeNull();
            await new GridColumns(api, `applyColumnState flex applied`).checkColumns(`
                CENTER
                ├── a width:267 flex:1
                ├── b width:533 flex:2
                └── c width:200
            `);

            // flex takes precedence: when both flex and width are supplied, width is ignored.
            api.applyColumnState({ state: [{ colId: 'c', flex: 3, width: 999 }] });
            const cState = api.getColumnState().find((s) => s.colId === 'c')!;
            expect(cState.flex).toBe(3);
            expect(cState.width).not.toBe(999);

            // flex: null clears the flex, leaving the column non-flexed.
            api.applyColumnState({
                state: [
                    { colId: 'a', flex: null },
                    { colId: 'b', flex: null },
                    { colId: 'c', flex: null },
                ],
            });
            const afterClear = Object.fromEntries(api.getColumnState().map((s) => [s.colId, s.flex]));
            expect(afterClear['a']).toBeNull();
            expect(afterClear['b']).toBeNull();
            expect(afterClear['c']).toBeNull();
            await new GridColumns(api, `applyColumnState flex cleared`).checkColumns(`
                CENTER
                ├── a width:167
                ├── b width:333
                └── c width:500
            `);
        });
    });

    describe('applyColumnState width guard and null-field semantics', () => {
        test('width below minWidth is ignored; width >= minWidth is applied', async () => {
            const api = gridsManager.createGrid('widthGuard', {
                columnDefs: [{ colId: 'a', minWidth: 100 }],
            });
            const widthOf = () => api.getColumnState().find((s) => s.colId === 'a')!.width;
            expect(widthOf()).toBe(200);

            // 50 < minWidth(100) → ignored, old width retained.
            api.applyColumnState({ state: [{ colId: 'a', width: 50 }] });
            expect(widthOf()).toBe(200);

            // 150 >= minWidth(100) → applied.
            api.applyColumnState({ state: [{ colId: 'a', width: 150 }] });
            expect(widthOf()).toBe(150);
            await new GridColumns(api, `width guard applied`).checkColumns(`
                CENTER
                └── a width:150
            `);
            await new GridRows(api, `width guard applied`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('width: null is a no-op; sortIndex: null clears the index', async () => {
            const api = gridsManager.createGrid('nullFields', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
            });
            api.applyColumnState({
                state: [
                    { colId: 'a', width: 150, sort: 'asc', sortIndex: 0 },
                    { colId: 'b', sort: 'asc', sortIndex: 1 },
                ],
            });

            // width: null leaves the width untouched (not reset to default).
            api.applyColumnState({ state: [{ colId: 'a', width: null }] });
            expect(api.getColumnState().find((s) => s.colId === 'a')!.width).toBe(150);

            // sortIndex: null clears just the index, keeping the sort direction.
            api.applyColumnState({ state: [{ colId: 'a', sortIndex: null }] });
            const aAfterIndexNull = api.getColumnState().find((s) => s.colId === 'a')!;
            expect(aAfterIndexNull.sort).toBe('asc');
            expect(aAfterIndexNull.sortIndex).toBeNull();
            await new GridColumns(api, `null fields applied`).checkColumns(`
                CENTER
                ├── a width:150 sort:asc
                └── b width:200 sort:asc sortIndex:1
            `);
        });
    });

    describe('applyColumnState sort normalization', () => {
        test('direction-only sort normalizes sortType to the default', async () => {
            const api = gridsManager.createGrid('sortNorm', {
                columnDefs: [{ colId: 'a' }],
            });
            api.applyColumnState({ state: [{ colId: 'a', sort: 'desc' }] });
            const a = api.getColumnState().find((s) => s.colId === 'a')!;
            expect(a.sort).toBe('desc');
            expect(a.sortType).toBe('default');
            await new GridColumns(api, `direction-only sort normalized`).checkColumns(`
                CENTER
                └── a width:200 sort:desc
            `);
        });
    });

    describe('applyColumnState pivotIndex ordering', () => {
        test('literal pivotIndex orders the pivot columns', async () => {
            const api = gridsManager.createGrid('pivIdxOrder', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'val', aggFunc: 'sum' }],
                pivotMode: true,
                rowData: [{ a: 1, b: 'x', c: 'y', val: 5 }],
            });
            api.applyColumnState({
                state: [
                    { colId: 'b', pivot: true, pivotIndex: 1 },
                    { colId: 'c', pivot: true, pivotIndex: 0 },
                ],
            });
            await asyncSetTimeout(0);
            // pivotIndex 0 (c) before pivotIndex 1 (b).
            expect(api.getPivotColumns().map((col) => col.getColId())).toEqual(['c', 'b']);
            await new GridColumns(api, `literal pivotIndex ordering`).checkColumns(`
                CENTER
                └─┬ GROUP closed
                  ├─┬ GROUP hidden
                  │ └── pivot_c-b_-_val width:200 columnGroupShow:open hidden
                  └── pivot_c-b__val width:200 columnGroupShow:closed
            `);
            await new GridRows(api, `literal pivotIndex ordering`).check(`
                ROOT id:ROOT_NODE_ID pivot_c-b_-_val:null pivot_c-b__val:null
                ROOT id:ROOT_NODE_ID pivot_c-b_-_val:null pivot_c-b__val:null
                └── LEAF hidden id:0
            `);
        });
    });

    describe('applyColumnState applies state to the auto-group column by colId', () => {
        test('sort routed to the auto-group col via its colId lands on the auto col', async () => {
            const api = gridsManager.createGrid('autoColProp', {
                columnDefs: [{ colId: 'a' }, { colId: 'grp', rowGroup: true }],
                rowData: [{ a: 1, grp: 'x' }],
            });
            const autoColId = 'ag-Grid-AutoColumn';
            expect(api.getColumn(autoColId)).toBeTruthy();

            api.applyColumnState({ state: [{ colId: autoColId, sort: 'asc' }] });
            await asyncSetTimeout(0);
            expect(api.getColumn(autoColId)!.getSort()).toBe('asc');
            await new GridColumns(api, `sort lands on auto-group col`).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200 sort:asc
                ├── a width:200
                └── grp width:200 rowGroup
            `);
            await new GridRows(api, `sort lands on auto-group col`).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-grp- ag-Grid-AutoColumn:"(Blanks)"
                · └── LEAF hidden id:0
            `);
        });
    });

    describe('applyColumnState dispatches everything-changed and moved events', () => {
        test('columnEverythingChanged fires, and applyOrder reorder fires columnMoved', async () => {
            const api = gridsManager.createGrid('stateEvents', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
            });

            let everythingChanged = 0;
            let moved = 0;
            api.addEventListener('columnEverythingChanged', () => {
                everythingChanged++;
            });
            api.addEventListener('columnMoved', () => {
                moved++;
            });

            api.applyColumnState({
                state: [{ colId: 'c' }, { colId: 'b' }, { colId: 'a' }],
                applyOrder: true,
            });
            await asyncSetTimeout(0);

            expect(everythingChanged).toBeGreaterThanOrEqual(1);
            expect(moved).toBeGreaterThanOrEqual(1);
            expect(api.getAllGridColumns().map((col) => col.getColId())).toEqual(['c', 'b', 'a']);
            await new GridColumns(api, `applyOrder reorder events`).checkColumns(`
                CENTER
                ├── c width:200
                ├── b width:200
                └── a width:200
            `);
        });
    });

    describe('applyColumnState full-state round-trip fidelity', () => {
        test('getColumnState captured, reset, and re-applied preserves every field per column', async () => {
            const api = gridsManager.createGrid('roundTrip', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }],
                rowData: [{ a: 1, b: 2, c: 'x', d: 4 }],
            });

            // Drive a spread of scalar fields through applyColumnState (rowGroup/pivot fidelity is
            // covered separately by the rowGroup+pivot round-trip test above).
            api.applyColumnState({
                state: [
                    { colId: 'a', width: 150, pinned: 'left', sort: 'asc', sortIndex: 0 },
                    { colId: 'b', flex: 2, sort: 'desc', sortIndex: 1 },
                    { colId: 'c', hide: true },
                    { colId: 'd', pinned: 'right', width: 175 },
                ],
                applyOrder: true,
            });
            await asyncSetTimeout(0);
            const captured = api.getColumnState();
            const byId = (state: typeof captured) => Object.fromEntries(state.map((s) => [s.colId, s]));
            const capturedById = byId(captured);
            await new GridColumns(api, `round-trip captured state`).checkColumns(`
                LEFT
                └── a width:150 sort:asc sortIndex:0
                CENTER
                └── b width:675 flex:2 sort:desc sortIndex:1
                RIGHT
                └── d width:175
            `);

            // Wipe state, then restore the captured snapshot verbatim.
            api.resetColumnState();
            await asyncSetTimeout(0);
            api.applyColumnState({ state: captured, applyOrder: true });
            await asyncSetTimeout(0);

            // Per-column field fidelity (order-independent — the reset re-derives display order).
            const restoredById = byId(api.getColumnState());
            expect(Object.keys(restoredById).sort()).toEqual(Object.keys(capturedById).sort());
            for (const colId of Object.keys(capturedById)) {
                expect(restoredById[colId]).toEqual(capturedById[colId]);
            }
            await new GridColumns(api, `round-trip restored state`).checkColumns(`
                LEFT
                └── a width:150 sort:asc sortIndex:0
                CENTER
                └── b width:675 flex:2 sort:desc sortIndex:1
                RIGHT
                └── d width:175
            `);
        });
    });
});
