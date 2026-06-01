/**
 * Split from column-mutations.test.ts — see sibling files for related coverage.
 * Tests instantiate the full grid via TestGridsManager and exercise public APIs.
 */
import type { ColGroupDef, Column } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, RowNumbersModule, TreeDataModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

describe('Column Mutations - order restoration', () => {
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

    describe('column order preservation across mutations', () => {
        test('maintainColumnOrder preserves user reordering across setColumnDefs', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            // User reorders: move c to first position
            api.moveColumns(['c'], 0);

            await new GridColumns(api, 'user reordered').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);

            // Update colDefs (but same columns) — order should be preserved
            api.setGridOption('columnDefs', [
                { colId: 'a', headerName: 'A2' },
                { colId: 'b', headerName: 'B2' },
                { colId: 'c', headerName: 'C2' },
            ]);

            await new GridColumns(api, 'order preserved').checkColumns(`
                CENTER
                ├── c "C2" width:200
                ├── a "A2" width:200
                └── b "B2" width:200
            `);
        });

        test('new columns are inserted after siblings when maintainColumnOrder=true', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ headerName: 'G', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            // Add column d as sibling of a and b (in same group)
            api.setGridOption('columnDefs', [
                { headerName: 'G', children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'd' }] },
                { colId: 'c' },
            ]);

            await new GridColumns(api, 'new sibling d').checkColumns(`
                CENTER
                ├─┬ "G" GROUP
                │ ├── a width:200
                │ ├── b width:200
                │ └── d width:200
                └── c width:200
            `);
        });

        test('deep nesting: new column finds sibling by walking up parent chain', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        children: [
                            {
                                headerName: 'Inner',
                                children: [{ colId: 'a' }, { colId: 'b' }],
                            },
                        ],
                    },
                    { colId: 'c' },
                ],
                maintainColumnOrder: true,
            });

            await new GridColumns(api, 'initial deep').checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP
                │ └─┬ "Inner" GROUP
                │   ├── a width:200
                │   └── b width:200
                └── c width:200
            `);

            // Add d in a new nested sub-group alongside Inner
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Outer',
                    children: [
                        { headerName: 'Inner', children: [{ colId: 'a' }, { colId: 'b' }] },
                        { headerName: 'Inner2', children: [{ colId: 'd' }] },
                    ],
                },
                { colId: 'c' },
            ]);

            // d should be inserted near siblings a/b (its parent's siblings in Outer)
            await new GridColumns(api, 'deep sibling found').checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP
                │ ├─┬ "Inner" GROUP
                │ │ ├── a width:200
                │ │ └── b width:200
                │ └─┬ "Inner2" GROUP
                │   └── d width:200
                └── c width:200
            `);
        });

        test('new columns in multiple different groups simultaneously', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'G1', children: [{ colId: 'a' }] },
                    { headerName: 'G2', children: [{ colId: 'b' }] },
                    { colId: 'c' },
                ],
                maintainColumnOrder: true,
            });

            await new GridColumns(api, 'initial two groups').checkColumns(`
                CENTER
                ├─┬ "G1" GROUP
                │ └── a width:200
                ├─┬ "G2" GROUP
                │ └── b width:200
                └── c width:200
            `);

            // Add new columns to both groups at once
            api.setGridOption('columnDefs', [
                { headerName: 'G1', children: [{ colId: 'a' }, { colId: 'x' }] },
                { headerName: 'G2', children: [{ colId: 'b' }, { colId: 'y' }] },
                { colId: 'c' },
            ]);

            // x should be near a, y should be near b
            await new GridColumns(api, 'both groups got new cols').checkColumns(`
                CENTER
                ├─┬ "G1" GROUP
                │ ├── a width:200
                │ └── x width:200
                ├─┬ "G2" GROUP
                │ ├── b width:200
                │ └── y width:200
                └── c width:200
            `);
        });

        test('user reorder + group insertion: new column placed near reordered siblings', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    { headerName: 'G', children: [{ colId: 'a' }, { colId: 'b' }] },
                    { colId: 'c' },
                    { colId: 'd' },
                ],
                maintainColumnOrder: true,
            });

            // User moves d before the group
            api.moveColumns(['d'], 0);

            const order = api.getAllDisplayedColumns().map((c: Column) => c.getColId());
            expect(order).toEqual(['d', 'a', 'b', 'c']);

            // Add new column e in group G alongside a and b
            api.setGridOption('columnDefs', [
                { headerName: 'G', children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'e' }] },
                { colId: 'c' },
                { colId: 'd' },
            ]);

            // d should stay first (user reorder preserved), e near a/b
            await new GridColumns(api, 'reorder + group insert').checkColumns(`
                CENTER
                ├── d width:200
                ├─┬ "G" GROUP
                │ ├── a width:200
                │ ├── b width:200
                │ └── e width:200
                └── c width:200
            `);
        });

        test('new column with no relatives in list appends at end', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                maintainColumnOrder: true,
            });

            // Add new column c with no group relationship to a or b
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);

            await new GridColumns(api, 'no sibling appended').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            // Add another ungrouped column d
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }]);

            await new GridColumns(api, 'another no sibling appended').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                ├── c width:200
                └── d width:200
            `);
        });

        test('new column in group where all siblings were removed finds grandparent', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        children: [{ headerName: 'Inner', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
                    },
                    { colId: 'd' },
                ],
                maintainColumnOrder: true,
            });

            await new GridColumns(api, 'initial nested').checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP
                │ ├─┬ "Inner" GROUP
                │ │ ├── a width:200
                │ │ └── b width:200
                │ └── c width:200
                └── d width:200
            `);

            // Replace Inner's children entirely — x and y are new, a and b removed.
            // x/y have no direct siblings in the list, but their grandparent Outer has c.
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Outer',
                    children: [{ headerName: 'Inner', children: [{ colId: 'x' }, { colId: 'y' }] }, { colId: 'c' }],
                },
                { colId: 'd' },
            ]);

            // x and y are inserted after c (the rightmost grandparent sibling),
            // so c appears before the Inner group in display order
            await new GridColumns(api, 'grandparent sibling found').checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP
                │ ├── c width:200
                │ └─┬ "Inner" GROUP
                │   ├── x width:200
                │   └── y width:200
                └── d width:200
            `);
        });
    });

    describe('order restoration — colsApplyPrevOrder edge cases', () => {
        test('all prior colIds removed (no preservation overlap) — new cols appear in colDef order', async () => {
            const api = gridsManager.createGrid('noOverlap', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            // Replace with entirely new colIds — `applyPrevOrder` sees preservedOrder.length === 0
            // and returns colsList unchanged, so cols appear in their colDef order.
            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y' }, { colId: 'z' }]);

            await new GridColumns(api, 'all new colIds — colDef order kept').checkColumns(`
                CENTER
                ├── x width:200
                ├── y width:200
                └── z width:200
            `);
        });

        test('rowNumbers toggled on between refreshes — appears at head', async () => {
            const api = gridsManager.createGrid('rowNumToggle', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            await new GridColumns(api, 'before rowNumbers').checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);

            api.setGridOption('rowNumbers', true);
            await asyncSetTimeout(0);

            // Newly-added service col not in prevOrder; `colsApplyPrevOrder` routes it via
            // `servicePrepend` so it lands at the head, never at the tail.
            const ids = api.getAllGridColumns().map((c: Column) => c.getColId());
            expect(ids[0]).toBe('ag-Grid-RowNumbersColumn');
            expect(ids.slice(1)).toEqual(['a', 'b', 'c']);
        });

        test('selection col toggled on between refreshes — at head', async () => {
            const api = gridsManager.createGrid('selToggle', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                maintainColumnOrder: true,
            });
            await new GridColumns(api, `selection col toggled on between refreshes — at head setup`).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `selection col toggled on between refreshes — at head setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            api.setGridOption('rowSelection', { mode: 'multiRow', checkboxes: true });
            await new GridColumns(
                api,
                `selection col toggled on between refreshes — at head after setGridOption rowSelection`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `selection col toggled on between refreshes — at head after setGridOption rowSelection`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const ids = api.getAllGridColumns().map((c: Column) => c.getColId());
            expect(ids[0]).toBe('ag-Grid-SelectionColumn');
        });

        test('multiple new cols in same group anchor to the same sibling (followers map)', async () => {
            const api = gridsManager.createGrid('multiFollowers', {
                columnDefs: [{ headerName: 'G', children: [{ colId: 'a' }] }, { colId: 'c' }],
                maintainColumnOrder: true,
            });

            // Add b, d, e to group G — all three new cols anchor to `a` and become followers
            api.setGridOption('columnDefs', [
                { headerName: 'G', children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'd' }, { colId: 'e' }] },
                { colId: 'c' },
            ]);

            await new GridColumns(api, 'three followers anchored to a').checkColumns(`
                CENTER
                ├─┬ "G" GROUP
                │ ├── a width:200
                │ ├── b width:200
                │ ├── d width:200
                │ └── e width:200
                └── c width:200
            `);
        });

        test('deep nesting + groupHighestLeaf — new col in deeply nested sibling group anchors via outermost-common-parent', async () => {
            const api = gridsManager.createGrid('groupHighest', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        children: [
                            {
                                headerName: 'L1',
                                children: [
                                    { headerName: 'L2a', children: [{ colId: 'a' }, { colId: 'b' }] },
                                    { headerName: 'L2b', children: [{ colId: 'c' }] },
                                ],
                            },
                        ],
                    },
                    { colId: 'tail' },
                ],
                maintainColumnOrder: true,
            });

            // Add a new sub-tree alongside L1 inside Outer — the new col anchors to the last
            // preserved leaf in Outer's subtree (`c`), via groupHighestLeaf precomputed map.
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Outer',
                    children: [
                        {
                            headerName: 'L1',
                            children: [
                                { headerName: 'L2a', children: [{ colId: 'a' }, { colId: 'b' }] },
                                { headerName: 'L2b', children: [{ colId: 'c' }] },
                            ],
                        },
                        { headerName: 'L1b', children: [{ colId: 'd' }] },
                    ],
                },
                { colId: 'tail' },
            ]);

            await new GridColumns(api, 'd inserted in new L1b after preserved leaves').checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP
                │ ├─┬ "L1" GROUP
                │ │ ├─┬ "L2a" GROUP
                │ │ │ ├── a width:200
                │ │ │ └── b width:200
                │ │ └─┬ "L2b" GROUP
                │ │   └── c width:200
                │ └─┬ "L1b" GROUP
                │   └── d width:200
                └── tail width:200
            `);
        });

        test('partial preservation — some cols destroyed, some preserved, some new', async () => {
            const api = gridsManager.createGrid('partial', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'd' }, { colId: 'e' }],
                maintainColumnOrder: true,
            });

            // User reorders to [c, a, e, b, d]
            api.applyColumnState({
                state: [{ colId: 'c' }, { colId: 'a' }, { colId: 'e' }, { colId: 'b' }, { colId: 'd' }],
                applyOrder: true,
            });

            // Drop b, d; add x, y, z — preservedOrder = [c, a, e]; additionalCols = [x, y, z]
            api.setGridOption('columnDefs', [
                { colId: 'a' },
                { colId: 'c' },
                { colId: 'e' },
                { colId: 'x' },
                { colId: 'y' },
                { colId: 'z' },
            ]);

            // c, a, e stay in user-set order; x, y, z appended in their colDef order
            await new GridColumns(api, 'partial preservation').checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                ├── e width:200
                ├── x width:200
                ├── y width:200
                └── z width:200
            `);
        });

        test('multiple pivot toggle cycles preserve independent orders in each mode', async () => {
            const api = gridsManager.createGrid('pivotCycle', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', enablePivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                    { colId: 'silver', aggFunc: 'sum' },
                ],
                rowData: [{ country: 'UK', sport: 'Swim', gold: 1, silver: 2 }],
                maintainColumnOrder: true,
            });
            await new GridColumns(api, `multiple pivot toggle cycles preserve independent orders in each mode setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── country width:200 rowGroup
                    ├── sport width:200
                    ├── gold width:200 aggFunc:sum
                    └── silver width:200 aggFunc:sum
                `);
            await new GridRows(api, `multiple pivot toggle cycles preserve independent orders in each mode setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" gold:null silver:null
                    · └── LEAF hidden id:0
                `);
            await asyncSetTimeout(0);

            // Reorder in primary mode: silver before gold
            api.applyColumnState({
                state: [{ colId: 'silver' }, { colId: 'gold' }],
                applyOrder: true,
            });
            await new GridColumns(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── silver width:200 aggFunc:sum
                ├── gold width:200 aggFunc:sum
                ├── country width:200 rowGroup
                └── sport width:200
            `);
            await new GridRows(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" silver:null gold:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            const primaryOrderBefore = api
                .getAllDisplayedColumns()
                .map((c) => c.getColId())
                .filter((id) => !id.startsWith('ag-Grid'));

            // Round 1: pivot on, pivot off
            api.setGridOption('pivotMode', true);
            await new GridColumns(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── silver width:200 aggFunc:sum
                └── gold width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode`
            ).check(`
                ROOT id:ROOT_NODE_ID silver:null gold:null
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" silver:null gold:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);
            api.setGridOption('pivotMode', false);
            await new GridColumns(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode #2`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── silver width:200 aggFunc:sum
                ├── gold width:200 aggFunc:sum
                ├── country width:200 rowGroup
                └── sport width:200
            `);
            await new GridRows(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" silver:null gold:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            // Round 2: pivot on, pivot off
            api.setGridOption('pivotMode', true);
            await new GridColumns(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode #3`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── silver width:200 aggFunc:sum
                └── gold width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode #3`
            ).check(`
                ROOT id:ROOT_NODE_ID silver:null gold:null
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" silver:null gold:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);
            api.setGridOption('pivotMode', false);
            await new GridColumns(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode #4`
            ).checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── silver width:200 aggFunc:sum
                ├── gold width:200 aggFunc:sum
                ├── country width:200 rowGroup
                └── sport width:200
            `);
            await new GridRows(
                api,
                `multiple pivot toggle cycles preserve independent orders in each mode after setGridOption pivotMode #4`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" silver:null gold:null
                · └── LEAF hidden id:0
            `);
            await asyncSetTimeout(0);

            const primaryOrderAfter = api
                .getAllDisplayedColumns()
                .map((c) => c.getColId())
                .filter((id) => !id.startsWith('ag-Grid'));

            expect(primaryOrderAfter).toEqual(primaryOrderBefore);
        });

        test('lockPosition enforced after order restoration', async () => {
            const api = gridsManager.createGrid('lockOrder', {
                columnDefs: [
                    { colId: 'a' },
                    { colId: 'b', lockPosition: 'right' },
                    { colId: 'c' },
                    { colId: 'locked-left', lockPosition: 'left' },
                    { colId: 'd' },
                ],
                maintainColumnOrder: true,
            });
            await new GridColumns(api, `lockPosition enforced after order restoration setup`).checkColumns(`
                CENTER
                ├── locked-left width:200 lockPosition:left
                ├── a width:200
                ├── c width:200
                ├── d width:200
                └── b width:200 lockPosition:right
            `);
            await new GridRows(api, `lockPosition enforced after order restoration setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // Even when defined out of order, placeLockedColumns runs after applyPrevOrder
            // and partitions [...locked-left..., ...mid..., ...locked-right...]
            const ids = api.getAllGridColumns().map((c: Column) => c.getColId());
            expect(ids[0]).toBe('locked-left');
            expect(ids[ids.length - 1]).toBe('b');
            await new GridRows(api, `lockPosition enforced after order restoration final state`).check(`
                ROOT id:ROOT_NODE_ID
            `);
        });

        test('maintainColumnOrder=false reverts to colDef order on setColumnDefs', async () => {
            const api = gridsManager.createGrid('noMaintain', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: false,
            });
            await new GridColumns(api, `maintainColumnOrder=false reverts to colDef order on setColumnDefs setup`)
                .checkColumns(`
                    CENTER
                    ├── a width:200
                    ├── b width:200
                    └── c width:200
                `);
            await new GridRows(api, `maintainColumnOrder=false reverts to colDef order on setColumnDefs setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );

            // User moves c first
            api.moveColumns(['c'], 0);
            await new GridColumns(
                api,
                `maintainColumnOrder=false reverts to colDef order on setColumnDefs after moveColumns`
            ).checkColumns(`
                CENTER
                ├── c width:200
                ├── a width:200
                └── b width:200
            `);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            // New colDefs without maintain → revert to colDef order
            api.setGridOption('columnDefs', [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }]);
            await new GridColumns(
                api,
                `maintainColumnOrder=false reverts to colDef order on setColumnDefs after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                api,
                `maintainColumnOrder=false reverts to colDef order on setColumnDefs after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['a', 'b', 'c']);
        });

        test('maintainColumnOrder=false: new cols on setColumnDefs land in colDef order, ignoring the prior move', async () => {
            // Verified branch≡latest. Complements the revert test above: after a user move, a
            // maintain=false rebuild that ALSO introduces new cols must place everything (old + new)
            // in pure colDef order — new cols are NOT group-tail/append anchored as they are under
            // maintain=true.
            const api = gridsManager.createGrid('noMaintainNewCols', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: false,
            });
            api.moveColumns(['c'], 0);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            // New col 'x' mid-defs, plus 'd' at tail — both placed by colDef order, move discarded.
            api.setGridOption('columnDefs', [
                { colId: 'a' },
                { colId: 'x' },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'd' },
            ]);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['a', 'x', 'b', 'c', 'd']);
        });

        test('maintainColumnOrder=false: removed + new col within a group follow colDef order', async () => {
            // Verified branch≡latest. A group whose membership changes (b removed, d added) under
            // maintain=false: the surviving + new cols take their declared group order, the prior
            // move of 'c' to the front is discarded.
            const api = gridsManager.createGrid('noMaintainGroup', {
                columnDefs: [{ children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }] } as ColGroupDef],
                maintainColumnOrder: false,
            });
            api.moveColumns(['c'], 0);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['c', 'a', 'b']);

            api.setGridOption('columnDefs', [
                { children: [{ colId: 'a' }, { colId: 'c' }, { colId: 'd' }] } as ColGroupDef,
            ]);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['a', 'c', 'd']);
        });

        test('maintainColumnOrder=true: multiple new flat cols scattered through defs anchor to preserved neighbours', async () => {
            // Verified branch≡latest. Several new cols (x,y,z) introduced at scattered def positions
            // after a user move: preserved cols keep the moved order (b before a), and each new col
            // anchors after its nearest preserved predecessor in colDef order.
            const api = gridsManager.createGrid('multiNew', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                maintainColumnOrder: true,
            });
            api.moveColumns(['b'], 0);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['b', 'a']);

            api.setGridOption('columnDefs', [
                { colId: 'x' },
                { colId: 'a' },
                { colId: 'y' },
                { colId: 'b' },
                { colId: 'z' },
            ]);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['b', 'a', 'x', 'y', 'z']);
        });

        test('maintainColumnOrder=true: new in-group col anchors after the highest-positioned sibling, not its tree predecessor', async () => {
            // Verified branch≡latest. Pins the exact anchor rule: a group displayed [a, c, b] (after
            // moving c left) that gains a new col z (declared last, [a,b,c,z]) places z after b — the
            // sibling with the HIGHEST preserved display position — NOT after its colDef tree
            // predecessor c (which would give a,c,z,b). Guards against a tree-predecessor-anchor
            // simplification of colsApplyPrevOrder that would silently change this.
            const api = gridsManager.createGrid('anchorRule', {
                columnDefs: [{ children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }] } as ColGroupDef],
                maintainColumnOrder: true,
            });
            api.moveColumns(['c'], 1);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['a', 'c', 'b']);

            api.setGridOption('columnDefs', [
                { children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }, { colId: 'z' }] } as ColGroupDef,
            ]);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['a', 'c', 'b', 'z']);
        });

        test('first refresh (no prior order) — cols appear in colDef order', async () => {
            const api = gridsManager.createGrid('firstRefresh', {
                columnDefs: [{ colId: 'z' }, { colId: 'y' }, { colId: 'x' }],
            });
            await new GridColumns(api, `first refresh (no prior order) — cols appear in colDef order setup`)
                .checkColumns(`
                    CENTER
                    ├── z width:200
                    ├── y width:200
                    └── x width:200
                `);
            await new GridRows(api, `first refresh (no prior order) — cols appear in colDef order setup`).check(`
                ROOT id:ROOT_NODE_ID
            `);

            // No `lastOrder` on first build → applyPrevOrder receives null → returns colsList as-is
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['z', 'y', 'x']);
            await new GridRows(api, `first refresh (no prior order) — cols appear in colDef order final state`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
        });

        test('refresh with unchanged order takes the fast path (no allocation, same instances)', async () => {
            const api = gridsManager.createGrid('fastPath', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });
            await new GridColumns(
                api,
                `refresh with unchanged order takes the fast path (no allocation, same instances) setup`
            ).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                api,
                `refresh with unchanged order takes the fast path (no allocation, same instances) setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const before = api.getAllGridColumns();

            // Trigger a refresh with no changes — fast-path: same length + same id order → returns input ref
            api.applyColumnState({ state: [{ colId: 'a', width: 200 }] });
            await new GridColumns(
                api,
                `refresh with unchanged order takes the fast path (no allocation, same instances) after applyColumnState`
            ).checkColumns(`
                CENTER
                ├── a width:200
                ├── b width:200
                └── c width:200
            `);
            await new GridRows(
                api,
                `refresh with unchanged order takes the fast path (no allocation, same instances) after applyColumnState`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const after = api.getAllGridColumns();
            // Instances must be the same (no rebuild) and order preserved
            for (let i = 0; i < before.length; ++i) {
                expect(after[i]).toBe(before[i]);
            }
        });

        test('group hasSiblings walks up multiple levels (outer group has multiple inner singletons)', async () => {
            const api = gridsManager.createGrid('walkUp', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        children: [
                            { headerName: 'L2a', children: [{ colId: 'a' }] },
                            { headerName: 'L2b', children: [{ colId: 'b' }] },
                        ],
                    },
                    { colId: 'tail' },
                ],
                maintainColumnOrder: true,
            });

            // 'a' has no direct siblings (L2a is single-child), but L2a has a sibling L2b.
            // `hasSiblings` must walk up to Outer's children to detect this — verifying the
            // iterative walk is correct. Insert a new col into L2a → should anchor to a.
            api.setGridOption('columnDefs', [
                {
                    headerName: 'Outer',
                    children: [
                        { headerName: 'L2a', children: [{ colId: 'a' }, { colId: 'a2' }] },
                        { headerName: 'L2b', children: [{ colId: 'b' }] },
                    ],
                },
                { colId: 'tail' },
            ]);

            await new GridColumns(api, 'a2 anchored to a inside L2a').checkColumns(`
                CENTER
                ├─┬ "Outer" GROUP
                │ ├─┬ "L2a" GROUP
                │ │ ├── a width:200
                │ │ └── a2 width:200
                │ └─┬ "L2b" GROUP
                │   └── b width:200
                └── tail width:200
            `);
        });

        test('service col removed then re-added — re-add lands at head (not where it was)', async () => {
            const api = gridsManager.createGrid('serviceReadd', {
                rowNumbers: true,
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                maintainColumnOrder: true,
            });
            await new GridColumns(
                api,
                `service col removed then re-added — re-add lands at head (not where it was) setup`
            ).checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(api, `service col removed then re-added — re-add lands at head (not where it was) setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                `);

            await asyncSetTimeout(0);
            expect(api.getAllGridColumns()[0].getColId()).toBe('ag-Grid-RowNumbersColumn');

            // Remove the service col entirely
            api.setGridOption('rowNumbers', false);
            await new GridColumns(
                api,
                `service col removed then re-added — re-add lands at head (not where it was) after setGridOption rowNumbers`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `service col removed then re-added — re-add lands at head (not where it was) after setGridOption rowNumbers`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);
            expect(api.getAllGridColumns().map((c: Column) => c.getColId())).toEqual(['a', 'b']);

            // Re-add — it's not in prevOrder, so applyPrevOrder routes it via servicePrepend
            api.setGridOption('rowNumbers', true);
            await new GridColumns(
                api,
                `service col removed then re-added — re-add lands at head (not where it was) after setGridOption rowNumbers #2`
            ).checkColumns(`
                LEFT
                └── ag-Grid-RowNumbersColumn width:60 !resizable !sortable suppressMovable lockPosition:left
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `service col removed then re-added — re-add lands at head (not where it was) after setGridOption rowNumbers #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);
            expect(api.getAllGridColumns()[0].getColId()).toBe('ag-Grid-RowNumbersColumn');
        });

        test('column instances are CURRENT after a colDef rebuild (no stale-instance leak)', async () => {
            // Latest's restoreColOrder held lastOrder as AgColumn[]; if cols were rebuilt with
            // new instances under the same colId, the filter retained the OLD AgColumn instances
            // and Map<AgColumn, idx> lookups missed the new ones — leaking stale instances into
            // cols.list. Branch stores lastOrder as string[] and resolves through colsById, so
            // every entry in cols.list is the current instance.
            const api = gridsManager.createGrid('staleCheck', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }],
                maintainColumnOrder: true,
            });
            await new GridColumns(
                api,
                `column instances are CURRENT after a colDef rebuild (no stale-instance leak) setup`
            ).checkColumns(`
                CENTER
                ├── a width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `column instances are CURRENT after a colDef rebuild (no stale-instance leak) setup`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const before = api.getColumn('a')!;

            // Replace with a different ColDef object for 'a' — same colId, new colDef ref.
            // The internal AgColumn may be reused or rebuilt depending on the key strategy.
            api.setGridOption('columnDefs', [{ colId: 'a', headerName: 'A!' }, { colId: 'b' }]);
            await new GridColumns(
                api,
                `column instances are CURRENT after a colDef rebuild (no stale-instance leak) after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── a "A!" width:200
                └── b width:200
            `);
            await new GridRows(
                api,
                `column instances are CURRENT after a colDef rebuild (no stale-instance leak) after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);

            const after = api.getColumn('a')!;
            const allCols = api.getAllGridColumns();

            // The column 'a' resolves to a live AgColumn (whichever instance the rewrite chose
            // to keep) and that same instance appears in the displayed cols list.
            expect(after).toBeTruthy();
            expect(allCols).toContain(after);
            // Header reflects the new colDef even on the (possibly-reused) instance.
            expect(after.getColDef().headerName).toBe('A!');
            // Sanity: instance reference is reused or rebuilt cleanly; either way it's not the
            // stale 'before' instance unless it survived the rebuild.
            if (before !== after) {
                expect(allCols).not.toContain(before);
            }
        });
    });

    describe('lastOrder per pivot mode (maintainColumnOrder)', () => {
        test('user reorder in primary mode is preserved after pivot toggle round-trip', async () => {
            const api = gridsManager.createGrid('lastOrder', {
                columnDefs: [
                    { colId: 'country', rowGroup: true },
                    { colId: 'sport', enablePivot: true },
                    { colId: 'gold', aggFunc: 'sum' },
                    { colId: 'silver', aggFunc: 'sum' },
                    { colId: 'bronze', aggFunc: 'sum' },
                ],
                rowData: [
                    { country: 'USA', sport: 'Swim', gold: 1, silver: 2, bronze: 3 },
                    { country: 'UK', sport: 'Run', gold: 4, silver: 5, bronze: 6 },
                ],
                maintainColumnOrder: true,
            });
            await new GridColumns(api, `user reorder in primary mode is preserved after pivot toggle round-trip setup`)
                .checkColumns(`
                    CENTER
                    ├── ag-Grid-AutoColumn "Group" width:200
                    ├── country width:200 rowGroup
                    ├── sport width:200
                    ├── gold width:200 aggFunc:sum
                    ├── silver width:200 aggFunc:sum
                    └── bronze width:200 aggFunc:sum
                `);
            await new GridRows(api, `user reorder in primary mode is preserved after pivot toggle round-trip setup`)
                .check(`
                    ROOT id:ROOT_NODE_ID
                    └─┬ LEAF_GROUP collapsed id:row-group-country- ag-Grid-AutoColumn:"(Blanks)" gold:null silver:null bronze:null
                    · ├── LEAF hidden id:0
                    · └── LEAF hidden id:1
                `);
            await asyncSetTimeout(0);

            api.moveColumns(['bronze'], 0);
            await new GridColumns(
                api,
                `user reorder in primary mode is preserved after pivot toggle round-trip after moveColumns`
            ).checkColumns(`
                CENTER
                ├── bronze width:200 aggFunc:sum
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200
                ├── gold width:200 aggFunc:sum
                └── silver width:200 aggFunc:sum
            `);
            await asyncSetTimeout(0);
            const primaryOrderBefore = api
                .getAllDisplayedColumns()
                .map((c) => c.getColId())
                .filter((id) => !id.startsWith('ag-Grid'));
            expect(primaryOrderBefore[0]).toBe('bronze');

            api.setGridOption('pivotMode', true);
            await new GridColumns(
                api,
                `user reorder in primary mode is preserved after pivot toggle round-trip after setGridOption pivotMode`
            ).checkColumns(`
                CENTER
                ├── bronze width:200 aggFunc:sum
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── gold width:200 aggFunc:sum
                └── silver width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `user reorder in primary mode is preserved after pivot toggle round-trip after setGridOption pivotMode`
            ).check(`
                ROOT id:ROOT_NODE_ID bronze:null gold:null silver:null
                └─┬ LEAF_GROUP collapsed id:row-group-country- bronze:null ag-Grid-AutoColumn:"(Blanks)" gold:null silver:null
                · ├── LEAF hidden id:0
                · └── LEAF hidden id:1
            `);
            await asyncSetTimeout(0);
            api.setGridOption('pivotMode', false);
            await new GridColumns(
                api,
                `user reorder in primary mode is preserved after pivot toggle round-trip after setGridOption pivotMode #2`
            ).checkColumns(`
                CENTER
                ├── bronze width:200 aggFunc:sum
                ├── ag-Grid-AutoColumn "Group" width:200
                ├── country width:200 rowGroup
                ├── sport width:200
                ├── gold width:200 aggFunc:sum
                └── silver width:200 aggFunc:sum
            `);
            await new GridRows(
                api,
                `user reorder in primary mode is preserved after pivot toggle round-trip after setGridOption pivotMode #2`
            ).check(`
                ROOT id:ROOT_NODE_ID
                └─┬ LEAF_GROUP collapsed id:row-group-country- bronze:null ag-Grid-AutoColumn:"(Blanks)" gold:null silver:null
                · ├── LEAF hidden id:0
                · └── LEAF hidden id:1
            `);
            await asyncSetTimeout(0);

            const primaryOrderAfter = api
                .getAllDisplayedColumns()
                .map((c) => c.getColId())
                .filter((id) => !id.startsWith('ag-Grid'));

            expect(primaryOrderAfter).toEqual(primaryOrderBefore);
        });
    });

    describe('locked columns + maintainColumnOrder + new cols', () => {
        test('lockPosition cols stay locked when new cols added via setGridOption', async () => {
            const api = gridsManager.createGrid('lockedMaintain', {
                columnDefs: [
                    { colId: 'leftLock', lockPosition: 'left' },
                    { colId: 'a' },
                    { colId: 'b' },
                    { colId: 'rightLock', lockPosition: 'right' },
                ],
                maintainColumnOrder: true,
            });
            await new GridColumns(api, `lockPosition cols stay locked when new cols added via setGridOption setup`)
                .checkColumns(`
                    CENTER
                    ├── leftLock width:200 lockPosition:left
                    ├── a width:200
                    ├── b width:200
                    └── rightLock width:200 lockPosition:right
                `);
            await new GridRows(api, `lockPosition cols stay locked when new cols added via setGridOption setup`).check(
                `
                    ROOT id:ROOT_NODE_ID
                `
            );
            await asyncSetTimeout(0);

            api.moveColumns(['b'], 1);
            await new GridColumns(
                api,
                `lockPosition cols stay locked when new cols added via setGridOption after moveColumns`
            ).checkColumns(`
                CENTER
                ├── leftLock width:200 lockPosition:left
                ├── b width:200
                ├── a width:200
                └── rightLock width:200 lockPosition:right
            `);
            await asyncSetTimeout(0);

            const orderBefore = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(orderBefore[0]).toBe('leftLock');
            expect(orderBefore[orderBefore.length - 1]).toBe('rightLock');

            api.setGridOption('columnDefs', [
                { colId: 'leftLock', lockPosition: 'left' },
                { colId: 'a' },
                { colId: 'b' },
                { colId: 'c' },
                { colId: 'rightLock', lockPosition: 'right' },
            ]);
            await new GridColumns(
                api,
                `lockPosition cols stay locked when new cols added via setGridOption after setGridOption columnDefs`
            ).checkColumns(`
                CENTER
                ├── leftLock width:200 lockPosition:left
                ├── b width:200
                ├── a width:200
                ├── c width:200
                └── rightLock width:200 lockPosition:right
            `);
            await new GridRows(
                api,
                `lockPosition cols stay locked when new cols added via setGridOption after setGridOption columnDefs`
            ).check(`
                ROOT id:ROOT_NODE_ID
            `);
            await asyncSetTimeout(0);

            const orderAfter = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(orderAfter[0]).toBe('leftLock');
            expect(orderAfter[orderAfter.length - 1]).toBe('rightLock');
            expect(orderAfter).toContain('c');
        });
    });

    describe('applyPrevOrder edge cases (maintainColumnOrder)', () => {
        test('all cols replaced (no preserved anchors) keeps freshly-emitted order', async () => {
            const api = gridsManager.createGrid('allReplaced', {
                columnDefs: [{ colId: 'a' }, { colId: 'b' }, { colId: 'c' }],
                maintainColumnOrder: true,
            });
            await asyncSetTimeout(0);

            api.moveColumns(['c'], 0);
            await asyncSetTimeout(0);

            api.setGridOption('columnDefs', [{ colId: 'x' }, { colId: 'y' }, { colId: 'z' }]);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            expect(order).toEqual(['x', 'y', 'z']);

            await new GridColumns(api, 'all replaced — fresh order kept').checkColumns(`
                CENTER
                ├── x width:200
                ├── y width:200
                └── z width:200
            `);
        });

        test('new sibling col joins the group via the multi-level ancestor walk', async () => {
            const api = gridsManager.createGrid('multiLevelAnchor', {
                columnDefs: [
                    {
                        headerName: 'Outer',
                        children: [{ headerName: 'Inner', children: [{ colId: 'a' }, { colId: 'b' }] }, { colId: 'c' }],
                    },
                    { colId: 'd' },
                ],
                maintainColumnOrder: true,
            });
            await asyncSetTimeout(0);

            api.moveColumns(['d'], 0);
            await asyncSetTimeout(0);

            api.setGridOption('columnDefs', [
                {
                    headerName: 'Outer',
                    children: [
                        { headerName: 'Inner', children: [{ colId: 'a' }, { colId: 'b' }, { colId: 'b2' }] },
                        { colId: 'c' },
                    ],
                },
                { colId: 'd' },
            ]);
            await asyncSetTimeout(0);

            const order = api.getAllDisplayedColumns().map((c) => c.getColId());
            const b = order.indexOf('b');
            const b2 = order.indexOf('b2');
            const c = order.indexOf('c');
            expect(b).toBeGreaterThanOrEqual(0);
            expect(b2).toBeGreaterThanOrEqual(0);
            expect(c).toBeGreaterThanOrEqual(0);
            expect(b2).toBeGreaterThan(b);
            expect(b2).toBeLessThan(c);

            await new GridColumns(api, 'new sibling placed via ancestor walk').checkColumns(`
                CENTER
                ├── d width:200
                └─┬ "Outer" GROUP
                  ├─┬ "Inner" GROUP
                  │ ├── a width:200
                  │ ├── b width:200
                  │ └── b2 width:200
                  └── c width:200
            `);
        });
    });
});
